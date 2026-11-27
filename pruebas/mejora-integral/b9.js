// v35/v38: estructura clara. Cuentas = una sola lista (Tengo, Debo y Me deben como grupos); cada cuenta o persona tiene su página con saldo y movimientos por mes.
const OUT=require('path').join(__dirname,'../resultados-mejora-integral/');require('fs').mkdirSync(OUT,{recursive:true});
const {start,create,assert}=require('../helpers');const seed=require('./seed');
(async()=>{const env=await start();try{const p=await env.page({viewport:{width:360,height:780},colorScheme:'dark',deviceScaleFactor:1.5,isMobile:true,hasTouch:true});
 await p.clock.setFixedTime(new Date('2026-11-25T22:30:00Z'));await p.reload();await create(p);await seed(p);
 await p.evaluate(()=>{S.people.push({id:'pe3',name:'SBP',kind:'empresa',u:1});S.tx.push({id:'pr1',kind:'prestamo_recibido',type:'transfer',person:'pe3',acc:'b1',amount:2100,currency:'PEN',pen:2100,date:'2026-11-25T08:00',note:'Adelanto',dueDate:'2026-12-15',u:1});sortTx();save();document.querySelectorAll('.toast').forEach(t=>t.remove());navigate('resumen');});
 await p.screenshot({path:OUT+'b9-inicio.png',fullPage:true});
 // Inicio: «Mis cuentas» justo después del resumen, y cada mosaico abre la cuenta
 const blocks=await p.$$eval('#view > section, #view > .card',els=>els.slice(0,3).map(e=>e.querySelector('h3')?.textContent||e.className));console.log(blocks);
 await p.click('.home-block .debt-row[data-act="openAccount"][data-id="b1"]');assert.equal(await p.evaluate(()=>ui.tab+':'+ui.accId),'cuenta:b1');
 await p.screenshot({path:OUT+'b9-cuenta-bcp.png',fullPage:true});
 const top=await p.textContent('.account-top');assert.match(top,/Saldo/);
 // saldo al cierre = saldo actual de la cuenta
 const ok=await p.evaluate(()=>{const L=accountLedger('b1',ui.accMonth);return Math.abs(L.close-balances().b1)<.01;});assert.ok(ok);
 await p.click('[data-act="accPrev"]');assert.match(await p.textContent('.monthbar h2'),/Octubre/);
 // volver → Inicio
 await p.evaluate(()=>navBack());await p.waitForTimeout(300);assert.equal(await p.evaluate(()=>ui.tab),'resumen');
 // Debes en Inicio → Cuentas › Debo
 await p.click('.home-summary [data-tab="deudas"]');await p.waitForTimeout(200);assert.equal(await p.evaluate(()=>ui.tab),'cuentas');assert.ok(await p.evaluate(()=>{const r=$('#sec-debo').getBoundingClientRect();return r.top<120&&r.top>=0;}));
 await p.screenshot({path:OUT+'b9-debo.png',fullPage:true});
 assert.match(await p.textContent('#view'),/Empresas y bancos/);
 await p.click('.debt-row[data-id="t2"]');assert.equal(await p.evaluate(()=>ui.tab),'cuenta');await p.screenshot({path:OUT+'b9-tarjeta.png',fullPage:true});
 assert.match(await p.textContent('.account-top'),/Debes/);await p.click('[data-act="debtSheet"]');assert.ok(await p.isVisible('#bd'));await p.evaluate(()=>closeModal());
 await p.evaluate(()=>{ui.cseg='debo';navigate('cuentas');});await p.click('.debt-row[data-act="openPerson"][data-id="pe3"]');await p.screenshot({path:OUT+'b9-persona.png',fullPage:true});
 assert.match(await p.textContent('#view'),/Le debes/);assert.match(await p.textContent('#view'),/Le pagué/);
 // Me deben
 await p.evaluate(()=>{ui.cseg='medeben';navigate('cuentas');});assert.equal(await p.locator('#sec-medeben + .card.list .debt-row[data-act="openPerson"]').count(),2);await p.screenshot({path:OUT+'b9-medeben.png',fullPage:true});
 // Tengo
 await p.click('[data-act="cseg"][data-seg="tengo"] >> nth=1');await p.screenshot({path:OUT+'b9-tengo.png',fullPage:true});assert.ok(await p.locator('.debt-row[data-act="openAccount"][data-id="b1"]').count());
 // registrar desde la página de la cuenta usa esa cuenta
 await p.click('.debt-row[data-id="ef"]');await p.click('[data-act="accTx"][data-type="gasto"]');await p.waitForSelector('[data-field="cuenta"]');assert.match(await p.textContent('[data-field="cuenta"]'),/EFECTIVO/);
 await p.evaluate(()=>{for(let i=0;i<4&&$('#bd');i++)closeModal();navigate('mas');});await p.screenshot({path:OUT+'b9-mas.png',fullPage:true});
 assert.match(await p.textContent('.rc-grid'),/Pagos fijos[\s\S]*Presupuesto[\s\S]*Metas[\s\S]*Personas y empresas[\s\S]*Categorías[\s\S]*Ajustes/);
 console.log('OK estructura de cuentas; errores:',env.errors);}finally{await env.close();}})();
