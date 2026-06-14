// SUITE COMPLETE - toute l'application PEA. Usage: node fullapp_tests.js <html>
const fs=require('fs'), vm=require('vm');
const html=fs.readFileSync(process.argv[2],'utf8');
const code=(html.match(/<script>([\s\S]*?)<\/script>/g)||[]).map(function(b){return b.slice(8,-9);}).filter(function(b){return b.indexOf('function calcProj')>=0;})[0];

const noop=()=>{};
function makeEnv(storeInit){
  let els={};
  function mk(){const e={style:{},classList:{_s:new Set(),add(c){this._s.add(c);},remove(c){this._s.delete(c);},toggle:noop,contains(c){return this._s.has(c);}},dataset:{},_a:{},children:[],appendChild(c){this.children.push(c);return c;},removeChild:noop,insertBefore:noop,setAttribute(k,v){this._a[k]=String(v);},getAttribute(k){return k in this._a?this._a[k]:null;},removeAttribute(k){delete this._a[k];},addEventListener:noop,removeEventListener:noop,querySelector:()=>mk(),querySelectorAll:()=>[],getContext:()=>({fillRect:noop,clearRect:noop}),focus:noop,blur:noop,click:noop,remove:noop,closest:()=>mk(),scrollIntoView:noop,scrollTo:noop,reset:noop,select:noop,_t:'',_v:'',placeholder:''};
    Object.defineProperty(e,'textContent',{get(){return e._t;},set(v){e._t=String(v);}});
    Object.defineProperty(e,'innerHTML',{get(){return e.__h||'';},set(v){e.__h=String(v);}});
    Object.defineProperty(e,'value',{get(){return e._v;},set(v){e._v=String(v);}});
    Object.defineProperty(e,'checked',{get(){return false;},set(){}});
    return e;}
  let domCb=null, store=Object.assign({},storeInit||{}), confirmRet=true;
  const document={getElementById:(id)=>els[id]||(els[id]=mk()),querySelector:()=>mk(),querySelectorAll:()=>[],createElement:()=>mk(),createTextNode:()=>mk(),body:mk(),head:mk(),documentElement:mk(),addEventListener:(ev,cb)=>{if(ev==='DOMContentLoaded')domCb=cb;},removeEventListener:noop};
  function Chart(){return{update:noop,destroy:noop,data:{datasets:[{data:[]},{data:[]},{data:[]},{data:[]}],labels:[]},options:{}};}
  Chart.register=noop;Chart.defaults={};
  const localStorage={getItem:(k)=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v);},removeItem:(k)=>{delete store[k];}};
  const sb={document,Chart,localStorage,navigator:{userAgent:'node',share:undefined,clipboard:{writeText:()=>Promise.resolve()}},location:{href:'',reload:noop},scrollTo:noop,alert:noop,confirm:()=>confirmRet,prompt:()=>null,setTimeout:(f)=>{try{f&&f();}catch(e){}},clearTimeout:noop,setInterval:()=>0,clearInterval:noop,requestAnimationFrame:(f)=>{f&&f(0);return 0;},console,Math,Date,JSON,parseInt,parseFloat,isNaN,isFinite,Number,String,Array,Object,Boolean,encodeURIComponent,decodeURIComponent,Blob:function(){this.size=0;},URL:{createObjectURL:()=>'blob:x',revokeObjectURL:noop},FileReader:function(){this.readAsText=noop;}};
  sb.window=sb;sb.globalThis=sb;sb.self=sb;
  let loadErr=null;try{vm.runInContext(code,vm.createContext(sb));}catch(e){loadErr=e;}
  let initErr=null;try{if(domCb)domCb();}catch(e){initErr=e;}
  return {sb,els,store,loadErr,initErr,g:(id)=>els[id]||(els[id]=mk()),setConfirm:(v)=>{confirmRet=v;}};
}

let pass=0,fail=0,fails=[];
function t(n,c){let ok;try{ok=(typeof c==='function')?c():c;}catch(e){ok=false;n+=' ['+e.message+']';}if(ok)pass++;else{fail++;fails.push(n);}}

