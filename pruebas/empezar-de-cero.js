// Solo datos ficticios. Ninguna prueba lee la plantilla privada ni la bóveda real.
if(process.argv.includes('--edge'))process.env.PW_CHANNEL='msedge';
const {start,create,seed,assert,fs,path}=require('./helpers');
const crypto=require('node:crypto');
const folder=path.join(__dirname,'resultados-empezar-de-cero');fs.mkdirSync(folder,{recursive:true});
const template={app:'mis-finanzas-plantilla',v:1,
 accounts:Array.from({length:13},(_,i)=>({name:'Cuenta ficticia '+i,type:i===11?'porpagar':i>8?'tarjeta':i===0?'efectivo':'banco',currency:i===8?'USD':'PEN'})),
 cats:{gasto:Object.fromEntries(Array.from({length:11},(_,i)=>[i===0?'ALIMENTACIÓN':'Gasto ficticio '+i,Array.from({length:i<8?3:2},(_,j)=>'Sub nueva '+j)])),ingreso:{'Ingreso ficticio':['Uno','Dos','Tres','Cuatro','Cinco'],'Otro ingreso':['Uno','Dos','Tres','Cuatro','Cinco']}},
 people:Array.from({length:8},(_,i)=>({name:'Persona ficticia '+i,kind:i===0?'empresa':'persona'})),
 favorites:Array.from({length:5},(_,i)=>({name:'Favorito ficticio '+i,template:{kind:'gasto',acc:'Cuenta ficticia 0',cat:'ALIMENTACIÓN',sub:'Sub nueva 0',note:'Ejemplo'},fixedAmount:false}))};
