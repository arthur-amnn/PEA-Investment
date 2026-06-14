# 06 — Fonctionnalités (les 7 pages)

Navigation : barre latérale (desktop) `gotoPage()` / barre du bas (mobile) `gotoPageM()`. Une seule `.page` a la classe `active` à la fois.

## 1. Dashboard (Cockpit)
- **Hero immersif** : « De 180 €/mois à 504 000 € à 54 ans » + **frise 30 ans** (2026/2036/2044/2056) + **rente ≈ 1 459 €/mois** (règle 4 %). Alimenté par `renderHero()`.
- **Carte « Prochain ordre »** : cycle + ETF + montant + compte à rebours (`renderCycle` + `renderCountdown`).
- **KPIs** : Capital PEA, Total investi, PV latente, Cycle en cours (`renderKPIs`, `renderCycle`).
- **Valorisation marché** : saisie des cours actuels → PV (`updateVal`).
- **Santé du plan** (score /10), **Plafond PEA** (jauge), **Allocation réelle** (donut + écarts).
- **Les 3 phases** (numérotées, badge « En cours », `renderPhases`).
- **Composition à 54 ans** : barre 23 % versé / 77 % intérêts (`renderComposition`).

## 2. Suivi DCA
- **Cycle visuel** C1→C10 (`renderCycle`, `#cycle-display`).
- **DCA mensuel de base** : change le montant Phase 1 utilisé dans les projections (`saveDcaBase` / `resetDcaBase`). N'affecte **pas** les ordres déjà passés.
- **Apports exceptionnels (C0)** : encart de cumul (`renderC0`).
- **Compte espèces PEA** (résiduel auto) : solde = Σ virements − Σ achats ; ajout/suppression de virements (`addDeposit` / `deleteDeposit` / `renderCash`).
- **Formulaire d'ordre** : ETF / cycle / parts / prix / date / note (`saveOrder`). Bouton **« + Apport exceptionnel »** (`addException`) qui pré-sélectionne le cycle C0. Le titre du formulaire suit automatiquement le cycle choisi (`onCycleChange`).
- **PRU** par ETF, **historique** des ordres (édition/suppression : `editOrder` / `deleteOrder`), **graphique d'évolution**.

> **Investir + ou − que le DCA** : intrinsèque — on saisit le nombre de **parts entières** et le **prix réel** ; le total enregistré est le montant réel (jamais « 180 € pile »). Le reste (résiduel) est suivi par le compte espèces.

## 3. Projections 30 ans (Simulations)
- Boutons **Scénario A / B** (`setScen`), sélecteur **taux 7/9/11 %** (`selRate`).
- **Jalons** An 5 / 10 / 18 / 30.
- **Simulateur** « +X €/mois » (curseur → `updateSim` / `calcProjCustom`).
- **Graphique** : 3 courbes théoriques (7/9/11 %) + **courbe violette « Réel »** (`calcRealTraj`) qui se construit avec tes vrais ordres.
- **Rentes à 54 ans** : règle 3 % et 4 % (`updateRentes`).

## 4. Bilan semestriel
- Saisie des valeurs marché → calcul des **écarts vs 60/30/10** → **action recommandée** (RAS / surpondérer / arbitrage) → **archivage** (`computeBilan`), **historique annuel** (`buildAnnual`), suppression (`deleteBilan`).

## 5. Export Claude
- Génère un **rapport texte** complet (`generateExport`) à coller dans une IA tous les 6 mois ; **Copier** (`copyReport`) / **Partager** iOS (`shareReport`) ; **export/import JSON** de sauvegarde (`downloadJSON` / `triggerImport` / `handleImport`).

## 6. Les 3 ETF
- Fiches de référence DCAM / PAEEM / CEM (ISIN, TER, rôle). Statique.

## 7. Checklists
- Mensuelle, semestrielle, crise, règles d'or — **cases cochables persistées** (`toggleCheck` → `S.checks`).

## Éléments transverses
- **Bouton Mode Crise** (flottant rouge) → modale 5 règles d'urgence (`openCrisis` / `closeCrisis`).
- **Onboarding** au tout premier lancement (aucun ordre, jamais vu) → modale 4 étapes (`closeOnboarding`, flag `S.onboarded`).
- **Bannière d'installation iOS** (si Safari iPhone non installé).