const E=makeEnv();const sb=E.sb, g=E.g;
function smoke(n,fn){t(n,()=>{fn();return true;});}
function reset(){sb.S.orders=[];sb.S.deposits=[];sb.S.bilans=[];sb.S.checks={};sb.S.scenario='A';sb.S.rate=9;sb.S.dcaBase=180;}

// ===== A. CHARGEMENT =====
t('A01 script charge sans erreur', !E.loadErr);
t('A02 init() sans erreur', !E.initErr);
t('A03 state S existe', typeof sb.S==='object' && Array.isArray(sb.S.orders));

// ===== B. HANDLERS =====
const handlers=new Set();const re=/on(?:click|change|input|submit)="([^"(]+)/g;let m;
while((m=re.exec(html)))handlers.add(m[1].trim());
const missing=[...handlers].filter(n=>typeof sb[n]!=='function');
t('B01 tous les handlers on* definis ('+handlers.size+')', missing.length===0);
if(missing.length) fails.push('   -> manquants: '+missing.join(', '));

// ===== C. IDS UNIQUES (tout le document) =====
// On ignore le contenu des <script>/<style> (ex. code Chart.js intégré) : on ne veut que les vrais id du HTML
const htmlMarkup=html.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'');
const idRe=/id="([^"]+)"/g;const idCount={};let mm;
while((mm=idRe.exec(htmlMarkup))){idCount[mm[1]]=(idCount[mm[1]]||0)+1;}
const dups=Object.keys(idCount).filter(k=>idCount[k]>1);
t('C01 aucun ID duplique ('+Object.keys(idCount).length+' ids)', dups.length===0);
if(dups.length) fails.push('   -> doublons: '+dups.map(d=>d+'x'+idCount[d]).join(', '));

// ===== D. RENDER FUNCTIONS (sans erreur, etat vide ET plein) =====
reset();
smoke('D01 renderAll (vide)', ()=>sb.renderAll());
sb.S.orders=[{etf:'DCAM',cycle:'C0',qty:257,price:5.30,date:'2026-06-15',total:1362.10,note:'init',id:1},
             {etf:'DCAM',cycle:'C1',qty:34,price:5.30,date:'2026-07-01',total:180.20,note:'',id:2},
             {etf:'PAEEM',cycle:'C2',qty:5,price:33,date:'2026-08-01',total:165,note:'',id:3}];
sb.S.deposits=[{date:'2026-06-15',amount:1363,id:1},{date:'2026-07-01',amount:180,id:2}];
smoke('D02 renderAll (avec donnees)', ()=>sb.renderAll());
['renderCycle','renderOrders','renderPRU','renderKPIs','renderCountdown','renderHealthScore','renderCeiling','renderRealAlloc','renderPhases','renderHero','renderComposition','renderC0','renderCash','updateObjectiveTexts','updateScenUI','updateRentes','buildProjChart','updateSim','buildAnnual','renderBilanArchive','renderDcaBaseUI','checkPhaseTransition','buildChecklists','buildBilanPeriods','setupPreview'].forEach((fn,i)=>{
  smoke('D03.'+(i<10?'0':'')+i+' '+fn, ()=>{ if(typeof sb[fn]==='function') sb[fn](); else throw new Error('absente'); });
});

// ===== E. CALCULS vs PLAN =====
reset();
const A7=sb.calcProj('A',7),A9=sb.calcProj('A',9),A11=sb.calcProj('A',11);
const B7=sb.calcProj('B',7),B9=sb.calcProj('B',9),B11=sb.calcProj('B',11);
t('E01 A 7% = 353994', A7[A7.length-1]===353994);
t('E02 A 9% = 504271', A9[A9.length-1]===504271);
t('E03 A 11% = 727301', A11[A11.length-1]===727301);
t('E04 B 7% = 430125', B7[B7.length-1]===430125);
t('E05 B 9% = 600098', B9[B9.length-1]===600098);
t('E06 B 11% = 848583', B11[B11.length-1]===848583);
const iA=sb.calcInvested('A'),iB=sb.calcInvested('B');
t('E07 capital verse A = 117163', iA[iA.length-1]===117163);
t('E08 capital verse B = 153163', iB[iB.length-1]===153163);
t('E09 initialCapital defaut = 1363', sb.initialCapital()===1363);
t('E10 planObjective = 504271', sb.planObjective()===504271);
t('E11 planInvested = 117163', sb.planInvested()===117163);
t('E12 planRente4 = 1459', sb.planRente4()===1459);
t('E13 A milestones croissants', A9.every((v,i)=>i===0||v>=A9[i-1]));
t('E14 30 points par projection', A9.length===30);
const sf=sb.getScenFinals('A');
t('E15 getScenFinals A 9 = 504271', sf[9]===504271);
t('E16 getScenFinals A 7 = 353994', sf[7]===353994);
// Plafond versements 150k (conforme plan : Sc A jamais, Sc B Dec 2055)
sb.S.scenario='A';t('E17 plafond Sc A jamais atteint (null)', sb.planCeilingYear()===null);
sb.S.scenario='B';t('E18 plafond Sc B = 2055', sb.planCeilingYear()===2055);
sb.S.scenario='A';

