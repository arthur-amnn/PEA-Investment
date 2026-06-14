// ~60 tests sur la page DCA + non-regression. Usage: node dca_tests.js <html>
const fs = require('fs');
const vm = require('vm');
const html = fs.readFileSync(process.argv[2], 'utf8');
const code = (html.match(/<script>([\s\S]*?)<\/script>/g)||[]).map(function(b){return b.slice(8,-9);}).filter(function(b){return b.indexOf('function calcProj')>=0;})[0];

const noop = () => {};
let els = {};
function mk() {
  const e = { style:{}, classList:{add:noop,remove:noop,toggle:noop,contains:()=>false}, dataset:{}, _a:{},
    appendChild:noop, removeChild:noop, insertBefore:noop,
    setAttribute(k,v){this._a[k]=v;}, getAttribute(k){return this._a[k]||null;}, removeAttribute:noop,
    addEventListener:noop, querySelector:()=>mk(), querySelectorAll:()=>[], getContext:()=>({}),
    focus:noop, blur:noop, scrollIntoView:noop, reset:noop, select:noop, _t:'', _v:'', placeholder:'' };
  Object.defineProperty(e,'textContent',{get(){return e._t;},set(v){e._t=String(v);}});
  Object.defineProperty(e,'innerHTML',{get(){return e.__h||'';},set(v){e.__h=String(v);}});
  Object.defineProperty(e,'value',{get(){return e._v;},set(v){e._v=String(v);}});
  return e;
}
let domCb=null, store={}, confirmRet=true;
const document = { getElementById:(id)=>els[id]||(els[id]=mk()), querySelector:()=>mk(), querySelectorAll:()=>[],
  createElement:()=>mk(), createTextNode:()=>mk(), body:mk(), head:mk(), documentElement:mk(),
  addEventListener:(ev,cb)=>{if(ev==='DOMContentLoaded')domCb=cb;} };
function Chart(){return {update:noop,destroy:noop,data:{datasets:[{data:[]}]},options:{}};}
Chart.register=noop; Chart.defaults={};
const localStorage = { getItem:(k)=>k in store?store[k]:null, setItem:(k,v)=>{store[k]=String(v);}, removeItem:(k)=>{delete store[k];} };
const sb = { document, Chart, localStorage, navigator:{userAgent:'n',clipboard:{writeText:()=>Promise.resolve()}},
  location:{reload:noop}, alert:noop, confirm:()=>confirmRet, prompt:()=>null,
  setTimeout:(f)=>{try{f&&f();}catch(e){}}, clearTimeout:noop, setInterval:()=>0, clearInterval:noop,
  requestAnimationFrame:(f)=>{f&&f(0);}, console, Math, Date, JSON, parseInt, parseFloat, isNaN, isFinite,
  Number, String, Array, Object, Boolean, encodeURIComponent, decodeURIComponent, Blob:function(){}, URL:{createObjectURL:()=>'x',revokeObjectURL:noop} };
sb.window=sb; sb.globalThis=sb; sb.self=sb;
let loadErr=null; try{ vm.runInContext(code, vm.createContext(sb)); }catch(e){ loadErr=e; }
let initErr=null; try{ if(domCb)domCb(); }catch(e){ initErr=e; }
const g = document.getElementById.bind(document);
function reset(){ sb.S.orders=[]; sb.S.deposits=[]; }
function idCount(id){ return html.split('id="'+id+'"').length-1; }

let pass=0, fail=0, fails=[];
function t(name, cond){ let ok; try{ ok=(typeof cond==='function')?cond():cond; }catch(e){ ok=false; name+=' ['+e.message+']'; } if(ok)pass++; else { fail++; fails.push(name); } }

t('01 script charge', !loadErr);
t('02 init() ok', !initErr);
const handlers=new Set(); const re=/on(?:click|change|input|submit)="([^"(]+)/g; let h;
while((h=re.exec(html))) handlers.add(h[1].trim());
t('03 handlers on* tous definis', [...handlers].every(n=>typeof sb[n]==='function'));
['addDeposit','deleteDeposit','addException','onCycleChange','saveOrder','renderCash','renderC0','soldeEspeces','fmtC','renderCycle','renderCountdown','renderHero','renderComposition','planInvested','planRente4','cashEsc'].forEach((fn,i)=>t('04.'+i+' fn '+fn, typeof sb[fn]==='function'));

['k-next-etf','k-countdown','k-cycle','na2-etf','na2-cd','na2-name','na2-amt','cash-solde','cash-sub','cash-hint','c0-total','c0-card','dep-amt','dep-date','dep-note','dep-list'].forEach(id=>t('05 id unique #'+id, idCount(id)===1));

