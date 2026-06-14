# PEA Investment — Résumé de reprise

> **À coller au début d'une nouvelle conversation pour reprendre le projet.**
> Pour la doc complète (maintenance, calculs, code, tests), voir le dossier **`DOC/`** — c'est désormais la **source autoritative**. Ce résumé n'en est qu'un point d'entrée court.

## En bref
Application web **mono-fichier** `PEA_Investment.html` (HTML/CSS/JS inline, Chart.js CDN, PWA iPhone) de pilotage d'un **PEA Fortuneo sur 30 ans (2026→2056)**. Données **locales** (`localStorage`, clé `pea_v4`). Portefeuille **60/30/10** (DCAM/PAEEM/CEM), **1 ordre/mois** sur cycle 10 mois, 3 phases d'apport (180→350→500€). Utilisateur ~24 ans, alternance.

## État actuel (validé 2026-05-31) — design « v2 »
- **7 pages** au design doré harmonisé : Dashboard (**hero immersif** : frise 30 ans, objectif, rente, composition versé/intérêts, phases numérotées), Suivi DCA, Projections, Bilan, Export, 3 ETF, Checklists.
- **Fonctions ajoutées** sur Suivi DCA : encart **apports exceptionnels (C0)**, **compte espèces PEA** (résiduel auto = Σ virements − Σ achats), bouton **+ Apport exceptionnel**, carte prochain ordre.
- **Validé : 214 tests automatiques à 0 erreur** (`DOC/tests/`) + `node --check` OK. Aucun ID dupliqué, aucun handler orphelin.
- Sauvegarde de référence : `PEA_Investment_BACKUP_20260531.html`.

## Décisions clés (détail dans `DOC/09_HISTORIQUE_DECISIONS.md`)
1. **1er DCA = Juillet 2026** (déploiement initial Juin) — le **plan prime** sur ce résumé.
2. Projections **incluent le capital initial** (`calcProj` part de `initialCapital()` ≈ 1363€) → retombent sur **504k (A·9%) / 600k (B·9%)** du plan.
3. `initialCapital()` ne compte que les **C0 antérieurs au 1er DCA** ; les apports C0 ultérieurs sont gérés **datés** par la courbe « Réel ».
4. **Compte espèces / résiduel** : modèle Σ virements − Σ achats, exact au centime, indépendant des autres calculs.

## Chiffres de référence (source : `DOC/03_CALCULS_ET_FORMULES.md`)
A = 354/**504**/727 k€, B = 430/**600**/849 k€ (à 7/9/11%). Capital versé A=117 163€ / B=153 163€. Rente 4% ≈ 1 459€/mois.

## Méthode de travail (impérative)
Le **plan métier prime** (cf. `DOC/02` et `DOC/03`). Ne jamais inventer une règle financière ; signaler les ambiguïtés. Modifs chirurgicales + compatibilité `pea_v4`. Conventions : apostrophes échappées, charts en `.update()` (jamais destroy/recreate), pas d'ID dupliqué, style dark + doré #C9913A (EB Garamond / Figtree / DM Mono). **Toujours** finir par `node --check` + les 214 tests à 0 erreur (cf. `DOC/07_TESTS_ET_VALIDATION.md`).

## Validation rapide
```
node DOC/tests/fullapp_tests.js   PEA_Investment.html   ->  91/91
node DOC/tests/dca_tests.js       PEA_Investment.html   ->  98/98
node DOC/tests/realcurve_tests.js PEA_Investment.html   ->  25/25
```
(Node hors PATH possible : `C:\Program Files\nodejs\node.exe`.)