// ===== F. COURBE REELLE (rappel cle) =====
reset();sb.S.orders=[{etf:'DCAM',cycle:'C1',total:180,date:'2026-07-01',id:1}];
const rc=sb.calcRealTraj();
t('F01 calcRealTraj non-null avec ordre', rc!==null && rc.length===30);
t('F02 calcRealTraj croissante', rc.every((v,i)=>i===0||v>=rc[i-1]));
reset();t('F03 calcRealTraj vide = null', sb.calcRealTraj()===null);

// ===== G. PARCOURS UTILISATEUR =====
reset();
sb.setScen('B');t('G01 setScen B', sb.S.scenario==='B');
sb.setScen('A');t('G02 setScen A', sb.S.scenario==='A');
sb.selRate(11);t('G03 selRate 11', sb.S.rate===11);sb.selRate(9);
g('dca-base-input').value='350';sb.saveDcaBase();
t('G04 saveDcaBase 350', sb.S.dcaBase===350);
const P350=sb.calcProj('A',9);t('G05 dcaBase change la projection', P350[P350.length-1]!==504271);
sb.resetDcaBase();t('G06 resetDcaBase 180', sb.S.dcaBase===180);
t('G07 projection revient a 504271', sb.calcProj('A',9)[29]===504271);
// ordre
reset();g('o-etf').value='DCAM';g('o-cycle').value='C1';g('o-qty').value='34';g('o-price').value='5.30';g('o-date').value='2026-07-01';g('o-note').value='';g('edit-id').value='';
sb.saveOrder();t('G08 saveOrder ajoute', sb.S.orders.length===1);
const oid=sb.S.orders[0].id;E.setConfirm(true);sb.deleteOrder(oid);t('G09 deleteOrder supprime', sb.S.orders.length===0);
// virement
reset();g('dep-amt').value='180';g('dep-date').value='2026-07-01';g('dep-note').value='';sb.addDeposit();
t('G10 addDeposit', sb.S.deposits.length===1);
sb.deleteDeposit(sb.S.deposits[0].id);t('G11 deleteDeposit', sb.S.deposits.length===0);
// apport exceptionnel
sb.addException();t('G12 addException -> C0', g('o-cycle').value==='C0');
g('o-cycle').value='C1';sb.onCycleChange();t('G13 onCycleChange titre auto', g('form-title')._t==='Enregistrer un ordre');
// checklist persistence
reset();const cb=g('chk1');cb.setAttribute('data-key','monthly-0');cb.setAttribute('data-color','#60a5fa');cb.setAttribute('data-done','0');
sb.toggleCheck(cb);t('G14 toggleCheck coche+persiste', sb.S.checks['monthly-0']===1);
sb.toggleCheck(cb);t('G15 toggleCheck decoche', !('monthly-0' in sb.S.checks));
// onboarding / crise
sb.S.onboarded=false;sb.closeOnboarding(null);t('G16 closeOnboarding', sb.S.onboarded===true);
smoke('G17 openCrisis', ()=>sb.openCrisis());
smoke('G18 closeCrisis', ()=>sb.closeCrisis(null));
// bilan
reset();sb.S.orders=[{etf:'DCAM',cycle:'C1',total:1000,date:'2026-07-01',id:1}];
g('b-dcam').value='620';g('b-paeem').value='310';g('b-cem').value='110';g('b-inv').value='1000';g('b-per').value='Decembre 2026';
const nb=sb.S.bilans.length;smoke('G19 computeBilan', ()=>sb.computeBilan());
t('G20 computeBilan archive un bilan', sb.S.bilans.length===nb+1);
smoke('G21 buildAnnual', ()=>sb.buildAnnual());
// export / json
smoke('G22 generateExport', ()=>sb.generateExport());
smoke('G23 downloadJSON', ()=>sb.downloadJSON());
// valorisation
reset();sb.S.orders=[{etf:'DCAM',cycle:'C1',qty:34,price:5,total:170,date:'2026-07-01',id:1}];
g('p-dcam').value='5.5';g('p-paeem').value='33';g('p-cem').value='160';smoke('G24 updateVal', ()=>sb.updateVal());
// navigation
smoke('G25 gotoPage', ()=>sb.gotoPage('dca', g('nav-dca')));
smoke('G26 gotoPageM', ()=>sb.gotoPageM('projections', g('bnav-proj')));

