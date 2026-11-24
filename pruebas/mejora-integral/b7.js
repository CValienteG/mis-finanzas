// v33: los pagos fijos se pueden registrar antes de su día, desde el detalle, y un registro a mano que coincide cuenta como el fijo.
const OUT=require('path').join(__dirname,'../resultados-mejora-integral/');require('fs').mkdirSync(OUT,{recursive:true});
const {start,create,assert}=require('../helpers');const seed=require('./seed');
(async()=>{const env=await start();try{const p=await env.page({viewport:{width:360,height:780},colorScheme:'dark',deviceScaleFactor:1.5,isMobile:true,hasTouch:true});
 await p.clock.setFixedTime(new Date('2026-11-24T13:15:00Z'));await p.reload();await create(p);await seed(p);
 await p.evaluate(()=>{S.tx=S.tx.filter(t=>t.id!=='g5');save();document.querySelectorAll('.toast').forEach(t=>t.remove());navigate('resumen');});
 // 1. Google One (día 25) se puede registrar hoy, antes de su día
 await p.click('.payrow[data-id="f2"]');await p.waitForSelector('#fSave');
 assert.equal(await p.evaluate(()=>document.querySelector('[data-field="fecha"] b')?.textContent||''),'24 de noviembre de 2026');
 await p.click('#fSave');let tx=await p.evaluate(()=>S.tx.find(t=>t.fijo==='f2'));assert.equal(tx.per,'2026-11');assert.equal(tx.date.slice(0,10),'2026-11-24');assert.equal(tx.currency,'USD');
 assert.equal(await p.locator('.payrow[data-id="f2"]').count(),0,'ya no está pendiente');
 // 2. Netflix registrado a mano con + cuenta como el fijo de noviembre
 await p.evaluate(()=>txFormWith({type:'gasto',amount:44.9,acc:'t3',cat:'PERSONAL',sub:'SUSCRIPCIONES',note:'netflix'}));await p.waitForSelector('#fSave');await p.click('#fSave');
 const t=await p.textContent('.toast');console.log(t);assert.match(t,/Contado como Netflix de noviembre/);
 assert.equal(await p.evaluate(()=>pendingFixed().map(o=>o.f.name).join()),'Claude');
 // 3. Detalle del fijo: botón para registrar el pendiente
 await p.evaluate(()=>{navigate('fijos');});await p.click('[data-act="fixedDetail"][data-id="f3"]');const b=await p.textContent('#bd [data-act="confirmFixed"]');assert.match(b,/Registrar el de noviembre \(atrasado\)/);
 await p.screenshot({path:OUT+'b7-detalle.png'});
 await p.click('#bd [data-act="confirmFixed"]');await p.waitForSelector('#fSave');await p.click('#fSave');assert.equal(await p.evaluate(()=>pendingFixed().length),0);
 // 4. Un gasto distinto (otra cuenta) no se marca
 await p.evaluate(()=>txFormWith({type:'gasto',amount:44.9,acc:'b1',cat:'PERSONAL',sub:'SUSCRIPCIONES',note:'otro'}));await p.waitForSelector('#fSave');await p.click('#fSave');
 assert.equal(await p.evaluate(()=>S.tx.filter(t=>t.note==='otro'&&t.fijo).length),0);
 console.log('OK pagos fijos; errores:',env.errors);}finally{await env.close();}})();
