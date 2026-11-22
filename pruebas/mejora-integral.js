// Corre las pruebas de la mejora integral (Registro Contable + Wallet), una tras otra.
const {execFileSync}=require('node:child_process'),path=require('node:path');
for(const f of ['b1','b5','b3','b2','b4','b6'])execFileSync(process.execPath,[path.join(__dirname,'mejora-integral',f+'.js')],{stdio:'inherit'});
console.log('OK mejora integral');
