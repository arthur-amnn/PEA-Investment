// Tests de la courbe REELLE (calcRealTraj) : DCA + apports exceptionnels + croissance.
const fs=require('fs'), vm=require('vm');
const html=fs.readFileSync(process.argv[2],'utf8');
const code=(html.match(/<script>([\s\S]*?)<\/script>/g)||[]).map(function(b){return b.slice(8,-9);}).filter(function(b){return b.indexOf('function calcProj')>=0;})[0];
const noop=()=>{};let els={};
function mk(){const e={style:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},dataset:{},_a:{},appendChild:noop,setAttribute(k,v){this._a[k]=v;},getAttribute(k){return this._a[k]||null;},removeAttribute:noop,addEventListener:noop,querySelector:()=>mk(),querySelectorAll:()=>[],getContext:()=>({}),focus:noop,scrollIntoView:noop,_t:'',_v:''};Object.defineProperty(e,'textContent',{get(){return e._t;},set(v){e._t=String(v);}});Object.defineProperty(e,'innerHTML',{get(){return'';},set(){}});Object.defineProperty(e,'value',{get(){return e._v;},set(v){e._v=String(v);}});return e;}
let domCb=null,store={};
const document={getElementById:(id)=>els[id]||(els[id]=mk()),querySelector:()=>mk(),querySelectorAll:()=>[],createElement:()=>mk(),body:mk(),head:mk(),documentElement:mk(),addEventListener:(ev,cb)=>{if(ev==='DOMContentLoaded')domCb=cb;}};
function Chart(){return{update:noop,destroy:noop,data:{datasets:[{data:[]}]}};}Chart.register=noop;Chart.defaults={};
const localStorage={getItem:()=>null,setItem:noop,removeItem:noop};
const sb={document,Chart,localStorage,navigator:{userAgent:'n',clipboard:{writeText:()=>Promise.resolve()}},location:{reload:noop},alert:noop,confirm:()=>true,setTimeout:(f)=>{try{f&&f();}catch(e){}},clearTimeout:noop,setInterval:()=>0,clearInterval:noop,requestAnimationFrame:(f)=>{f&&f(0);},console,Math,Date,JSON,parseInt,parseFloat,isNaN,isFinite,Number,String,Array,Object,Boolean,encodeURIComponent,decodeURIComponent};
sb.window=sb;sb.globalThis=sb;
vm.runInContext(code,vm.createContext(sb));if(domCb)domCb();

let pass=0,fail=0,fails=[];
function t(n,c){let ok;try{ok=(typeof c==='function')?c():c;}catch(e){ok=false;n+=' ['+e.message+']';}if(ok)pass++;else{fail++;fails.push(n);}}
const S=sb.S;
function setRate(r){S.rate=r;}
// compounding manuel d'un ordre jusqu'a fin d'annee cible
function manual(total, dateStr, year, rate){
  const mr=Math.pow(1+rate/100,1/12)-1;
  const od=new Date(dateStr+'T12:00:00');
  const td=new Date(year,11,31);
  let me=(td.getFullYear()-od.getFullYear())*12+(td.getMonth()-od.getMonth());
  if(me<0)me=0;
  return total*Math.pow(1+mr,me);
}

// 1. vide -> null
S.orders=[];setRate(9);t('01 vide -> null', sb.calcRealTraj()===null);
// 2. un ordre DCA -> array 30, non-null partout (ordre 2026-07)
S.orders=[{etf:'DCAM',cycle:'C1',total:180,date:'2026-07-01',id:1}];
let c=sb.calcRealTraj();
t('02 longueur 30', Array.isArray(c)&&c.length===30);
t('03 tous non-null (ordre debut)', c.every(v=>v!==null));
// 3. An1 (2027) = manuel
t('04 An1 = compounding manuel', c[0]===Math.round(manual(180,'2026-07-01',2027,9)));
// 4. An30 (2056) = manuel (365 mois)
t('05 An30 = compounding manuel', c[29]===Math.round(manual(180,'2026-07-01',2056,9)));
// 5. monotone croissante
let mono=true;for(let i=1;i<30;i++)if(c[i]<=c[i-1])mono=false;
t('06 courbe strictement croissante', mono);
// 6. croit avec le taux
S.orders=[{etf:'DCAM',cycle:'C1',total:180,date:'2026-07-01',id:1}];
setRate(7);let c7=sb.calcRealTraj();setRate(9);let c9=sb.calcRealTraj();setRate(11);let c11=sb.calcRealTraj();
t('07 taux 11 > taux 9 (An30)', c11[29]>c9[29]);
t('08 taux 9 > taux 7 (An30)', c9[29]>c7[29]);
t('09 changement de taux recalcule', c7[29]!==c9[29]);