t('06 page-dca', html.includes('id="page-dca"'));
t('07 page-hero', /id="page-dca"[\s\S]{0,260}page-hero/.test(html));
t('08 na2 card', html.includes('id="na2-etf"'));
t('09 compte especes', html.includes('id="cash-solde"') && html.includes('id="dep-amt"'));
t('10 encart C0', html.includes('id="c0-card"'));
t('11 C0 relabel', /value="C0">[^<]*Apport exceptionnel/.test(html));
t('12 note retiree', !html.includes('Un bonus, une vente'));
t('13 bouton +Apport', html.includes('addException()'));
t('14 bouton +virement', html.includes('addDeposit()'));

reset(); t('15 solde vide=0', sb.soldeEspeces()===0);
reset(); sb.S.deposits=[{date:'2026-07-01',amount:180,id:1}]; t('16 depot=180', sb.soldeEspeces()===180);
sb.S.orders=[{cycle:'C1',total:178.86,id:2}]; t('17 residuel=1.14', sb.soldeEspeces()===1.14);
sb.S.deposits.push({date:'2026-08-01',amount:180,id:3}); sb.S.orders.push({cycle:'C3',total:176,id:4}); t('18 report=5.14', sb.soldeEspeces()===5.14);
reset(); sb.S.deposits=[{date:'a',amount:100,id:1}]; sb.S.orders=[{cycle:'C0',total:150,id:2}]; t('19 solde negatif=-50', sb.soldeEspeces()===-50);
reset(); sb.S.deposits=[{date:'a',amount:33.33,id:1},{date:'b',amount:33.33,id:2},{date:'c',amount:33.33,id:3}]; t('20 precision 99.99', sb.soldeEspeces()===99.99);
reset(); sb.S.deposits=[{date:'a',amount:0.1,id:1},{date:'b',amount:0.2,id:2}]; t('21 precision 0.1+0.2=0.30', sb.soldeEspeces()===0.30);
reset(); let ed=0,ei=0; for(let i=0;i<360;i++){ sb.S.deposits.push({date:'2026-07-01',amount:180,id:1e4+i}); ed+=180; const to=Math.round(31*5.734*100)/100; sb.S.orders.push({cycle:'C1',total:to,id:2e4+i}); ei+=to; }
t('22 vol360 pas NaN', !isNaN(sb.soldeEspeces()));
t('23 vol360 exact', sb.soldeEspeces()===Math.round((ed-ei)*100)/100);

t('25 fmtC 1.14', sb.fmtC(1.14)==='1,14 €');
t('26 fmtC 180', sb.fmtC(180)==='180,00 €');
const ws = s => s.replace(/[\s  ]/g,' ');
t('27 fmtC neg', ws(sb.fmtC(-1363))==='-1 363,00 €');
t('28 fmtC milliers', ws(sb.fmtC(64800))==='64 800,00 €');
t('29 fmtC 0', sb.fmtC(0)==='0,00 €');

reset(); g('dep-amt').value='200'; g('dep-date').value='2026-09-01'; g('dep-note').value='  bonus  '; sb.addDeposit();
t('30 addDeposit ajoute', sb.S.deposits.length===1);
t('31 addDeposit montant', sb.S.deposits[0].amount===200);
t('32 addDeposit note trim', sb.S.deposits[0].note==='bonus');
t('33 addDeposit vide input', g('dep-amt').value==='');
t('34 addDeposit id num', typeof sb.S.deposits[0].id==='number');
const did=sb.S.deposits[0].id; confirmRet=true; sb.deleteDeposit(did);
t('35 deleteDeposit ok', sb.S.deposits.length===0);
reset(); g('dep-amt').value='-50'; g('dep-date').value='2026-09-01'; sb.addDeposit(); t('36 reject neg', sb.S.deposits.length===0);
g('dep-amt').value='0'; g('dep-date').value='2026-09-01'; sb.addDeposit(); t('37 reject zero', sb.S.deposits.length===0);
g('dep-amt').value='abc'; g('dep-date').value='2026-09-01'; sb.addDeposit(); t('38 reject NaN', sb.S.deposits.length===0);
g('dep-amt').value='100'; g('dep-date').value=''; sb.addDeposit(); t('39 reject sans date', sb.S.deposits.length===0);
reset(); g('dep-amt').value='100'; g('dep-date').value='2027-01-01'; sb.addDeposit(); g('dep-amt').value='50'; g('dep-date').value='2026-06-01'; sb.addDeposit();
t('40 tri par date', sb.S.deposits[0].date==='2026-06-01');
confirmRet=false; const nb=sb.S.deposits.length; sb.deleteDeposit(sb.S.deposits[0].id); t('41 delete annulable', sb.S.deposits.length===nb); confirmRet=true;
t('42 cashEsc', sb.cashEsc('<b>&"')==='&lt;b&gt;&amp;&quot;');

