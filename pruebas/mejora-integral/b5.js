// Mejora integral (v27–v31). Solo datos ficticios y GitHub simulado.
const OUT=require('path').join(__dirname,'../resultados-mejora-integral/');require('fs').mkdirSync(OUT,{recursive:true});
const {start,create,assert}=require('../helpers');const seed=require('./seed');
(async()=>{const env=await start();try{const p=await env.page({viewport:{width:360,height:780},colorScheme:'dark',deviceScaleFactor:1.5});
 await p.clock.setFixedTime(new Date('2026-11-22T15:00:00Z'));await p.reload();await create(p);await seed(p);
 await p.evaluate(()=>{document.querySelectorAll('.toast').forEach(t=>t.remove());navigate('movs');});
 // búsqueda en vivo sin perder el cursor
 await p.click('[data-act="movSearch"]');await p.click('#movQ');await p.keyboard.type('taxi');await p.waitForTimeout(400);
 assert.equal(await p.evaluate(()=>document.activeElement.id),'movQ');assert.equal(await p.locator('#movBody .tx').count(),1);
 // buscar en todos los meses: sueldo de octubre
 await p.fill('#movQ','sueldo');await p.waitForTimeout(400);assert.equal(await p.locator('#movBody .tx').count(),0);
 await p.click('[data-act="movAll"]');assert.equal(await p.locator('#movBody .tx').count(),1);
 // buscar por monto
 await p.fill('#movQ','745');await p.waitForTimeout(400);assert.equal(await p.locator('#movBody .tx').count(),1);
 await p.click('[data-act="movQClear"]');
 // filtros (v38: desde el ícono del encabezado; cada filtro activo sale como chip con ✕)
 await p.click('[data-act="movementFilters"]');await p.selectOption('#ftype','gasto');await p.click('#filterApply');const g=await p.locator('#movBody .tx').count();assert.equal(g,7);
 await p.click('[data-act="movementFilters"]');await p.selectOption('#facc','ef');await p.click('#filterApply');assert.equal(await p.locator('#movBody .tx').count(),2);
 await p.click('[data-act="movAccPick"]');assert.equal(await p.locator('#movBody .tx').count(),7);await p.evaluate(()=>{ui.f.acc='ef';render();});
 await p.screenshot({path:OUT+'b5-filtros.png'});
 await p.click('[data-act="clearF"]');
 // mantener presionado → selección; cambiar categoría a 2 y deshacer
 const row=p.locator('#movBody .tx[data-id="g1"]');const box=await row.boundingBox();await p.mouse.move(box.x+20,box.y+20);await p.mouse.down();await p.waitForTimeout(700);await p.mouse.up();
 assert.ok(await p.evaluate(()=>ui.selMode));await p.click('#movBody .tx[data-id="g2"]');
 assert.deepEqual(await p.evaluate(()=>ui.sel.sort()),['g1','g2']);await p.screenshot({path:OUT+'b5-sel.png'});
 await p.click('[data-act="bulkCat"]');await p.selectOption('#bulkCatSel','HIJA|TRANSPORTE');await p.click('#bulkOk');
 assert.deepEqual(await p.evaluate(()=>S.tx.filter(t=>['g1','g2'].includes(t.id)).map(t=>t.cat+'/'+t.sub)),['HIJA/TRANSPORTE','HIJA/TRANSPORTE']);
 await p.click('.toast button');assert.deepEqual(await p.evaluate(()=>S.tx.filter(t=>['g1','g2'].includes(t.id)).map(t=>t.cat)),['PERSONAL','PERSONAL']);
 // borrar varios con deshacer
 await p.evaluate(()=>{ui.selMode=true;ui.sel=['g1','g2'];refreshMovs();});await p.click('[data-act="bulkDel"]');await p.click('#askOk');
 assert.equal(await p.evaluate(()=>S.tx.filter(t=>['g1','g2'].includes(t.id)).length),0);await p.click('.toast button');assert.equal(await p.evaluate(()=>S.tx.filter(t=>['g1','g2'].includes(t.id)).length),2);
 // cuenta: mover a BCP 1046
 await p.evaluate(()=>{ui.selMode=true;ui.sel=['g1','g2'];refreshMovs();});await p.click('[data-act="bulkAcc"]');await p.click('[data-pick="b1"]');assert.deepEqual(await p.evaluate(()=>S.tx.filter(t=>['g1','g2'].includes(t.id)).map(t=>t.acc)),['b1','b1']);
 console.log('OK bloque 5; errores:',env.errors);}finally{await env.close();}})();