// ===== APPORTS EXCEPTIONNELS (C0) =====
setRate(9);
// 7. un C0 seul produit une courbe
S.orders=[{etf:'DCAM',cycle:'C0',total:1363,date:'2026-06-15',id:1}];
t('10 C0 seul -> courbe non-null', sb.calcRealTraj()!==null);
// 8. DCA + C0 : An30 = somme des deux compoundings
S.orders=[{etf:'DCAM',cycle:'C0',total:1363,date:'2026-06-15',id:1},{etf:'DCAM',cycle:'C1',total:180,date:'2026-07-01',id:2}];
let cc=sb.calcRealTraj();
let exp30=Math.round(manual(1363,'2026-06-15',2056,9)+manual(180,'2026-07-01',2056,9));
t('11 DCA+C0 An30 = somme compoundings', cc[29]===exp30);
// 9. ajouter un C0 augmente la valeur finale
let withoutC0=[{etf:'DCAM',cycle:'C1',total:180,date:'2026-07-01',id:2}];
S.orders=withoutC0;let a=sb.calcRealTraj()[29];
S.orders=withoutC0.concat([{etf:'PAEEM',cycle:'C0',total:1000,date:'2026-07-01',id:9}]);let b=sb.calcRealTraj()[29];
t('12 ajout C0 augmente An30', b>a);
// 10. bonus FUTUR (2040) : annees avant inchangees, apparait a partir de 2040
let base=[{etf:'DCAM',cycle:'C1',total:180,date:'2026-07-01',id:1}];
S.orders=base;let cb=sb.calcRealTraj();
S.orders=base.concat([{etf:'CEM',cycle:'C0',total:5000,date:'2040-03-01',id:7}]);let cbon=sb.calcRealTraj();
// 2039 = index 12 (2027+12) ; bonus 2040 ne doit pas l'affecter
t('13 bonus 2040 : An 2039 inchange', cbon[2039-2027]===cb[2039-2027]);
// 2040 = index 13 : doit augmenter
t('14 bonus 2040 : An 2040 augmente', cbon[2040-2027]>cb[2040-2027]);
// delta 2040 ~ 5000 compose sur ~10 mois (mars->dec)
t('15 bonus 2040 valeur coherente (±1€ arrondi)', Math.abs((cbon[2040-2027]-cb[2040-2027])-Math.round(manual(5000,'2040-03-01',2040,9)))<=1);

// ===== EXCLUSION ORDRES FUTURS =====
S.orders=[{etf:'DCAM',cycle:'C1',total:200,date:'2030-05-01',id:1}];
let cf=sb.calcRealTraj();
t('16 avant 1er ordre -> null (2027)', cf[2027-2027]===null);
t('17 avant 1er ordre -> null (2029)', cf[2029-2027]===null);
t('18 a partir de 2030 -> non-null', cf[2030-2027]!==null);
// ordre apres 2056 -> tout null -> retourne null
S.orders=[{etf:'DCAM',cycle:'C1',total:200,date:'2060-01-01',id:1}];
t('19 ordre apres horizon -> null', sb.calcRealTraj()===null);

// ===== AUTRES =====
// deux ordres meme date additifs
S.orders=[{etf:'DCAM',cycle:'C1',total:100,date:'2026-07-01',id:1},{etf:'PAEEM',cycle:'C2',total:50,date:'2026-07-01',id:2}];
let cmix=sb.calcRealTraj();
t('20 deux ordres meme date additifs', cmix[29]===Math.round(manual(150,'2026-07-01',2056,9)));
// inclut tous cycles (C5,C8,C0)
S.orders=[{etf:'DCAM',cycle:'C5',total:100,date:'2026-07-01',id:1},{etf:'CEM',cycle:'C8',total:50,date:'2026-07-01',id:2}];
t('21 inclut C5 et C8', sb.calcRealTraj()[29]===Math.round(manual(150,'2026-07-01',2056,9)));
// croissance incrementale : ajouter des ordres mois apres mois augmente An30
let acc=[];let prev=0;let growthOK=true;
for(let m=0;m<6;m++){acc.push({etf:'DCAM',cycle:'C1',total:180,date:'2026-0'+(7+m)+'-01',id:m});S.orders=acc;let v=sb.calcRealTraj()[29];if(v<=prev)growthOK=false;prev=v;}
t('22 chaque ordre ajoute fait monter An30', growthOK);
// volume 120 ordres, pas de NaN
S.orders=[];for(let i=0;i<120;i++)S.orders.push({etf:'DCAM',cycle:'C1',total:180,date:'2026-07-01',id:i});
let cv=sb.calcRealTraj();
t('23 volume 120 ordres : pas de NaN', cv.every(v=>v===null||!isNaN(v)));
t('24 volume 120 : An30 = 120 ordres composes', cv[29]===Math.round(120*manual(180,'2026-07-01',2056,9)));
// le cash residuel (deposits) n'affecte PAS la courbe reelle
S.orders=[{etf:'DCAM',cycle:'C1',total:180,date:'2026-07-01',id:1}];S.deposits=[{date:'2026-07-01',amount:5000,id:1}];
t('25 deposits n influencent PAS la courbe reelle', sb.calcRealTraj()[29]===Math.round(manual(180,'2026-07-01',2056,9)));

console.log('\n══════════════════════════════════');
console.log('  COURBE REELLE : '+pass+' OK / '+fail+' KO  (total '+(pass+fail)+')');
console.log('══════════════════════════════════');
if(fail){console.log('\nECHECS:');fails.forEach(f=>console.log('  X '+f));process.exitCode=1;}
else console.log('  >>> 0 ERREUR <<<');
