# 05 — Architecture et carte du code

Le fichier `PEA_Investment.html` (~2380 lignes) est structuré ainsi :

```
<head>
  <link> polices Google (EB Garamond, Figtree, DM Mono)
  <script src> Chart.js 4.4.1 (CDN)
  <style> ... tout le CSS (variables + composants) ...
</head>
<body>
  <aside class="sidebar"> navigation desktop
  <nav class="bnav">      navigation mobile (bas)
  modales : #crisis-overlay, #onb-overlay (onboarding)
  <main> 7 <section class="page"> (dashboard, dca, projections, bilan, export, etfs, checklist)
  <script> ... tout le JS ...
  document.addEventListener('DOMContentLoaded', init);
</body>
```

## Design system (CSS)

Variables (`:root`) — **ne pas changer la charte sans raison** :
```
--bg:#0c1420  --bg2:#111c2e  --bg3:#162033  --bg4:#1a2840   (fonds, du + sombre au + clair)
--gold:#C9913A   (doré principal)        --gold2:rgba(201,145,58,.13)  (doré « soft » = fond)
--border:rgba(201,145,58,.15)            --border2:rgba(255,255,255,.08)
--txt:rgba(255,255,255,.9)  --txt2:rgba(255,255,255,.55)  --muted:rgba(255,255,255,.3)
--blue/--green/--red/--purple (+ variantes …2 = fond translucide)
```
⚠️ **Piège fréquent :** `--gold2` est un **fond doré translucide**, PAS un doré clair. Le doré clair utilisé dans les dégradés est écrit en dur : **`#e0b25e`** (clair) et **`#f0cf8e`** (très clair).

Composants clés :
- `.cc` / `.card` : cartes (titres de section `.st` en **EB Garamond serif**).
- `.hero-imm` + `.hi-*` : **hero immersif du Dashboard** (dégradé radial, frise `.hi-line`/`.hi-node`/`.hi-lbl`, rente `.hi-big`).
- `.page-hero` + `.hp-*` : **en-tête hero des 6 sous-pages** (version allégée).
- `.next-action` + `.na-*` : carte « prochain ordre » (Dashboard `k-next-*` et page DCA `na2-*`).
- `.ph-list` / `.ph-row` / `.ph-num` : **phases numérotées 1/2/3**.
- `.comp-bar` / `.comp-leg` : **composition** versé/intérêts.
- Responsive : `@media(max-width:700px)` mobile portrait ; `@media …max-height:500px` paysage iPhone (sidebar compacte).

## Carte des fonctions JS (par domaine)

**Init / état**
`init` (DOMContentLoaded), `save`, `getPhases`, `dcaOrders`

**Calculs financiers** (voir `03_CALCULS`)
`calcProj`, `calcProjCustom`, `calcInvested`, `initialCapital`, `calcRealTraj`, `planObjective`, `planInvested`, `planRente4`, `soldeEspeces`, `getScenFinals`, `nextDates`

**Rendu Dashboard**
`renderAll` (orchestrateur), `renderKPIs`, `renderCountdown`, `renderHealthScore`, `renderCeiling`, `renderRealAlloc`, `renderHero`, `renderComposition`, `renderC0`, `renderCash`, `renderPhases`, `updateObjectiveTexts`, `updateVal`

**Suivi DCA**
`renderCycle`, `renderOrders`, `renderPRU`, `saveOrder`, `editOrder`, `deleteOrder`, `cancelEdit`, `onCycleChange`, `addException`, `saveDcaBase`, `resetDcaBase`, `renderDcaBaseUI`, `checkPhaseTransition`, `applyPhase`, `setupPreview`
**Compte espèces** : `addDeposit`, `deleteDeposit`, `renderCash`, `soldeEspeces`, `cashEsc`

**Projections**
`setScen`, `selRate`, `updateScenUI`, `updateRentes`, `updateSim`, `buildProjChart`, `makeProjDatasets`, `buildEvolChart`

**Bilan / Export**
`computeBilan`, `buildAnnual`, `renderBilanArchive`, `deleteBilan`, `buildBilanPeriods`, `generateExport`, `copyReport`, `shareReport`, `downloadJSON`, `triggerImport`, `handleImport`

**Checklists / modales / nav**
`buildChecklists`, `toggleCheck`, `setCheckState`, `openCrisis`, `closeCrisis`, `closeOnboarding`, `gotoPage`, `gotoPageM`, `selectAllText`

**Formatage**
`fmt` (euro arrondi), `fmtK` (k€), `fmtP` (2 déc.), `fmtC` (centimes — compte espèces)

## Constantes clés
- `CYCLE_DEF` (10 entrées) · `PEA_DCA_START` (Juillet 2026) · `PEA_OPEN_DATE` (Juin 2026) · `MN` (mois courts) · `CL` (textes des checklists).

## IDs critiques (pilotés par le JS — ne pas dupliquer ni renommer sans MAJ du JS)

- Dashboard : `k-pat(-s)`, `k-inv(-s)`, `k-pv`, `k-cycle(-s)`, `k-next-etf`, `k-next-name`, `k-next-amt`, `k-countdown`, `hi-dca`, `hi-obj`, `hi-rente`, `hi-now`, `comp-obj/v/i/verse/int/scn`, `hs-*`, `ceil-*`, `alloc-real-wrap`, `ph1/2/3-badge`.
- DCA : `na2-etf/name/amt/cd`, `cycle-round`, `cycle-info`, `cycle-display`, `c0-card/total/sub`, `cash-solde/sub/hint`, `dep-amt/date/note/list`, `o-etf/cycle/qty/price/date/note`, `edit-id`, `form-title`, `pru-*`, `dca-base-input`.
- Projections : `btn-A/B`, `sc-7/9/11`, `s7v/s9v/s11v`, `ms5/10/18/30`, `sim-*`, `chart-proj`, `rente-3pct/4pct`, `alert-obj/rente4`.
- Une vérification automatique des **doublons d'ID** est dans `tests/fullapp_tests.js` (test C01).
