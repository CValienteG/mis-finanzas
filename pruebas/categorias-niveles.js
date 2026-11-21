// Categorías por niveles (v26). Solo datos ficticios y GitHub simulado.
const {start,create,assert,fs,path}=require('./helpers');
const crypto=require('node:crypto');
const folder=path.join(__dirname,'resultados-categorias-niveles');fs.mkdirSync(folder,{recursive:true});
const sha=t=>crypto.createHash('sha1').update('blob '+Buffer.byteLength(t)+'\0'+t).digest('hex');
function remote(){const store={file:null,sha:null};return {store,mock:async r=>{const req=r.request(),send=(status,body)=>r.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  if(!new URL(req.url()).pathname.endsWith('/contents/vault.json'))return send(200,{private:true});
  if(req.method()==='GET')return store.file?r.fulfill({status:200,contentType:'application/json',body:store.file}):send(404,{});
  if(req.method()==='PUT'){const d=req.postDataJSON();if(store.file&&d.sha!==store.sha)return send(409,{});store.file=Buffer.from(d.content,'base64').toString('utf8');store.sha=sha(store.file);return send(200,{content:{sha:store.sha}});}
  return send(400,{});}};}
const link='#cargar-'+Buffer.from(JSON.stringify({app:'mis-finanzas-carga',v:1,fecha:'2026-11-21',reorganizar:'niveles'})).toString('base64url');
(async()=>{const env=await start();try{
 for(const [width,colorScheme] of [[360,'dark'],[1280,'light']]){
  const p=await env.page({viewport:{width,height:900},colorScheme}),srv=remote();await p.context().route('https://api.github.com/**',srv.mock);
  await p.clock.setFixedTime(new Date('2026-11-21T15:00:00Z'));await p.reload();await create(p);
  // Las categorías de la plantilla del 16-nov, con registros de cada tipo.
  await p.evaluate(async()=>{S=blankState();S.settings={...S.settings,tc:3.4,autolock:0,hideSetup:true};
   S.cats={gasto:{'HIJA':['ALIMENTACIÓN','PASAJES / MOVILIDAD','COLEGIO','PENSIÓN DE ALIMENTOS','RECREACIÓN','VESTIMENTA','SALUD','COORDINACIÓN PARENTAL','ÚTILES ESCOLARES','ACTIVIDADES DEL COLEGIO'],'ALIMENTACIÓN':['MENÚ','VÍVERES'],'TRANSPORTE':['BUS / TAXI','TREN / RECARGA','OTROS'],'CASA':['SERVICIOS'],'PADRES':['APOYO'],'FAMILIA Y AMIGOS':['SALIDAS','APOYO SOLIDARIO','REGALOS'],'PERSONAL':['CUIDADO PERSONAL','ENTRETENIMIENTO','TECNOLOGÍA / EQUIPOS','ROPA'],'SUSCRIPCIONES Y PLANES':['DIGITALES','PLAN MÓVIL'],'SALUD':['MEDICAMENTOS / SUPLEMENTOS','CONSULTAS'],'EDUCACIÓN':['CURSOS / ESPECIALIZACIÓN'],'FINANZAS':['COMISIONES','INTERESES','IMPUESTOS / ITF'],'MASCOTAS':['COMIDA']},
     ingreso:{'TRABAJO':['SUELDO','GRATIFICACIÓN','BONIFICACIÓN','COMISIONES','CTS'],'OTROS INGRESOS':['INTERESES GANADOS','BENEFICIOS DE SOCIO','PROPINAS / APOYO','GANANCIAS OCASIONALES','OTROS']}};
   S.catsReplacement={at:1,cats:structuredClone(S.cats)};
   const A=(id,name,type,currency,initial,extra={})=>({id,name,type,currency,initial,archived:false,u:1,...extra});
   S.accounts=[A('b1','BCP 1046','banco','PEN',3000),A('t1','TC IBK 1174','tarjeta','PEN',-500,{debt:{limit:3200,cutDay:20,dueDay:5}}),A('pr','PRÉSTAMO IBK','porpagar','PEN',-5000,{debt:{cuota:520,cuotasRest:10,dueDay:2}})];
   const g=(id,cat,sub,amount,note,date='2026-11-10T10:00')=>({id,kind:'gasto',type:'gasto',acc:'b1',amount,currency:'PEN',pen:amount,cat,sub,date,note,u:1});
   S.tx=[g('g1','HIJA','COLEGIO',500,'Pensión noviembre'),g('g2','HIJA','COLEGIO',60,'Alquiler de disfraz para la actuación'),g('g3','HIJA','ÚTILES ESCOLARES',120,'Lista de útiles'),g('g4','ALIMENTACIÓN','MENÚ',15,'Menú'),
    g('g5','TRANSPORTE','BUS / TAXI',8,'Taxi'),g('g6','PERSONAL','ROPA',90,'Polo'),g('g7','HIJA','PASAJES / MOVILIDAD',10,'Movilidad'),g('g8','MASCOTAS','COMIDA',40,'Croquetas'),g('g9','HIJA','COLEGIO',35,'Cuota APAFA'),
    {id:'i1',kind:'ingreso',type:'ingreso',acc:'b1',amount:5000,currency:'PEN',pen:5000,cat:'TRABAJO',sub:'SUELDO',date:'2026-11-01T09:00',note:'Sueldo',u:1},
    {id:'c1',kind:'comprobante',type:'transfer',acc:null,amount:500,currency:'PEN',pen:0,cat:'HIJA',sub:'COLEGIO',date:'2026-09-05T12:00',note:'Pensión setiembre',edu:2026,u:1},
    {id:'d1',kind:'pago_deuda',type:'transfer',acc:'b1',to:'pr',amount:520,currency:'PEN',pen:520,date:'2026-11-02T09:00',note:'Cuota',legs:[{acc:'pr',amount:40,cat:'FINANZAS',sub:'INTERESES',role:'interest'}],u:1}];
   S.fijos=[{id:'f1',name:'Netflix',tipo:'pago',freq:'mensual',dia:16,template:{kind:'gasto',amount:44.9,currency:'PEN',acc:'t1',cat:'SUSCRIPCIONES Y PLANES',sub:'DIGITALES'},montoFijo:true,desde:'2026-11-01',avisarDias:3,skips:[],u:1},
    {id:'f2',name:'Sueldo',tipo:'ingreso',freq:'mensual',dia:'ultimo',template:{kind:'ingreso',amount:5000,currency:'PEN',acc:'b1',cat:'TRABAJO',sub:'SUELDO'},montoFijo:true,desde:'2026-11-01',avisarDias:3,skips:[],u:1}];
   S.settings.budgets={'ALIMENTACIÓN':500,'HIJA':1500,'PERSONAL':200,'SALUD':80,subgasto:{'HIJA|COLEGIO':800,'TRANSPORTE|BUS / TAXI':150,'PERSONAL|ROPA':120},ingreso:{'TRABAJO|SUELDO':5000,'OTROS INGRESOS':100},meses:{'2026-12':{gasto:{'HIJA':2000,'ALIMENTACIÓN':0}}}};
   S.sync={owner:'f',repo:'f',token:'f'};ui.month='2026-11';SNAP=null;takeSnap();await persist();render();});
  await p.waitForFunction(()=>!SYNC.busy);
  const before=await p.evaluate(()=>({g11:budgetExpected('2026-11','gasto'),i11:budgetExpected('2026-11','ingreso'),g12:budgetExpected('2026-12','gasto'),i12:budgetExpected('2026-12','ingreso'),old:structuredClone(S)}));
  // El enlace abre la vista previa con lo que cambia.
  await p.evaluate(h=>{location.hash=h;},link);await p.waitForSelector('#balancesPreview table');
  const text=(await p.textContent('#balancesPreview')).replace(/\s+/g,' ');
  for(const s of ['Categorías por niveles','No cambia ningún saldo','Hija › Colegio','Hija › Educación › Colegio › Pensiones','Hija › Educación › Colegio › Actividades','Personal › Alimentación › Menú','Personal › Trabajo › Sueldo','(igual)'])assert(text.includes(s),'Falta en la vista previa: '+s);
  assert(!text.includes('Tienes'),'No debe mostrar la tabla de saldos');
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await p.locator('#modalRoot .modal').screenshot({path:path.join(folder,`${width}-${colorScheme}-previa.png`)});
  const dl=p.waitForEvent('download');await p.click('#balancesApply');await dl;await p.waitForSelector('#balancesDone');
  assert.match(await p.textContent('#modalRoot h2'),/Categorías ordenadas por niveles: 9 movimientos, 1 comprobantes y 2 pagos fijos/);await p.click('#balancesDone');
  const r=await p.evaluate(()=>{const tx=id=>{const t=S.tx.find(x=>x.id===id);return t.cat+' / '+t.sub;};return {
   tops:Object.keys(S.cats.gasto),inc:Object.keys(S.cats.ingreso),g1:tx('g1'),g2:tx('g2'),g3:tx('g3'),g4:tx('g4'),g5:tx('g5'),g6:tx('g6'),g7:tx('g7'),g8:tx('g8'),g9:tx('g9'),i1:tx('i1'),c1:tx('c1'),leg:S.tx.find(x=>x.id==='d1').legs[0].cat+' / '+S.tx.find(x=>x.id==='d1').legs[0].sub,
   f1:S.fijos.find(f=>f.id==='f1').template.sub,f2:S.fijos.find(f=>f.id==='f2').template.cat+' / '+S.fijos.find(f=>f.id==='f2').template.sub,env:S.recurring.filter(x=>x.mfModel==='fijo').map(x=>x.value.template.cat).sort().join(','),
   g11:budgetExpected('2026-11','gasto'),i11:budgetExpected('2026-11','ingreso'),g12:budgetExpected('2026-12','gasto'),i12:budgetExpected('2026-12','ingreso'),
   hija:budgetActual('2026-11','gasto','HIJA'),colegio:budgetActual('2026-11','gasto','HIJA|EDUCACIÓN › COLEGIO'),pens:budgetActual('2026-11','gasto','HIJA|EDUCACIÓN › COLEGIO › PENSIONES'),
   colegioMeta:budgetTarget('2026-11','gasto','HIJA','EDUCACIÓN › COLEGIO'),
   receipt:[receiptSuggested('HIJA','EDUCACIÓN › COLEGIO › PENSIONES'),receiptSuggested('HIJA','EDUCACIÓN › COLEGIO'),receiptSuggested('HIJA','EDUCACIÓN › COLEGIO › ACTIVIDADES'),receiptSuggested('HIJA','EDUCACIÓN › COLEGIO › ÚTILES Y LIBROS')],
   school:schoolNode(),edu:eduIncomeNode(),repl:JSON.stringify(S.catsReplacement.cats)===JSON.stringify(S.cats),
   bal:balances().b1};});
  assert.deepEqual(r.tops,['HIJA','PERSONAL','PADRES','FAMILIA Y AMIGOS','CASA','FINANZAS','MASCOTAS']);assert.deepEqual(r.inc,['PERSONAL']);
  assert.equal(r.g1,'HIJA / EDUCACIÓN › COLEGIO › PENSIONES');assert.equal(r.g2,'HIJA / EDUCACIÓN › COLEGIO › ACTIVIDADES');assert.equal(r.g3,'HIJA / EDUCACIÓN › COLEGIO › ÚTILES Y LIBROS');
  assert.equal(r.g4,'PERSONAL / ALIMENTACIÓN › MENÚ');assert.equal(r.g5,'PERSONAL / TRANSPORTE › BUS Y TAXI');assert.equal(r.g6,'PERSONAL / VESTIMENTA › ROPA');assert.equal(r.g7,'HIJA / TRANSPORTE › MOVILIDAD');
  assert.equal(r.g8,'MASCOTAS / COMIDA');assert.equal(r.g9,'HIJA / EDUCACIÓN › COLEGIO');assert.equal(r.i1,'PERSONAL / TRABAJO › SUELDO');assert.equal(r.c1,'HIJA / EDUCACIÓN › COLEGIO › PENSIONES');
  assert.equal(r.leg,'FINANZAS / INTERESES');assert.equal(r.f1,'SUSCRIPCIONES › DIGITALES');assert.equal(r.f2,'PERSONAL / TRABAJO › SUELDO');assert.equal(r.env,'PERSONAL,PERSONAL');
  // El presupuesto no cambia.
  for(const k of ['g11','i11','g12','i12'])assert.equal(Math.round(r[k]*100),Math.round(before[k]*100),'Presupuesto distinto en '+k+': '+before[k]+' → '+r[k]);
  assert.equal(r.hija,725);assert.equal(r.colegio,715);assert.equal(r.pens,500);assert.equal(r.colegioMeta,800);
  assert.deepEqual(r.receipt,[true,true,false,true]);assert.deepEqual(r.school,{cat:'HIJA',sub:'EDUCACIÓN › COLEGIO'});assert.deepEqual(r.edu,{cat:'PERSONAL',sub:'TRABAJO › BONIFICACIÓN'});assert(r.repl);
  // Un equipo con la versión anterior no revive las categorías viejas.
  const merged=await p.evaluate(old=>{const m=mergeStates(structuredClone(S),old);return {tops:Object.keys(m.cats.gasto),g1:m.tx.find(t=>t.id==='g1').sub};},before.old);
  assert.deepEqual(merged.tops,r.tops);assert.equal(merged.g1,'EDUCACIÓN › COLEGIO › PENSIONES');
  // Repetir el enlace no hace nada.
  await p.evaluate(h=>{location.hash='';location.hash=h;},link);await p.waitForFunction(()=>document.querySelector('#balancesErr')?.textContent);
  assert.match(await p.textContent('#balancesErr'),/ya están ordenadas por niveles/);await p.click('#balancesCancel');

  // Registro nivel por nivel: Hija › Educación › Colegio › Pensiones.
  await p.click('.fab');await p.waitForSelector('.entry-panel .keypad');
  for(const k of ['2','5','0'])await p.click(`.keypad [data-key="${k}"]`);await p.click('.entry-panel .btn.primary.block');
  await p.click('.entry-panel [data-c="HIJA"]');await p.waitForSelector('.entry-panel #subChips [data-s="EDUCACIÓN"]');
  await p.click('.entry-panel [data-s="EDUCACIÓN"]');await p.waitForSelector('.entry-panel [data-s="EDUCACIÓN › COLEGIO"]');
  await p.click('.entry-panel [data-s="EDUCACIÓN › COLEGIO"]');await p.waitForSelector('.entry-panel [data-s="EDUCACIÓN › COLEGIO › PENSIONES"]');
  assert.equal((await p.textContent('.entry-panel .crumbs')).replace(/\s+/g,''),'Hija›Educación›Colegio');
  await p.locator('#modalRoot .modal').screenshot({path:path.join(folder,`${width}-${colorScheme}-registro.png`)});
  // Nuevo nivel dentro de Colegio.
  await p.click('.entry-panel [data-s="__new"]');await p.waitForSelector('.ask input, #askInput, .modal input[type=text]');
  await p.keyboard.type('Uniforme escolar');await p.keyboard.press('Enter');
  await p.waitForFunction(()=>S.cats.gasto.HIJA.includes('EDUCACIÓN › COLEGIO › UNIFORME ESCOLAR'));
  const afterNew=await p.evaluate(()=>({sub:document.querySelector('#fSub').value,idx:S.cats.gasto.HIJA.indexOf('EDUCACIÓN › COLEGIO › UNIFORME ESCOLAR'),cur:S.cats.gasto.HIJA.indexOf('EDUCACIÓN › CURSOS Y TALLERES')}));
  assert.equal(afterNew.sub,'EDUCACIÓN › COLEGIO › UNIFORME ESCOLAR');assert(afterNew.idx<afterNew.cur,'El nuevo nivel queda junto a Colegio');
  await p.evaluate(()=>{const s=document.querySelector('#fSub');s.value='EDUCACIÓN › COLEGIO › PENSIONES';s.dispatchEvent(new Event('change'));});
  await p.evaluate(()=>{const a=document.querySelector('#fAcc');a.value='b1';a.dispatchEvent(new Event('change'));});
  await p.evaluate(()=>document.querySelector('#fSave').click());await p.waitForFunction(()=>!document.querySelector('#fSave'));
  const saved=await p.evaluate(()=>{const t=S.tx.find(x=>x.amount===250);return t&&t.cat+' / '+t.sub;});assert.equal(saved,'HIJA / EDUCACIÓN › COLEGIO › PENSIONES');

  // Estadísticas por nivel.
  await p.evaluate(()=>{navigate('stats');});await p.click('[data-act=statsCat][data-cat="HIJA"]');
  await p.waitForSelector('.stats-crumbs');let st=(await p.textContent('.stats-card')).replace(/\s+/g,' ');
  assert(st.includes('Educación')&&st.includes('Transporte'),st);
  await p.click('[data-act=statsCat][data-path="EDUCACIÓN"]');await p.click('[data-act=statsCat][data-path="EDUCACIÓN › COLEGIO"]');
  st=(await p.textContent('.stats-card')).replace(/\s+/g,' ');for(const s of ['Pensiones','Actividades','Útiles y libros','Sin más detalle','S/ 750.00'])assert(st.includes(s),'Falta en estadísticas: '+s+' · '+st);
  await p.screenshot({path:path.join(folder,`${width}-${colorScheme}-estadisticas.png`)});
  await p.click('[data-act=statsMovs]');await p.waitForFunction(()=>ui.tab==='movs');
  assert.equal(await p.evaluate(()=>filteredTx().length),5);

  // Presupuesto por nivel.
  await p.evaluate(()=>{ui.tab='budget';render();});await p.click('[data-act=budOpen][data-key="gasto|HIJA|EDUCACIÓN"]');await p.click('[data-act=budOpen][data-key="gasto|HIJA|EDUCACIÓN › COLEGIO"]');
  await p.waitForSelector('[data-budget-key="HIJA|EDUCACIÓN › COLEGIO › PENSIONES"]');
  await p.screenshot({path:path.join(folder,`${width}-${colorScheme}-presupuesto.png`),fullPage:true});
  // Categorías: árbol con + en cada nivel.
  await p.evaluate(()=>{ui.tab='cats';ui.catType='gasto';render();});await p.click('[data-act=catSheet][data-cat="HIJA"]');await p.waitForSelector('.cat-tree');
  await p.locator('#modalRoot .modal').screenshot({path:path.join(folder,`${width}-${colorScheme}-categorias.png`)});
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await p.context().close();
 }
 assert.deepEqual(env.errors,[]);console.log('OK categorías por niveles');
}finally{await env.close();}})().catch(e=>{console.error(e);process.exit(1);});