const payload=raw=>({name:'plantilla-ficticia.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(raw))});
const sha=t=>crypto.createHash('sha1').update('blob '+Buffer.byteLength(t)+'\0'+t).digest('hex');
function remote(){const store={file:null,sha:null,puts:0,offline:false};return {store,mock:async r=>{if(store.offline)return r.abort();const req=r.request(),method=req.method();
 const send=(status,body)=>r.fulfill({status,contentType:'application/json',body:typeof body==='string'?body:JSON.stringify(body)});
 if(!new URL(req.url()).pathname.endsWith('/contents/vault.json'))return send(200,{private:true});
 if(method==='GET')return send(store.file?200:404,store.file||{});
 if(method==='PUT'){const d=req.postDataJSON();if(store.file&&d.sha!==store.sha)return send(409,{});store.file=Buffer.from(d.content,'base64').toString('utf8');store.sha=sha(store.file);store.puts++;return send(200,{content:{sha:store.sha}});}
 return send(400,{});}};}
const flush=async p=>{await p.waitForFunction(()=>!SYNC.busy);return p.evaluate(async()=>{clearTimeout(saveTimer);await persist();clearTimeout(SYNC.timer);await syncNow();clearTimeout(SYNC.timer);if(SYNC.st!=='ok')throw Error(SYNC.msg||SYNC.st);});};
async function openReset(p){await p.evaluate(()=>{ui.tab='ajustes';render();});await p.click('[data-act=startOver]');}
async function perform(p,raw=template){await openReset(p);if(raw)await p.setInputFiles('#resetFile',payload(raw));await p.fill('#resetConfirm','BORRAR');await p.waitForFunction(()=>!document.querySelector('#resetGo').disabled);
 const downloading=p.waitForEvent('download');await p.click('#resetGo');const d=await downloading;const file=await d.path();assert(!await d.failure());const vault=JSON.parse(fs.readFileSync(file,'utf8'));assert.equal(vault.app,'mis-finanzas');assert(!JSON.stringify(vault).includes('Persona ficticia'));
 await p.waitForSelector('#resetAccounts');return vault;}
async function check(p){const s=await p.evaluate(()=>({accounts:S.accounts,cats:S.cats,people:S.people,favorites:S.favorites,tx:S.tx,recurring:S.recurring}));
 assert.equal(s.accounts.length,13);assert(s.accounts.every(a=>a.initial===0&&!a.debt&&!a.checkedAt));assert.equal(s.tx.length,0);assert.equal(s.people.length,8);assert.equal(s.favorites.length,5);assert.equal(s.recurring.length,0);assert.deepEqual(s.cats,template.cats);
 assert(s.favorites.every(f=>s.accounts.some(a=>a.id===f.template.acc)));}
(async()=>{const env=await start();try{
 // Protecciones y capturas en ambos tamaños y temas.
 for(const width of [384,1280])for(const colorScheme of ['light','dark']){const p=await env.page({viewport:{width,height:900},colorScheme});await create(p);await seed(p);await openReset(p);
 assert(await p.isDisabled('#resetGo'));await p.fill('#resetConfirm','borrar');assert(await p.isDisabled('#resetGo'));
 await p.setInputFiles('#resetFile',payload({app:'otro',v:1}));assert.match(await p.textContent('#resetErr'),/plantilla válida/);await p.fill('#resetConfirm','BORRAR');assert(await p.isDisabled('#resetGo'));
 await p.setInputFiles('#resetFile',payload(template));await p.waitForFunction(()=>!document.querySelector('#resetGo').disabled);assert.match(await p.textContent('#resetSummary'),/13 cuentas.*11 categorías de gasto \(30 subcategorías\).*8 personas.*5 favoritos/);
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.screenshot({path:path.join(folder,`${width}-${colorScheme}-confirmacion.png`),fullPage:false,animations:'disabled'});
 const before=await p.evaluate(()=>JSON.stringify(S));await p.evaluate(()=>{window.realBackup=doBackup;doBackup=async()=>{throw Error('Fallo de respaldo simulado');};});await p.click('#resetGo');await p.waitForFunction(()=>document.querySelector('#resetErr').textContent.includes('No se borró nada'));assert.equal(await p.evaluate(()=>JSON.stringify(S)),before);
 await p.evaluate(()=>{doBackup=window.realBackup;window.realDownload=download;download=async()=>{throw Error('Fallo de descarga');};});await p.click('#resetGo');await p.waitForFunction(()=>document.querySelector('#resetErr').textContent.includes('Fallo de descarga'));assert.equal(await p.evaluate(()=>JSON.stringify(S)),before);
 await p.evaluate(()=>{download=window.realDownload;});await p.click('#resetCancel');await perform(p);await check(p);await p.screenshot({path:path.join(folder,`${width}-${colorScheme}-listo.png`),fullPage:false,animations:'disabled'});await p.click('#resetAccounts');assert.equal(await p.evaluate(()=>ui.tab),'cuentas');await p.context().close();}
 console.log('BORRAR, archivo inválido, respaldo fallido, descarga fallida, plantilla y capturas 384/1280 claro/oscuro: correctos.');
 // El marcador de reemplazo también retira registros antiguos desconocidos por A.
 {const p=await env.page();await create(p);await seed(p);await perform(p);const result=await p.evaluate(()=>{const old=blankState();old.tx=[{id:'unseen',acc:'unknown-old',amount:1,type:'gasto',date:nowLocal(),u:1}];return mergeStates(S,old);});assert(!result.tx.some(t=>t.id==='unseen'));assert.equal(result.del.unseen,Number.MAX_SAFE_INTEGER);await p.context().close();}
 for(const old of [false,true]){const {store,mock}=remote(),A=await env.page({viewport:{width:1280,height:900}}),B=await env.page({viewport:{width:384,height:854}});
 if(old){await B.route(env.url,r=>r.fulfill({contentType:'text/html; charset=utf-8',body:fs.readFileSync(path.join(__dirname,'resultados-etapa-b/base-antes-empezar.html'),'utf8')}));await B.reload();}
 for(const p of [A,B])await p.context().route('https://api.github.com/**',mock);
 await create(A);await seed(A);await A.evaluate(async()=>{S.people=[{id:'old-person',name:'Persona anterior',kind:'persona'}];S.favorites=[{id:'old-fav',name:'Viejo',template:{kind:'gasto',acc:'cash'}}];S.recurring=[{id:'old-rec',name:'Viejo'}];S.tx=[{id:'old-tx',date:nowLocal(),type:'gasto',acc:'cash',amount:5,cat:'ALIMENTACIÓN'}];acc('bank').checkedAt=nowLocal();S.settings.budgets={ALIMENTACIÓN:100,ANTIGUA:20};S.sync={owner:'ficticio',repo:'ficticio',token:'token-ficticio'};await persist();});await flush(A);
 await B.evaluate(async vault=>{const r=await openVault(vault,'solo-pruebas-123');KEY=r.key;SALT=r.salt;S=r.data;S.sync={owner:'ficticio',repo:'ficticio',token:'token-ficticio'};SNAP=null;takeSnap();await persistLocalOnly();enterApp();clearTimeout(SYNC.timer);},JSON.parse(store.file));await flush(B);
 const oldIds=await A.evaluate(()=>COLS.flatMap(c=>(S[c]||[]).map(e=>e.id))),salt=await A.evaluate(()=>b64(SALT));
 await A.clock.setFixedTime(new Date('2026-11-09T17:10:00Z'));await perform(A);await check(A);await A.click('#resetAccounts');await B.clock.setFixedTime(new Date('2026-11-09T17:11:00Z'));
 // Un gasto y una edición tardía del equipo desactualizado no reviven la cuenta.
 await B.evaluate(async()=>{acc('cash').initial=999;S.tx.push({id:'late-expense',date:nowLocal(),type:'gasto',acc:'cash',amount:3,cat:'ALIMENTACIÓN',note:'Pendiente ficticio'});await persist();clearTimeout(SYNC.timer);});await flush(B);await flush(A);await flush(B);await flush(A);
 for(const p of [A,B]){assert.equal(await p.evaluate(ids=>S.accounts.some(a=>ids.includes(a.id)),oldIds),false);assert.equal(await p.evaluate(()=>S.accounts.length),13);assert.equal(await p.evaluate(()=>S.tx.some(t=>t.id==='old-tx')),false);assert.equal(await p.evaluate(()=>S.tx.some(t=>t.id==='late-expense')),true);}
 assert.deepEqual(await A.evaluate(()=>S.cats),template.cats);assert.match(await A.textContent('#view'),/cuenta eliminada/);
 if(old){const obsolete=await B.evaluate(()=>S.cats.gasto.ALIMENTACIÓN.includes('MENÚ'));assert(obsolete,'Se documenta el límite de la mezcla antigua');await B.unroute(env.url);await B.reload();await B.fill('#pwo','solo-pruebas-123');await B.click('#btnOpen');await B.waitForSelector('#app:not(.hidden)');await flush(B);console.log('Versión anterior: cuentas borradas no vuelven; subcategorías se corrigen al reabrir la versión nueva (límite informado en pantalla).');}
 await flush(A);await flush(B);assert.deepEqual(await B.evaluate(()=>S.cats),template.cats);assert.equal(await A.evaluate(()=>b64(SALT)),salt);
 assert.equal(await A.evaluate(()=>S.settings.budgets.ANTIGUA),undefined);assert.equal(await A.evaluate(()=>S.sync.token),'token-ficticio');
 const saved=await A.evaluate(()=>JSON.parse(lsGet(VAULT_KEY)));await A.evaluate(async v=>{await openVault(v,'solo-pruebas-123');},saved);
 // Se puede corregir el gasto pendiente desde la interfaz.
 await A.clock.setFixedTime(new Date('2026-11-09T17:11:30Z'));await A.evaluate(()=>{ui.tab='movs';render();});await A.click('[data-act=editTx][data-id=late-expense]');await A.selectOption('#fAcc',{label:'Cuenta ficticia 0'});await A.click('[data-c="ALIMENTACIÓN"]');await A.click('#fSave');await A.waitForSelector('#fSave',{state:'detached'});await flush(A);await flush(B);assert.equal(await A.evaluate(()=>S.tx.filter(t=>!acc(t.acc)).length),0);
 await A.clock.setFixedTime(new Date('2026-11-09T17:12:00Z'));await A.evaluate(async()=>{S.cats.gasto.ALIMENTACIÓN.push('Nueva posterior');await persist();});await flush(A);await flush(B);assert((await B.evaluate(()=>S.cats.gasto.ALIMENTACIÓN)).includes('Nueva posterior'));
 // Un segundo comienzo, sin plantilla, y sin internet conserva la conexión.
 store.offline=true;await perform(A,null);assert.equal(await A.evaluate(()=>S.accounts.length),1);assert.equal(await A.evaluate(()=>S.tx.length),0);assert.equal(await A.evaluate(()=>S.sync.token),'token-ficticio');assert.match(await A.textContent('#modalRoot'),/Falta sincronizar/);store.offline=false;await flush(A);await flush(B);assert.equal(await B.evaluate(()=>S.accounts.length),1);assert.equal(await B.evaluate(()=>S.tx.length),0);
 assert(!store.file.includes('token-ficticio'));console.log(`Dos equipos (${old?'anterior → actual':'actuales'}): tombstones, gasto pendiente editable, categorías, contraseña, sincronización, sin plantilla y sin internet: correctos.`);await A.context().close();await B.context().close();}
 assert.deepEqual(env.errors,[]);console.log('Empezar de cero: todas las comprobaciones finalizadas.');
 }finally{await env.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
