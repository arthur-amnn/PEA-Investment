// Construit une version 100% autonome de l'app (Chart.js + polices intégrés).
// Aucune dépendance Internet -> garantie de fonctionnement à long terme.
const fs = require('fs');

const APP = 'D:\\OneDrive\\Bureau\\Plan PEA\\App\\PEA_Investment.html';
const OUT = 'D:\\OneDrive\\Bureau\\Plan PEA\\App\\PEA_Investment_BUILD.html';
const CHART_URL = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
const FONT_CSS_URL = 'https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600&family=Figtree:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

(async () => {
  let html = fs.readFileSync(APP, 'utf8');

  // ---- 1. Chart.js : télécharger + neutraliser tout </script> ----
  console.log('Téléchargement Chart.js 4.4.1...');
  let chart = await (await fetch(CHART_URL)).text();
  chart = chart.replace(/<\/script/gi, '<\\/script');
  console.log('  Chart.js: ' + chart.length + ' caractères');

  // ---- 2. Polices : CSS Google -> garder latin + latin-ext, woff2 en base64 ----
  console.log('Téléchargement CSS polices...');
  let css = await (await fetch(FONT_CSS_URL, { headers: { 'User-Agent': UA } })).text();
  // découper en blocs "/* subset */ @font-face{...}"
  const re = /\/\*\s*([\w-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/g;
  let m, kept = [], subsets = {};
  const wanted = ['latin', 'latin-ext'];
  let tasks = [];
  while ((m = re.exec(css))) {
    const subset = m[1], block = m[2];
    if (wanted.indexOf(subset) === -1) continue;
    subsets[subset] = (subsets[subset] || 0) + 1;
    tasks.push({ subset, block });
  }
  console.log('  blocs @font-face latin/latin-ext: ' + tasks.length);
  let fontCss = '';
  for (const t of tasks) {
    const urlMatch = t.block.match(/url\((https:\/\/[^)]+\.woff2)\)/);
    if (!urlMatch) { fontCss += t.block + '\n'; continue; }
    const buf = Buffer.from(await (await fetch(urlMatch[1], { headers: { 'User-Agent': UA } })).arrayBuffer());
    const dataUri = 'data:font/woff2;base64,' + buf.toString('base64');
    fontCss += t.block.replace(urlMatch[1], dataUri) + '\n';
  }
  console.log('  polices intégrées, taille CSS: ' + Math.round(fontCss.length / 1024) + ' Ko');

  // ---- 3. Remplacer les 2 références externes ----
  const linkLine = '<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600&family=Figtree:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">';
  const scriptLine = '<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>';
  if (html.indexOf(linkLine) === -1) throw new Error('ligne <link> polices introuvable');
  if (html.indexOf(scriptLine) === -1) throw new Error('ligne <script> Chart.js introuvable');

  html = html.replace(linkLine, '<style>/* Polices EB Garamond / Figtree / DM Mono intégrées (autonome, hors-ligne, 30 ans) */\n' + fontCss + '</style>');
  html = html.replace(scriptLine, '<script>/* Chart.js 4.4.1 intégré (autonome, hors-ligne, 30 ans) */\n' + chart + '\n</script>');

  fs.writeFileSync(OUT, html);
  const kb = Math.round(fs.statSync(OUT).size / 1024);
  console.log('\n>>> Écrit: ' + OUT + ' (' + kb + ' Ko)');
  // vérif aucune référence externe restante
  const ext = (html.match(/https?:\/\/[^"')\s]+/g) || []).filter(u => !u.startsWith('data:'));
  console.log('Références http(s) restantes: ' + ext.length + (ext.length ? ' -> ' + ext.slice(0, 5).join(', ') : ' (AUCUNE)'));
})().catch(e => { console.error('ERREUR BUILD:', e.message); process.exit(1); });