reset(); sb.S.orders=[{cycle:'C0',total:1363,id:1},{cycle:'C0',total:165,id:2},{cycle:'C1',total:180,id:3}]; sb.renderC0();
t('43 C0 total 1528', g('c0-total')._t===sb.fmt(1528));
t('44 C0 sub 2 apports', g('c0-sub')._t==='2 apports');
t('45 C0 visible', g('c0-card').style.display==='block');
reset(); sb.S.orders=[{cycle:'C1',total:180,id:1}]; sb.renderC0(); t('46 C0 cachee si 0', g('c0-card').style.display==='none');

reset(); g('edit-id').value=''; sb.addException();
t('47 addException C0', g('o-cycle').value==='C0');
t('48 addException titre', g('form-title')._t==='Apport exceptionnel (C0)');
g('o-cycle').value='C1'; sb.onCycleChange();
t('49 onCycle C1 etf DCAM', g('o-etf').value==='DCAM');
t('50 onCycle C1 titre normal', g('form-title')._t==='Enregistrer un ordre');
t('51 onCycle C1 vide note', g('o-note').value==='');
g('o-cycle').value='C0'; sb.onCycleChange(); t('52 onCycle C0 titre', g('form-title')._t==='Apport exceptionnel (C0)');
g('edit-id').value='99'; g('form-title')._t='Modifier C1'; g('o-cycle').value='C2'; sb.onCycleChange();
t('53 edition titre preserve', g('form-title')._t==='Modifier C1'); g('edit-id').value='';

reset(); sb.S.orders=[{cycle:'C0',total:1363,id:1},{cycle:'C1',total:180,id:2,date:'2026-07-01'}]; sb.renderCycle();
t('54 k-next-etf set', /·/.test(g('k-next-etf')._t));
t('55 na2-etf=k-next-etf', g('na2-etf')._t===g('k-next-etf')._t);
t('56 na2-name mappe', /Amundi/.test(g('na2-name')._t));
t('57 na2-amt=dcaBase', g('na2-amt')._t===(sb.S.dcaBase||180)+' €');
t('58 k-cycle n°', /n°/.test(g('k-cycle')._t));

reset(); sb.renderCountdown(); t('59 countdown vide', g('k-countdown')._t==='a planifier' && g('na2-cd')._t==='a planifier');

reset(); g('o-etf').value='DCAM'; g('o-cycle').value='C1'; g('o-qty').value='34'; g('o-price').value='5.30'; g('o-date').value='2026-07-01'; g('o-note').value=''; g('edit-id').value=''; sb.saveOrder();
t('60 saveOrder ajoute', sb.S.orders.length===1);
t('61 saveOrder total', sb.S.orders[0].total===Math.round(34*5.30*100)/100);
g('o-qty').value='-5'; g('o-price').value='5'; g('o-date').value='2026-07-01'; let oc=sb.S.orders.length; sb.saveOrder(); t('62 reject qty<=0', sb.S.orders.length===oc);
g('o-qty').value='5'; g('o-price').value='5'; g('o-date').value=''; oc=sb.S.orders.length; sb.saveOrder(); t('63 reject sans date', sb.S.orders.length===oc);

reset(); let d9=sb.calcProj('A',9); t('64 calcProj A9=504271', d9[d9.length-1]===504271);
let b9=sb.calcProj('B',9); t('65 calcProj B9=600098', b9[b9.length-1]===600098);
t('66 planInvested=117163', sb.planInvested()===117163);
t('67 planRente4=1459', sb.planRente4()===1459);
t('68 initialCapital=1363', sb.initialCapital()===1363);
let inv=sb.calcInvested('A'); t('69 capital verse A=117163', inv[inv.length-1]===117163);

console.log('\n══════════════════════════════════');
console.log('  TESTS : '+pass+' OK / '+fail+' KO  (total '+(pass+fail)+')');
console.log('══════════════════════════════════');
if(fail){ console.log('\nECHECS:'); fails.forEach(f=>console.log('  X '+f)); process.exitCode=1; }
else console.log('  >>> 0 ERREUR <<<');
