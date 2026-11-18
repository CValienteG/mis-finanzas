// Solo datos ficticios y GitHub simulado. No lee privado/ ni una bóveda real.
if(process.argv.includes('--edge'))process.env.PW_CHANNEL='msedge';
const {start,create,assert,fs,path}=require('./helpers');
const crypto=require('node:crypto');
const folder=path.join(__dirname,'resultados-saldos-iniciales');fs.mkdirSync(folder,{recursive:true});
const accounts=Array.from({length:13},(_,i)=>({id:'a'+i,name:'Cuenta ficticia '+i,
  type:i===12?'porpagar':i>=9?'tarjeta':i===0?'efectivo':i===6?'ahorro':'banco',
  currency:i===7||i===8?'USD':'PEN',initial:0,archived:false,custom:'conservar',u:1}));
const data={app:'mis-finanzas-saldos',v:1,fecha:'2026-11-18',cuentas:accounts.map((a,i)=>({name:a.name,
  ...(i===12?{debes:12000,cuota:520,cuotasFaltan:24,pago:2,tea:null}:i>=9?{debes:850+(i-9)*100,linea:5000,corte:20,pago:5,minimo:null}:{saldo:i===8?0:100+i*10})}))};
const template={app:'mis-finanzas-plantilla',v:1,accounts:accounts.map(({name,type,currency})=>({name,type,currency})),cats:{gasto:{NUEVA:[]},ingreso:{NUEVO:[]}},people:[],favorites:[]};
const payload=raw=>({name:'saldos-ficticios.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(raw))});
const sha=t=>crypto.createHash('sha1').update('blob '+Buffer.byteLength(t)+'\0'+t).digest('hex');
function remote(){const store={file:null,sha:null,puts:0,offline:false,failPut:false};return {store,mock:async r=>{
  const req=r.request(),send=(status,body)=>r.fulfill({status,contentType:'application/json',body:typeof body==='string'?body:JSON.stringify(body)});
  if(store.offline)return r.abort();
  if(req.headers().authorization!=='Bearer ficticio')return send(401,{});
  if(!new URL(req.url()).pathname.endsWith('/contents/vault.json'))return send(200,{private:true});
  if(req.method()==='GET')return send(store.file?200:404,store.file||{});
  if(req.method()==='PUT'){if(store.failPut)return send(403,{});const d=req.postDataJSON();if(store.file&&d.sha!==store.sha)return send(409,{});
    store.file=Buffer.from(d.content,'base64').toString('utf8');store.sha=sha(store.file);store.puts++;return send(200,{content:{sha:store.sha}});}
  return send(400,{});
}};}
async function flush(p){await p.waitForFunction(()=>!SYNC.busy);await p.evaluate(async()=>{clearTimeout(saveTimer);await persist();clearTimeout(SYNC.timer);await syncNow();clearTimeout(SYNC.timer);if(SYNC.st!=='ok')throw Error(SYNC.msg||SYNC.st);});}
async function setup(env,opts={}){const p=await env.page(opts),server=remote();await p.context().route('https://api.github.com/**',server.mock);await create(p);
  await p.evaluate(async aa=>{S=blankState();S.accounts=aa;S.settings={...S.settings,tc:3.4,autolock:0,hideSetup:true};
    S.people=[{id:'p',name:'Persona ficticia',kind:'persona',custom:1}];S.favorites=[{id:'f',name:'Favorito ficticio',template:{kind:'gasto',acc:'a0',cat:'SALUD'}}];
    S.recurring=[{id:'r',name:'Repetido ficticio'}];S.fixed=[{id:'fix',name:'Fijo',amount:10,day:5}];
    S.sync={owner:'ficticio',repo:'ficticio',token:'ficticio'};SNAP=null;takeSnap();await persist();render();},accounts);
  await flush(p);return {p,...server};}
async function choose(p,raw=data){await p.evaluate(()=>{ui.tab='ajustes';render();});await p.click('[data-act=loadBalances]');await p.setInputFiles('#balancesFile',payload(raw));
  await p.waitForFunction(()=>document.querySelector('#balancesErr').textContent||!document.querySelector('#balancesApply').disabled);}
async function apply(p){const downloading=p.waitForEvent('download');await p.click('#balancesApply');const d=await downloading;assert(!await d.failure());
  const vault=JSON.parse(fs.readFileSync(await d.path(),'utf8'));assert.equal(vault.app,'mis-finanzas');assert(!JSON.stringify(vault).includes('Cuenta ficticia'));
  await p.waitForSelector('#balancesDone');return vault;}
async function disconnect(p){await p.evaluate(()=>{closeModal();ui.tab='sync';render();});await p.click('[data-act=disconnectSync]');await p.click('#askOk');await p.waitForFunction(()=>!S.sync);}
async function reconnect(p){await p.click('[data-act=connectSync]');await p.fill('#cOwner','ficticio');await p.fill('#cRepo','ficticio');await p.fill('#cTok','ficticio');await p.click('#cOk');await p.waitForFunction(()=>SYNC.st==='ok'&&!SYNC.busy);}
async function reset(p){await p.evaluate(()=>{ui.tab='ajustes';render();});await p.click('[data-act=startOver]');await p.setInputFiles('#resetFile',payload(template));await p.fill('#resetConfirm','BORRAR');await p.waitForFunction(()=>!document.querySelector('#resetGo').disabled);await p.click('#resetGo');}
(async()=>{const env=await start();try{
  for(const width of [360,1280])for(const colorScheme of ['light','dark']){
    const {p,store}=await setup(env,{viewport:{width,height:900},colorScheme});
    // Cero gris; deuda positiva roja, tanto en Inicio como en Cuentas.
    for(const tab of ['resumen','cuentas']){await p.evaluate(t=>{ui.tab=t;render();},tab);const debt=p.locator(tab==='resumen'?'.minis.plain>div:nth-child(2) b':'.statgrid>.stat:nth-child(2) b');assert(await debt.evaluate(e=>e.classList.contains('muted')&&!e.classList.contains('neg')));}
    const before=await p.evaluate(()=>({tx:S.tx,cats:S.cats,people:S.people,favorites:S.favorites,recurring:S.recurring,fixed:S.fixed}));
    await choose(p);assert.equal(await p.locator('#balancesPreview tbody tr').count(),13);const plan=await p.evaluate(d=>initialBalancesPlan(d),data);
    assert.equal(plan.act,1488);assert.equal(plan.pas,14850);assert.match(await p.textContent('#balancesPreview'),/1,488.00/);assert.match(await p.textContent('#balancesPreview'),/14,850.00/);
    assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await p.locator('#modalRoot .modal').screenshot({path:path.join(folder,`${width}-${colorScheme}-previa.png`),animations:'disabled'});
    const backup=await apply(p),now=await p.evaluate(()=>({tx:S.tx,cats:S.cats,people:S.people,favorites:S.favorites,recurring:S.recurring,fixed:S.fixed}));assert.deepEqual(now,before);
    const saved=await p.evaluate(v=>openVault(v,'solo-pruebas-123').then(r=>r.data),backup);assert(saved.accounts.every(a=>a.initial===0));
    assert.deepEqual(await p.evaluate(()=>balances()),Object.fromEntries(plan.rows.map(r=>[r.id,r.after])));
    assert.deepEqual(await p.evaluate(()=>{const {act,pas}=netWorth();return {act,pas};}),{act:plan.act,pas:plan.pas});
    assert(await p.evaluate(()=>loanInfo(acc('a12')).ok));assert.equal(await p.evaluate(()=>acc('a12').debt.cuotasRest),24);
    assert(await p.evaluate(()=>S.accounts.every(a=>a.u>1&&a.custom==='conservar')));assert.match(await p.textContent('#modalRoot'),/Saldos cargados en 13 cuentas.*Tu celular los verá al sincronizar/s);
    await p.screenshot({path:path.join(folder,`${width}-${colorScheme}-listo.png`),animations:'disabled'});await p.click('#balancesDone');
    for(const tab of ['resumen','cuentas']){await p.evaluate(t=>{ui.tab=t;render();},tab);const debt=p.locator(tab==='resumen'?'.minis.plain>div:nth-child(2) b':'.statgrid>.stat:nth-child(2) b');assert(await debt.evaluate(e=>e.classList.contains('neg')));}
    // El equipo con el código publicado anterior recibe las cuentas sin perder campos.
    const B=await env.page();await B.route(env.url,r=>r.fulfill({contentType:'text/html; charset=utf-8',body:fs.readFileSync(path.join(__dirname,'base-saldos-426e95e.html'),'utf8')}));await B.reload();await B.context().route('https://api.github.com/**',remoteWithStore(store));
    await B.evaluate(async v=>{const r=await openVault(v,'solo-pruebas-123');S=r.data;KEY=r.key;SALT=r.salt;S.sync={owner:'ficticio',repo:'ficticio',token:'ficticio'};SNAP=null;takeSnap();enterApp();clearTimeout(SYNC.timer);},JSON.parse(store.file));
    await B.evaluate(async()=>{S.accounts[0].name+=' editada';await persist();clearTimeout(SYNC.timer);});await flush(B);await flush(p);assert.equal(await p.evaluate(()=>acc('a9').initial),-850);assert(await p.evaluate(()=>loanInfo(acc('a12')).ok));
    await p.context().close();await B.context().close();
  }
  console.log('13 cuentas: saldos, totales, respaldo cifrado, campos conservados, versión anterior y capturas 360/1280 claro/oscuro: correctos.');
  for(const width of [360,1280])for(const colorScheme of ['light','dark']){
    const {p,store}=await setup(env,{viewport:{width,height:900},colorScheme}),usd={...data,cuentas:[{...data.cuentas[9],debesUSD:20.15},{...data.cuentas[10],debesUSD:12.34}]};
    await choose(p,usd);assert.match((await p.textContent('#balancesPreview')).replace(/\s/g,' '),/850.00 \+ USD 20.15 \(≈ S\/ 68.51\) = S\/ 918.51/);
    assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert(await p.locator('#balancesPreview td').evaluateAll(cells=>cells.every(e=>e.scrollWidth<=e.clientWidth+1)));await p.locator('#modalRoot .modal').screenshot({path:path.join(folder,`${width}-${colorScheme}-dolares.png`),animations:'disabled'});
    const plan=await p.evaluate(d=>initialBalancesPlan(d),usd);await apply(p);assert.equal(await p.evaluate(()=>r2(balances().a9)),-918.51);assert.equal(await p.evaluate(()=>r2(balances().a10)),-991.96);assert.equal(await p.evaluate(()=>r2(netWorth().pas)),plan.pas);
    assert.equal(await p.evaluate(()=>S.tx.length),2);assert.equal(await p.evaluate(()=>S.accounts.length),13);assert(await p.evaluate(()=>S.tx.every(t=>t.kind==='ajuste'&&t.type==='transfer'&&!t.cat&&t.note==='Saldo inicial en dólares')));
    assert.equal(await p.evaluate(()=>monthTotals('2026-11').gas),0);assert.equal(await p.evaluate(()=>monthTotals('2026-11').ing),0);assert.equal(await p.evaluate(()=>S.tx.reduce((sum,t)=>sum+expensePen(t)+incomePen(t),0)),0);
    await p.click('#balancesDone');await p.evaluate(()=>{ui.tab='movs';render();});assert.match(await p.textContent('#view'),/Saldo inicial en dólares/);assert.match(await p.textContent('#view'),/USD\s20.15/);
    await p.click('[data-act=editTx][data-id=saldo-usd-a9]');assert.match(await p.textContent('#modalRoot'),/Tipo de cambio al cargar: 3.4/);await p.click('#usdClose');
    const ids=await p.evaluate(()=>S.tx.map(t=>t.id));await choose(p,usd);await apply(p);assert.deepEqual(await p.evaluate(()=>S.tx.map(t=>t.id)),ids);assert.equal(await p.evaluate(()=>S.tx.length),2);assert.equal(await p.evaluate(()=>r2(balances().a9)),-918.51);await p.click('#balancesDone');
    // Una versión anterior conserva el efecto en soles y el monto original USD.
    const B=await env.page();await B.route(env.url,r=>r.fulfill({contentType:'text/html; charset=utf-8',body:fs.readFileSync(path.join(__dirname,'base-saldos-426e95e.html'),'utf8')}));await B.reload();await B.context().route('https://api.github.com/**',remoteWithStore(store));
    await B.evaluate(async v=>{const r=await openVault(v,'solo-pruebas-123');S=r.data;KEY=r.key;SALT=r.salt;S.sync={owner:'ficticio',repo:'ficticio',token:'ficticio'};SNAP=null;takeSnap();enterApp();clearTimeout(SYNC.timer);},JSON.parse(store.file));
    assert.equal(await B.evaluate(()=>r2(balances().a9)),-918.51);assert.equal(await B.evaluate(()=>monthTotals('2026-11').gas),0);await B.evaluate(async()=>{acc('a0').name+=' editada';await persist();clearTimeout(SYNC.timer);});await flush(B);await flush(p);
    assert.equal(await p.evaluate(()=>S.tx.find(t=>t.acc==='a9').openingUSD.amount),20.15);assert.equal(await p.evaluate(()=>r2(balances().a9)),-918.51);await B.context().close();
    // Omitir debesUSD mantiene el registro; cero lo actualiza sin duplicarlo.
    await choose(p,{...usd,cuentas:[{name:accounts[9].name,debes:700}]});await apply(p);assert.equal(await p.evaluate(()=>r2(balances().a9)),-768.51);assert.equal(await p.evaluate(()=>S.tx.length),2);await p.click('#balancesDone');
    await choose(p,{...usd,cuentas:[{name:accounts[9].name,debesUSD:0}]});await apply(p);assert.equal(await p.evaluate(()=>r2(balances().a9)),-700);assert.equal(await p.evaluate(()=>S.tx.length),2);await p.context().close();
  }
  console.log('Dólares en la misma tarjeta: vista previa, un ajuste por tarjeta, sin gasto ni ingreso, recarga sin duplicados, omisión, cero y compatibilidad anterior: correctos.');
  {const {p,store}=await setup(env);
    // La tarjeta queda igual que al rellenar el formulario a mano.
    await p.evaluate(()=>accountForm('tarjeta'));await p.fill('#aName','TARJETA MANUAL');await p.fill('#aBal','850');await p.fill('#dLim','5000');await p.fill('#dCut','20');await p.fill('#dDue','5');await p.click('#aSave');await flush(p);
    await choose(p,{...data,cuentas:[data.cuentas[9]]});await apply(p);
    assert.deepEqual(await p.evaluate(()=>{const a=acc('a9'),b=S.accounts.find(a=>a.name==='TARJETA MANUAL');return [a.initial,b.initial,a.debt.limit,b.debt.limit,a.debt.cutDay,b.debt.cutDay,a.debt.dueDay,b.debt.dueDay];}),[-850,-850,5000,5000,20,20,5,5]);
    await p.click('#balancesDone');
    // Efectos de gastos, transferencias y partes extra, y omisiones por campo.
    await p.evaluate(async()=>{S.tx=[{id:'expense',type:'gasto',acc:'a0',amount:50,date:nowLocal(),cat:'SALUD'}];acc('a9').debt.minimum=45;await persist();});await flush(p);
    await choose(p,{...data,cuentas:[{name:accounts[0].name,saldo:1000},{name:accounts[9].name,linea:6000,minimo:null}]});await apply(p);
    assert.equal(await p.evaluate(()=>acc('a0').initial),1050);assert.equal(await p.evaluate(()=>balances().a0),1000);assert.equal(await p.evaluate(()=>S.tx.length),1);assert.equal(await p.evaluate(()=>acc('a9').initial),-850);assert.equal(await p.evaluate(()=>acc('a9').debt.minimum),45);assert.equal(await p.evaluate(()=>acc('a9').debt.limit),6000);await p.click('#balancesDone');
    await p.evaluate(async()=>{S.tx.push({id:'transfer',type:'transfer',acc:'a0',to:'a1',amount:10,toAmount:10,date:nowLocal(),legs:[{acc:'a0',amount:2}]});await persist();});await flush(p);
    await choose(p,{...data,cuentas:[{name:accounts[0].name,saldo:1000},{name:accounts[1].name,saldo:500}]});await apply(p);assert.equal(await p.evaluate(()=>balances().a0),1000);assert.equal(await p.evaluate(()=>balances().a1),500);await p.click('#balancesDone');
    const before=await p.evaluate(()=>canon(S));
    for(const bad of [{...data,cuentas:[data.cuentas[0],{name:'Inexistente',saldo:3}]},{...data,cuentas:[{name:accounts[0].name.toLowerCase(),saldo:3}]},{...data,cuentas:[data.cuentas[0],data.cuentas[0]]},{...data,cuentas:[{name:accounts[0].name,saldo:'100'}]},{...data,cuentas:[{name:accounts[9].name,debes:-3}]},{...data,fecha:'2026-02-30'},{...data,cuentas:[{name:accounts[9].name,pago:32}]}]){
      await choose(p,bad);assert(await p.isDisabled('#balancesApply'));assert(await p.textContent('#balancesErr'));assert.equal(await p.evaluate(()=>canon(S)),before);await p.click('#balancesCancel');}
    // Error antes de aplicar: 401, sin internet, sin conexión configurada.
    for(const mode of ['401','offline','off']){await choose(p,{...data,cuentas:[data.cuentas[0]]});await p.evaluate(mode=>{if(mode==='401')S.sync.token='invalido';if(mode==='off'){delete S.sync;setSync('ok');}},mode);store.offline=mode==='offline';
      const unchanged=await p.evaluate(()=>canon(S));await p.click('#balancesApply');await p.waitForFunction(()=>document.querySelector('#balancesErr').textContent.includes('Primero arregla la sincronización'));assert.equal(await p.evaluate(()=>canon(S)),unchanged);await p.click('#balancesCancel');
      store.offline=false;await p.evaluate(()=>{S.sync={owner:'ficticio',repo:'ficticio',token:'ficticio'};});await flush(p);}
    // Respaldo y almacenamiento fallidos no cambian cuentas.
    for(const fault of ['backup','storage']){await choose(p,{...data,cuentas:[data.cuentas[0]]});const unchanged=await p.evaluate(()=>JSON.stringify(S.accounts));
      await p.evaluate(fault=>{window.realBackup=doBackup;window.realLs=lsSet;if(fault==='backup')doBackup=async()=>{throw Error('respaldo simulado falló');};else lsSet=()=>false;},fault);
      await p.click('#balancesApply');await p.waitForFunction(()=>document.querySelector('#balancesErr').textContent.includes('No se aplicaron saldos'));assert.equal(await p.evaluate(()=>JSON.stringify(S.accounts)),unchanged);
      await p.evaluate(()=>{doBackup=window.realBackup;lsSet=window.realLs;});await p.click('#balancesCancel');await flush(p);}
    // Un cambio remoto entre la vista previa y Aplicar exige otra revisión.
    await choose(p,{...data,cuentas:[data.cuentas[0]]});store.file=await p.evaluate(async()=>{const r=structuredClone(S);r.accounts[0].initial+=10;r.accounts[0].u=Date.now()+1000;return JSON.stringify(await sealWith(KEY,SALT,uploadable(r)));});store.sha=sha(store.file);
    await p.click('#balancesApply');await p.waitForFunction(()=>document.querySelector('#balancesErr').textContent.includes('tabla actualizada'));assert(!await p.$('#balancesDone'));await apply(p);await p.click('#balancesDone');
    // Si falla la subida posterior, se informa que queda pendiente y se puede reintentar.
    await choose(p,{...data,cuentas:[data.cuentas[0]]});await p.evaluate(()=>{window.realDownload=download;download=async(...args)=>{await window.realDownload(...args);await window.afterBackup?.();};});await p.exposeFunction('afterBackup',()=>{store.failPut=true;});await apply(p);assert.match(await p.textContent('#modalRoot'),/falta sincronizar/);store.failPut=false;await flush(p);await p.context().close();
  }
  console.log('Formulario manual, gasto previo, transferencias, omisiones, nombres inválidos, errores de sincronización, respaldo y almacenamiento: correctos.');
  // Caso del 18-nov: el código anterior reinicia localmente pese al 401.
  for(const baseline of [true,false]){const {p,store}=await setup(env);
    if(baseline){await p.route(env.url,r=>r.fulfill({contentType:'text/html; charset=utf-8',body:fs.readFileSync(path.join(__dirname,'base-saldos-426e95e.html'),'utf8')}));await p.reload();await p.fill('#pwo','solo-pruebas-123');await p.click('#btnOpen');await p.waitForSelector('#app:not(.hidden)');await p.waitForFunction(()=>!SYNC.busy);}
    await p.evaluate(async()=>{S.tx=[{id:'old-expense',type:'gasto',acc:'a0',amount:61,date:nowLocal(),cat:'SALUD'},{id:'old-loan',kind:'prestamo_recibido',type:'transfer',acc:'a0',person:'p',amount:2500,date:nowLocal()}];await persist();});await flush(p);
    await p.clock.setFixedTime(new Date('2026-11-18T18:00:00Z'));await p.evaluate(()=>{S.sync.token='invalido';});const remoteBefore=store.file,before=await p.evaluate(()=>canon(S));await reset(p);
    if(baseline){await p.waitForSelector('#resetAccounts');assert.equal(await p.evaluate(()=>S.tx.length),0);assert.equal(store.file,remoteBefore);await disconnect(p);await reconnect(p);
      assert.equal(await p.evaluate(()=>S.tx.length),0);assert.equal(await p.evaluate(()=>peopleTotals().payable),0);assert.equal(await p.evaluate(()=>monthTotals('2026-11').gas),0);
      console.log('426e95e: reproducido el reinicio local con 401; al reconectar desde la app, los tombstones y resetEpoch impiden recuperar los S/ 61 y S/ 2,500 conocidos.');
    }else{await p.waitForFunction(()=>document.querySelector('#resetErr').textContent.includes('Primero arregla la sincronización'));assert.equal(await p.evaluate(()=>canon(S)),before);assert.equal(store.file,remoteBefore);await disconnect(p);await reconnect(p);
      // Un intento bloqueado conserva los datos. Tras repetir el reinicio conectado, no vuelven.
      assert.equal(await p.evaluate(()=>S.tx.length),2);await reset(p);await p.waitForSelector('#resetAccounts');await disconnect(p);await reconnect(p);assert.equal(await p.evaluate(()=>S.tx.length),0);assert.equal(await p.evaluate(()=>peopleTotals().payable),0);
      const result=await p.evaluate(()=>{const r=blankState();r.tx=[{id:'unseen',type:'gasto',acc:'old',amount:61,date:nowLocal(),u:1}];return mergeStates(S,r);});assert(!result.tx.length);assert.equal(result.del.unseen,Number.MAX_SAFE_INTEGER);
      console.log('Actual: 401 bloquea antes del respaldo y del cambio; después de un reinicio válido, desconectar/reconectar no devuelve los registros viejos.');}
    await p.context().close();
  }
  assert.deepEqual(env.errors,[]);console.log('Saldos iniciales: todas las comprobaciones finalizadas.');
}finally{await env.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
// Comparte el remoto simulado con un segundo equipo sin acceder a GitHub real.
function remoteWithStore(store){return async r=>{const req=r.request(),send=(status,body)=>r.fulfill({status,contentType:'application/json',body:typeof body==='string'?body:JSON.stringify(body)});
  if(req.headers().authorization!=='Bearer ficticio')return send(401,{});if(!new URL(req.url()).pathname.endsWith('/contents/vault.json'))return send(200,{private:true});
  if(req.method()==='GET')return send(store.file?200:404,store.file||{});if(req.method()==='PUT'){const d=req.postDataJSON();if(d.sha!==store.sha)return send(409,{});store.file=Buffer.from(d.content,'base64').toString('utf8');store.sha=sha(store.file);store.puts++;return send(200,{content:{sha:store.sha}});}return send(400,{});};}
