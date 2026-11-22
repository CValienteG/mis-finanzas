// Mejora integral (v27–v31). Solo datos ficticios y GitHub simulado.
const OUT=require('path').join(__dirname,'../resultados-mejora-integral/');require('fs').mkdirSync(OUT,{recursive:true});
const {start,create,assert}=require('../helpers');const seed=require('./seed');
(async()=>{const env=await start();try{const p=await env.page({viewport:{width:360,height:780},colorScheme:'dark',deviceScaleFactor:1.5});
 await p.clock.setFixedTime(new Date('2026-11-22T15:00:00Z'));await p.reload();await create(p);await seed(p);
 await p.evaluate(()=>document.querySelectorAll('.toast').forEach(t=>t.remove()));
 // 1. teclado de la PC en el monto
 await p.click('.fab');await p.waitForSelector('.keypad');await p.keyboard.type('12,5+3');let disp=await p.textContent('.calculator-display');assert.equal(disp,'12.5+3');
 await p.keyboard.press('Backspace');await p.keyboard.type('7');await p.keyboard.press('Enter');
 const val=await p.evaluate(()=>document.querySelector('[data-field="monto"] b').textContent);assert.match(val,/19\.50/);
 console.log('monto con teclado:',val);
 await p.evaluate(()=>closeModal());
 for(const t of ['resumen','movs','cuentas']){await p.evaluate(t=>navigate(t),t);await p.waitForTimeout(200);await p.screenshot({path:OUT+`b1-${t}.png`,fullPage:true});}
 await p.click('#privBtn');await p.evaluate(()=>navigate('resumen'));await p.waitForTimeout(200);await p.screenshot({path:OUT+'b1-priv.png'});
 const txt=await p.textContent('#view');assert.ok(!/S\/ \d/.test(txt.replace(/Netflix.*?\)/g,'')),'quedan montos visibles: '+txt.match(/S\/ \d[\d,.]*/g));
 console.log('errores:',env.errors);}finally{await env.close();}})();