// ===== H. PERSISTANCE & MIGRATION (contextes frais) =====
const seed={orders:[{etf:'DCAM',cycle:'C1',total:180,date:'2026-07-01',id:1}],scenario:'B',rate:11,dcaBase:350,bilans:[],deposits:[{date:'2026-07-01',amount:180,id:1}],checks:{'monthly-0':1},onboarded:true};
const E2=makeEnv({pea_v4:JSON.stringify(seed)});
t('H01 load pea_v4 : orders', E2.sb.S.orders.length===1);
t('H02 load pea_v4 : scenario B', E2.sb.S.scenario==='B');
t('H03 load pea_v4 : dcaBase 350', E2.sb.S.dcaBase===350);
t('H04 load pea_v4 : deposits', E2.sb.S.deposits.length===1);
t('H05 load pea_v4 : checks', E2.sb.S.checks['monthly-0']===1);
const E3=makeEnv({pea_v3:JSON.stringify({orders:[{etf:'DCAM',cycle:'C1',total:99,date:'2026-07-01',id:5}]})});
t('H06 migration pea_v3 -> v4', E3.sb.S.orders.length===1 && E3.sb.S.orders[0].total===99);
// save roundtrip
reset();sb.S.orders=[{etf:'DCAM',cycle:'C1',total:180,date:'2026-07-01',id:1}];sb.save();
t('H07 save ecrit pea_v4', !!E.store['pea_v4'] && JSON.parse(E.store['pea_v4']).orders.length===1);
// deposits defaut pour ancien etat sans deposits
const E4=makeEnv({pea_v4:JSON.stringify({orders:[],scenario:'A',rate:9,dcaBase:180})});
t('H08 etat sans deposits -> [] (pas de crash)', Array.isArray(E4.sb.S.deposits));

// ===== I. ROBUSTESSE / EDGE =====
reset();g('o-qty').value='-5';g('o-price').value='5';g('o-date').value='2026-07-01';let oc=sb.S.orders.length;sb.saveOrder();
t('I01 saveOrder rejette qty<=0', sb.S.orders.length===oc);
g('dep-amt').value='0';g('dep-date').value='2026-07-01';sb.addDeposit();t('I02 addDeposit rejette 0', sb.S.deposits.length===0);
t('I03 soldeEspeces vide = 0', sb.soldeEspeces()===0);
sb.S.deposits=[{date:'a',amount:180,id:1}];sb.S.orders=[{cycle:'C1',total:178.86,id:2}];
t('I04 residuel exact 1.14', sb.soldeEspeces()===1.14);
reset();smoke('I05 renderAll re-vide sans crash', ()=>sb.renderAll());
t('I06 calcProj inchange apres tout', sb.calcProj('A',9)[29]===504271);

// ===== RESULTAT =====
console.log('\n══════════════════════════════════════════');
console.log('  APPLICATION COMPLETE : '+pass+' OK / '+fail+' KO  (total '+(pass+fail)+')');
console.log('══════════════════════════════════════════');
if(fail){console.log('\nECHECS:');fails.forEach(f=>console.log('  X '+f));process.exitCode=1;}
else console.log('  >>> 0 ERREUR SUR TOUTE L\'APPLICATION <<<');
