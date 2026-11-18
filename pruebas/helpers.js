const {chromium}=require('playwright');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
async function start(){
  const root=fs.existsSync(path.resolve(__dirname,'../web/index.html'))?path.resolve(__dirname,'../web'):path.resolve(__dirname,'..');
  const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost');const file=path.resolve(root,'.'+(url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname)));
    if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.js')?'application/javascript':file.endsWith('.png')?'image/png':'application/json');res.end(data);});});
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  let browser;try{browser=await chromium.launch({channel:process.env.PW_CHANNEL||'chrome'});}catch(e){server.close();throw e;}
  const url=`http://127.0.0.1:${server.address().port}/`,errors=[];
  return {browser,url,errors,async page(opts={}){const context=await browser.newContext({acceptDownloads:true,timezoneId:'America/Lima',serviceWorkers:'block',...opts});
    // Las pruebas nunca alcanzan GitHub real ni cargan una bóveda del usuario.
    await context.route('https://api.github.com/**',r=>r.abort());
    const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));await p.clock.setFixedTime(new Date('2026-11-09T17:00:00Z'));await p.goto(url);return p;},
    async close(){await browser.close();await new Promise(r=>server.close(r));}};
}
async function create(p){await p.waitForFunction(()=>document.activeElement?.id==='pw1');await p.fill('#pw1','solo-pruebas-123');await p.fill('#pw2','solo-pruebas-123');await p.click('#btnCreate');await p.waitForSelector('#app:not(.hidden)');}
async function seed(p){await p.evaluate(async()=>{S=blankState();S.settings.hideSetup=true;S.settings.budgets={'TRANSPORTE':100};S.settings.autolock=0;
  S.accounts=[{id:'cash',name:'EFECTIVO',type:'efectivo',currency:'PEN',initial:200},
    {id:'bank',name:'BCP 1046',type:'banco',currency:'PEN',initial:3000},
    {id:'ibk',name:'TC IBK 1174',type:'tarjeta',currency:'PEN',initial:-500,debt:{limit:8000,cutDay:20,dueDay:15,minimum:50}},
    {id:'bcp',name:'TC BCP 2292',type:'tarjeta',currency:'PEN',initial:-1000,debt:{limit:5000,cutDay:20,dueDay:15,minimum:85.73}},
    {id:'usd',name:'AHORRO USD',type:'ahorro',currency:'USD',initial:500},
    {id:'cardusd',name:'TC USD',type:'tarjeta',currency:'USD',initial:-100,debt:{cutDay:20,dueDay:15,minimum:10}},
    {id:'bridge',name:'REEMBOLSOS POR COBRAR',type:'porcobrar',currency:'PEN',initial:20}];
  ui.month='2026-11';ui.tab='resumen';ui.f={q:'',type:'',acc:'',cat:''};SNAP=null;takeSnap();await persist();render();});}
async function open(p,kind){await p.click('.navadd');if(kind!=='gasto'){await p.click('.situation-picker>summary');const choice=p.locator(`.situations [data-kind="${kind}"]`);if(!await choice.isVisible())await p.click('.situation-more>summary');await choice.click();}}
async function saveSituation(p){await p.click('#sSave');await p.waitForSelector('#sSave',{state:'detached'});}
module.exports={start,create,seed,open,saveSituation,assert,fs,path};
