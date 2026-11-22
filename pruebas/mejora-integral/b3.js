// Mejora integral (v27–v31). Solo datos ficticios y GitHub simulado.
const OUT=require('path').join(__dirname,'../resultados-mejora-integral/');require('fs').mkdirSync(OUT,{recursive:true});
const {start,create,assert}=require('../helpers');const seed=require('./seed');
(async()=>{const env=await start();try{const p=await env.page({viewport:{width:360,height:780},colorScheme:'dark',deviceScaleFactor:1.5});
 await p.clock.setFixedTime(new Date('2026-11-22T15:00:00Z'));await p.reload();await create(p);await seed(p);
 const before=await p.evaluate(()=>{const g=(id,cat,sub,amount,date)=>({id,kind:'gasto',type:'gasto',acc:'b1',amount,currency:'PEN',pen:amount,cat,sub,date,note:'x',u:1});
  S.tx.push(g('o1','PADRES','',300,'2026-10-10T10:00'),g('o2','PADRES','',250,'2026-09-10T10:00'),g('o3','PERSONAL','TRANSPORTE',64,'2026-10-11T10:00'));sortTx();
  S.settings.budgets={'HIJA':900,subgasto:{'PERSONAL|ALIMENTACIÓN':150},ingreso:{'PERSONAL':4200}};save();document.querySelectorAll('.toast').forEach(t=>t.remove());navigate('budget');return JSON.stringify(S.settings.budgets);});
 await p.waitForTimeout(200);await p.screenshot({path:OUT+'b3-gastos.png',fullPage:true});
 // tarjetas: HIJA, PERSONAL (derivado de su hijo) y PERSONAL › ALIMENTACIÓN
 const names=await p.$$eval('.budcard .bc-top b',els=>els.map(e=>e.textContent));console.log(names);assert.ok(names.includes('Hija'));
 // sugerencia por historial: Padres promedio 275 → 280 (incluye este mes? no)
 const sug=await p.$$eval('[data-act="budgetQuick"]',els=>els.map(e=>e.dataset.cat+':'+e.dataset.amount));console.log(sug);assert.ok(sug.includes('PADRES:280'));
 await p.click('[data-act="budgetQuick"][data-cat="PADRES"]');assert.equal(await p.evaluate(()=>S.settings.budgets.PADRES),280);
 // crear presupuesto por pantalla
 await p.click('[data-act="budgetEdit"][data-key=""]');await p.selectOption('#beCat','PERSONAL|TRANSPORTE');await p.fill('#beAmt','80');await p.click('#beOk');
 assert.equal(await p.evaluate(()=>S.settings.budgets.subgasto['PERSONAL|TRANSPORTE']),80);
 // editar solo este mes y quitar
 await p.click('.budcard[data-key="HIJA"]');await p.fill('#beAmt','1000');await p.selectOption('#beScope','mes');await p.click('#beOk');
 assert.equal(await p.evaluate(()=>[S.settings.budgets.HIJA,S.settings.budgets.meses['2026-11'].gasto.HIJA].join()),'900,1000');
 await p.click('.budcard[data-key="PADRES"]');await p.click('#beDel');assert.equal(await p.evaluate(()=>S.settings.budgets.PADRES),undefined);
 // presupuesto previo intacto (no cambia el modelo)
 assert.equal(await p.evaluate(()=>S.settings.budgets.subgasto['PERSONAL|ALIMENTACIÓN']),150);
 // aviso al registrar
 await p.evaluate(()=>{navigate('resumen');});await p.click('.fab');await p.waitForSelector('.keypad');await p.keyboard.type('20');await p.keyboard.press('Enter');
 await p.evaluate(()=>{const c=document.querySelector('#fCat');c.value='PERSONAL';c.dispatchEvent(new Event('change',{bubbles:true}));const s=document.querySelector('#fSub');s.value='ALIMENTACIÓN › VÍVERES';s.dispatchEvent(new Event('change',{bubbles:true}));});
 await p.evaluate(()=>document.querySelector('#fSave').click());await p.waitForSelector('.toast');const t=await p.textContent('.toast');console.log('toast:',t);assert.match(t,/Te pasaste en Alimentación/);
 await p.evaluate(()=>navigate('budget'));await p.waitForTimeout(200);await p.screenshot({path:OUT+'b3-final.png',fullPage:true});
 await p.click('[data-act="budgetType"][data-type="ingreso"]');await p.screenshot({path:OUT+'b3-ingresos.png'});
 console.log('OK bloque 3; errores:',env.errors);}finally{await env.close();}})();
