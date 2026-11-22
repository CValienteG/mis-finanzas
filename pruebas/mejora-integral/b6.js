// v32: las notas guardadas salen como chips sobre el campo, no como lista nativa encima del teclado.
const OUT=require('path').join(__dirname,'../resultados-mejora-integral/');require('fs').mkdirSync(OUT,{recursive:true});
const {start,create,assert}=require('../helpers');const seed=require('./seed');
(async()=>{const env=await start();try{const p=await env.page({viewport:{width:360,height:780},colorScheme:'dark',deviceScaleFactor:1.5,isMobile:true,hasTouch:true});
 await p.clock.setFixedTime(new Date('2026-11-22T15:00:00Z'));await p.reload();await create(p);await seed(p);
 await p.evaluate(()=>{const g=(id,note)=>({id,kind:'gasto',type:'gasto',acc:'b1',amount:10,currency:'PEN',pen:10,cat:'HIJA',sub:'ALIMENTACIÓN › VÍVERES',date:'2026-11-21T10:00',note,u:1});S.tx.push(g('n1','EVENTO NAVIDAD'),g('n2','Quesos plaza'),g('n3','Quesos plaza'));sortTx();save();document.querySelectorAll('.toast').forEach(t=>t.remove());});
 await p.click('.fab');await p.waitForSelector('.keypad');await p.evaluate(()=>document.querySelector('[data-field="nota"]').click());await p.waitForSelector('#fNote:focus, #sNote:focus');
 const id=await p.evaluate(()=>document.activeElement.id);
 assert.equal(await p.evaluate(()=>document.activeElement.getAttribute('list')),null,'el campo no debe usar la lista nativa');
 // sin escribir: muestra las notas más usadas
 assert.ok(await p.locator('.sugrow:not(.hidden) .chip').count()>=2);
 await p.keyboard.type('q');await p.waitForTimeout(100);
 const chips=await p.$$eval('.sugrow:not(.hidden) .chip',els=>els.map(e=>e.textContent));console.log(chips);assert.deepEqual(chips,['Quesos plaza']);
 // las sugerencias quedan ARRIBA del campo
 const [r,i]=await p.evaluate(id=>[document.querySelector('.sugrow').getBoundingClientRect().bottom,document.getElementById(id).getBoundingClientRect().top],id);assert.ok(r<=i+1);
 await p.screenshot({path:OUT+'b6-notas.png'});
 await p.click('.sugrow .chip');assert.equal(await p.inputValue('#'+id),'Quesos plaza');assert.equal(await p.locator('.sugrow:not(.hidden)').count(),0);
 // se puede seguir escribiendo con normalidad
 await p.keyboard.type(' 2');assert.equal(await p.inputValue('#'+id),'Quesos plaza 2');
 assert.equal(await p.evaluate(()=>document.querySelectorAll('input[list]').length),0);
 console.log('OK notas sin lista nativa; errores:',env.errors);}finally{await env.close();}})();
