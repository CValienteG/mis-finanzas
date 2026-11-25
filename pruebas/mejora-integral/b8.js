// v34: deudas con empresas. El campo dice «Persona o empresa», la app propone el tipo por el nombre,
// Deudas agrupa como «Empresas y bancos» y la fecha de devolución sale en Próximos pagos.
const OUT=require('path').join(__dirname,'../resultados-mejora-integral/');require('fs').mkdirSync(OUT,{recursive:true});
const {start,create,assert}=require('../helpers');const seed=require('./seed');
(async()=>{const env=await start();try{const p=await env.page({viewport:{width:360,height:780},colorScheme:'dark',deviceScaleFactor:1.5,isMobile:true,hasTouch:true});
 await p.clock.setFixedTime(new Date('2026-11-25T13:30:00Z'));await p.reload();await create(p);await seed(p);
 await p.evaluate(()=>{document.querySelectorAll('.toast').forEach(t=>t.remove());situationForm('prestamo_recibido');});await p.waitForTimeout(300);
 assert.match(await p.textContent('[data-field="persona"]'),/Persona o empresa/);
 await p.evaluate(()=>document.querySelector('[data-field="persona"]').click());await p.waitForTimeout(200);
 await p.fill('#sPerson','Caja Arequipa');await p.waitForTimeout(150);
 assert.equal(await p.inputValue('#sPersonKind'),'banco');assert.ok(await p.isVisible('label[for="sPersonKind"]'),'se ve «Es una»');
 await p.fill('#sPerson','Grupo Emaús Perú SAC');assert.equal(await p.inputValue('#sPersonKind'),'empresa');
 await p.fill('#sPerson','Kevin Valiente');assert.equal(await p.inputValue('#sPersonKind'),'persona');
 await p.fill('#sPerson','ACME SAC');await p.screenshot({path:OUT+'b8-tipo.png'});
 // el usuario puede corregirlo y ya no se cambia solo
 await p.selectOption('#sPersonKind','persona');await p.fill('#sPerson','ACME SAC 2');assert.equal(await p.inputValue('#sPersonKind'),'persona');
 await p.evaluate(()=>{for(let i=0;i<4&&$('#bd');i++)closeModal();});
 // Deudas y Próximos pagos
 await p.evaluate(()=>{S.people.push({id:'pe3',name:'SBP',kind:'empresa',u:1});S.tx.push({id:'pr1',kind:'prestamo_recibido',type:'transfer',person:'pe3',acc:'b1',amount:2100,currency:'PEN',pen:2100,date:'2026-11-25T08:00',note:'Adelanto',dueDate:'2026-11-30',u:1});sortTx();save();navigate('deudas');});
 const d=await p.textContent('#view');assert.match(d,/Empresas y bancos/);assert.match(d,/Empresa · Le debes · devolver el 30/);assert.doesNotMatch(d,/>Personas</);
 await p.evaluate(()=>navigate('resumen'));assert.ok(await p.evaluate(()=>upcomingPayments(7).some(e=>e.kind==='person'&&e.id==='pe3'&&e.amount===2100)));assert.match(await p.textContent('#view'),/Lo próximo: S\/\s?2,100\.00 el 30 nov\.? \(SBP\)|Vence en 30 días/);
 assert.ok(await p.evaluate(()=>cashflow(30).ev.some(e=>e.name==='SBP'&&e.amt===-2100)));
 console.log('OK deudas con empresas; errores:',env.errors);}finally{await env.close();}})();
