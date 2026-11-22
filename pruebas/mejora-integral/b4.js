// Mejora integral (v27–v31). Solo datos ficticios y GitHub simulado.
const OUT=require('path').join(__dirname,'../resultados-mejora-integral/');require('fs').mkdirSync(OUT,{recursive:true});
const {start,create,assert}=require('../helpers');const seed=require('./seed');
(async()=>{const env=await start();try{const p=await env.page({viewport:{width:360,height:780},colorScheme:'dark',deviceScaleFactor:1.5});
 await p.clock.setFixedTime(new Date('2026-11-22T15:00:00Z'));await p.reload();await create(p);await seed(p);
 await p.evaluate(()=>{document.querySelectorAll('.toast').forEach(t=>t.remove());navigate('metas');});
 await p.screenshot({path:OUT+'b4-vacio.png',fullPage:true});
 // sugerencia: la deuda más pequeña es TC CMR 4131
 const sug=await p.textContent('.card.list');assert.match(sug,/TC CMR 4131.*empieza por esta/s);
 await p.click('[data-act="metaEdit"][data-tipo="deuda"]');assert.equal(await p.inputValue('#mtName'),'Pagar TC CMR 4131');
 await p.fill('#mtFecha','2027-02-22');await p.click('#mtOk');
 let m=await p.evaluate(()=>metas()[0]);assert.equal(m.inicial,325.49);assert.equal(m.acc,'t3');
 // pago de 100 a la tarjeta → avance 100
 await p.evaluate(()=>{S.tx.push({id:'pp',kind:'pago_tarjeta',type:'transfer',acc:'b1',to:'t3',amount:100,currency:'PEN',pen:100,date:'2026-11-22T10:00',note:'',u:1});sortTx();save();render();});
 let i=await p.evaluate(()=>{const x=metaInfo(metas()[0]);return [x.done,x.left,x.hint].join('|');});console.log(JSON.stringify(i));assert.ok(i.startsWith('100|225.49|')&&/2027: paga S\/\s?75\.16 al mes/.test(i));
 // fondo de emergencia sugerido
 await p.evaluate(()=>render());await p.click('[data-act="metaEdit"][data-tipo="emergencia"]');await p.selectOption('#mtAcc','b3');
 const target=await p.inputValue('#mtTarget');console.log('emergencia sugerido',target);assert.ok(+target>0);await p.click('#mtOk');
 assert.equal(await p.evaluate(()=>metas().length),2);
 // se guarda en recurring y sobrevive a la mezcla con un equipo sin metas
 const merged=await p.evaluate(()=>{const old=structuredClone(S);old.recurring=old.recurring.filter(r=>r.mfModel!=='meta');const out=mergeStates(old,S);return out.recurring.filter(r=>r.mfModel==='meta').length;});assert.equal(merged,2);
 await p.screenshot({path:OUT+'b4-metas.png',fullPage:true});
 // editar → aportar abre el registro de Moví dinero hacia BCP 3090
 await p.click('.budcard >> nth=1');await p.screenshot({path:OUT+'b4-editor.png'});await p.click('[data-act="metaGive"]');await p.waitForTimeout(300);
 assert.equal(await p.evaluate(()=>document.querySelector('#fTo')?.value),'b3');
 await p.evaluate(()=>{for(let i=0;i<5&&$('#bd');i++)closeModal();});
 // bloque opcional en Inicio
 await p.evaluate(()=>{S.settings.home={shown:['metas']};save();navigate('resumen');});assert.ok(await p.locator('text=Ver todas').count());
 // borrar
 await p.evaluate(()=>navigate('metas'));await p.click('.budcard >> nth=0');await p.click('#mtDel');await p.click('#askOk');assert.equal(await p.evaluate(()=>metas().length),1);
 console.log('OK bloque 4; errores:',env.errors);}finally{await env.close();}})();
