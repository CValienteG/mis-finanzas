// Datos parecidos a los reales del 21-nov (solo locales, para auditar pantallas).
module.exports=async function seed(p){await p.evaluate(async()=>{S=blankState();S.settings={...S.settings,tc:3.4,autolock:0,hideSetup:true};
 const A=(id,name,type,currency,initial,extra={})=>({id,name,type,currency,initial,archived:false,u:1,...extra});
 S.accounts=[A('ef','EFECTIVO','efectivo','PEN',260),A('b1','BCP 1046','banco','PEN',900),A('b2','BCP 7081','banco','PEN',0),A('i1','IBK 9408','banco','PEN',5.79),A('ag','AGORA','banco','PEN',0),
  A('sip','AHORRAMÁS SIP 0199','ahorro','PEN',1800.48),A('wa','WARDA BCP','ahorro','PEN',0),A('b3','BCP 3090','ahorro','PEN',0),A('u1','IBK 9445','banco','USD',0),A('u2','BCP 8188','banco','USD',0),
  A('t1','TC IBK 1174','tarjeta','PEN',-2523.71,{debt:{limit:2500,cutDay:26,dueDay:5}}),A('t2','TC BCP 2292','tarjeta','PEN',-2036.71,{debt:{limit:6000,cutDay:25,dueDay:23,dayRule:'prev'}}),A('t3','TC CMR 4131','tarjeta','PEN',-280.59,{debt:{limit:1500,cutDay:10,dueDay:5}}),
  A('pr','PRÉSTAMO IBK','porpagar','PEN',-4409.19,{debt:{cuota:565.69,cuotasRest:9,dueDay:2}}),A('bo','BONIFICACIÓN EDUCACIONAL SBP','ahorro','PEN',3000,{noDisponible:true})];
 const g=(id,cat,sub,amount,note,date,acc='b1')=>({id,kind:'gasto',type:'gasto',acc,amount,currency:'PEN',pen:amount,cat,sub,date,note,u:1});
 S.tx=[g('g1','PERSONAL','ALIMENTACIÓN › COMIDAS FUERA',15,'Menú','2026-11-20T13:00','ef'),g('g2','PERSONAL','TRANSPORTE',8,'Taxi','2026-11-20T18:00','ef'),
  g('g3','HIJA','EDUCACIÓN › COLEGIO › PENSIONES',745,'Pensión noviembre','2026-11-05T10:00'),g('g4','HIJA','ALIMENTACIÓN › VÍVERES',62.5,'Víveres hija','2026-11-15T10:00'),
  g('g5','PERSONAL','SUSCRIPCIONES',44.9,'Netflix','2026-11-16T09:00','t3'),g('g6','PADRES','',200,'Apoyo mamá','2026-11-10T09:00'),g('g7','PERSONAL','ALIMENTACIÓN › VÍVERES',120,'Plaza Vea','2026-11-18T19:00','t2'),
  {id:'in1',kind:'ingreso',type:'ingreso',acc:'b1',amount:4200,currency:'PEN',pen:4200,cat:'PERSONAL',sub:'TRABAJO › SUELDO',date:'2026-10-31T09:00',note:'Sueldo octubre',u:1}];
 S.people=[{id:'pe1',name:'GRUPO EMAÚS PERÚ',kind:'empresa',u:1},{id:'pe2',name:'MAPFRE',kind:'empresa',u:1}];
 S.tx.push({id:'sp1',kind:'reembolso',type:'transfer',acc:null,person:'pe1',amount:3870,currency:'PEN',pen:0,opening:true,personName:'GRUPO EMAÚS PERÚ',date:'2026-11-20T00:00',note:'Comisión de venta',u:1},
   {id:'sp2',kind:'reembolso',type:'transfer',acc:null,person:'pe2',amount:970,currency:'PEN',pen:0,opening:true,personName:'MAPFRE',date:'2026-11-20T00:00',note:'Reembolso médico',u:1});
 S.fijos=[{id:'f1',name:'Netflix',tipo:'pago',freq:'mensual',dia:16,template:{kind:'gasto',amount:44.9,currency:'PEN',acc:'t3',cat:'PERSONAL',sub:'SUSCRIPCIONES'},montoFijo:true,desde:'2026-11-01',avisarDias:3,skips:[],u:1},
  {id:'f2',name:'Google One',tipo:'pago',freq:'mensual',dia:25,template:{kind:'gasto',amount:2.25,currency:'USD',acc:'t1',cat:'PERSONAL',sub:'SUSCRIPCIONES'},montoFijo:true,desde:'2026-11-01',avisarDias:3,skips:[],u:1},
  {id:'f3',name:'Claude',tipo:'pago',freq:'mensual',dia:20,template:{kind:'gasto',amount:20,currency:'USD',acc:'t1',cat:'PERSONAL',sub:'SUSCRIPCIONES'},montoFijo:true,desde:'2026-11-01',avisarDias:3,skips:[],u:1}];
 ui.month='2026-11';ui.tab='resumen';SNAP=null;takeSnap();await persist();render();});}
