// Mejora integral (v27–v31). Solo datos ficticios y GitHub simulado.
const OUT=require('path').join(__dirname,'../resultados-mejora-integral/');require('fs').mkdirSync(OUT,{recursive:true});
const {start,create,assert}=require('../helpers');const seed=require('./seed');
(async()=>{const env=await start();try{const p=await env.page({viewport:{width:360,height:780},colorScheme:'dark',deviceScaleFactor:1.5});
 await p.clock.setFixedTime(new Date('2026-11-22T15:00:00Z'));await p.reload();await create(p);await seed(p);
 await p.evaluate(()=>{const g=(id,cat,sub,amount,date)=>({id,kind:'gasto',type:'gasto',acc:'b1',amount,currency:'PEN',pen:amount,cat,sub,date,note:'x',u:1});
  S.tx.push(g('o1','PADRES','',300,'2026-10-10T10:00'),g('o2','HIJA','EDUCACIÓN › COLEGIO › PENSIONES',586,'2026-10-05T10:00'),g('o3','PERSONAL','TRANSPORTE',64,'2026-10-11T10:00'));sortTx();
  S.fijos.push({id:'fs',name:'Sueldo',tipo:'ingreso',freq:'mensual',dia:'ultimo',template:{kind:'ingreso',amount:4200,currency:'PEN',acc:'b1',cat:'PERSONAL',sub:'TRABAJO › SUELDO'},montoFijo:true,desde:'2026-11-01',avisarDias:3,skips:[],u:1});
  save();document.querySelectorAll('.toast').forEach(t=>t.remove());navigate('stats');});
 await p.waitForTimeout(200);await p.screenshot({path:OUT+'b2-gastos.png',fullPage:true});
 // comparación: Hija noviembre 807.50 vs octubre a la fecha (hasta 22-oct) 586 → ▲ 38 %
 const t=await p.textContent('.debt-row[data-cat="HIJA"]');console.log(t);assert.match(t,/▲ 38 %/);
 await p.click('[data-act="statsSpan"][data-span="anio"]');const y=await p.textContent('.monthbar h2');assert.equal(y,'2026');
 await p.click('[data-act="statsType"][data-type="flujo"]');await p.waitForTimeout(100);await p.screenshot({path:OUT+'b2-flujo.png',fullPage:true});
 assert.equal(await p.locator('.fbar').count(),6);
 await p.click('[data-act="statsType"][data-type="prevision"]');await p.waitForTimeout(100);await p.screenshot({path:OUT+'b2-prev.png',fullPage:true});
 const strip=await p.textContent('.sumline');console.log(strip);
 await p.click('[data-act="fcDaily"]');assert.ok(await p.evaluate(()=>ui.fcDaily));await p.screenshot({path:OUT+'b2-prev2.png',fullPage:true});
 await p.click('[data-act="statsType"][data-type="flujo"]');await p.click('.debt-row[data-mk="2026-10"]');assert.equal(await p.evaluate(()=>ui.tab+ui.month),'movs2026-10');
 console.log('OK bloque 2; errores:',env.errors);}finally{await env.close();}})();
