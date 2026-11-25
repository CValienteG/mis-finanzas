// Corregir una fila a mano no debe encadenar los pasos siguientes. Solo datos ficticios.
const {start,create,assert}=require('../helpers');const seed=require('./seed');
(async()=>{const env=await start();try{const p=await env.page({viewport:{width:360,height:780},colorScheme:'dark',deviceScaleFactor:1});
 await p.clock.setFixedTime(new Date('2026-11-22T15:00:00Z'));await p.reload();await create(p);await seed(p);
 await p.evaluate(()=>document.querySelectorAll('.toast').forEach(t=>t.remove()));
 // Registro nuevo: el monto abre solo y, al continuar, pasa al siguiente dato (recorrido normal).
 await p.click('.fab');await p.waitForSelector('.keypad');await p.keyboard.type('20');await p.keyboard.press('Enter');
 await p.waitForTimeout(150);assert.equal(await p.evaluate(()=>document.querySelector('.panel-head b')?.textContent),'Categoría');
 // El usuario toca la fila Monto para corregir: al continuar vuelve al resumen, sin pasar por Categoría, Cuenta ni Nota.
 await p.click('[data-field="monto"]');await p.waitForSelector('.keypad');await p.keyboard.press('Backspace');await p.keyboard.type('5');await p.keyboard.press('Enter');await p.waitForTimeout(150);
 assert.equal(await p.evaluate(()=>document.querySelector('.entry-panel').classList.contains('hidden')),true,'el panel debía cerrarse');
 assert.match(await p.evaluate(()=>document.querySelector('[data-field="monto"] b').textContent),/25\.00|205\.00|2\.00|20\.00|5\.00/);
 // Corregir la nota (último dato) también cierra.
 await p.click('[data-field="nota"]');await p.waitForTimeout(100);await p.keyboard.type('prueba');await p.keyboard.press('Enter');await p.waitForTimeout(150);
 assert.equal(await p.evaluate(()=>document.querySelector('.entry-panel').classList.contains('hidden')),true);
 // Cuenta: elegir una cierra y no abre la nota.
 await p.click('[data-field="cuenta"]');await p.waitForSelector('[data-option]');await p.click('[data-option]');await p.waitForTimeout(150);
 assert.equal(await p.evaluate(()=>document.querySelector('.entry-panel').classList.contains('hidden')),true,'cuenta debía volver al resumen');
 console.log('OK corregir una fila vuelve al resumen; errores:',env.errors);}finally{await env.close();}})();
