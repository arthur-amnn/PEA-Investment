# 09 — Historique des décisions (le « pourquoi »)

Journal des choix structurants. Comprendre le **pourquoi** évite de « corriger » par erreur un comportement voulu.

## 2026-05 — Date du premier DCA : Juillet 2026
- **Décision :** déploiement du capital initial en **Juin 2026** (`PEA_OPEN_DATE`), **premier DCA C1 en Juillet 2026** (`PEA_DCA_START = new Date(2026, 6, 1)`).
- **Pourquoi :** conformité au plan d'origine (qui prime sur le résumé qui disait « Août »).

## 2026-05 — Les projections incluent le capital initial
- **Décision :** `calcProj()` part de `initialCapital()` (≈ 1363 €) et non de 0.
- **Pourquoi :** sans cela, les projections sortaient ~486 k€ au lieu des **504 k€** du plan. L'écart = 1363 € composés 30 ans (≈ 18 k€).

## 2026-05 — Filtre de date sur les apports C0 (`initialCapital`)
- **Décision :** seuls les ordres `C0` **antérieurs au 1er DCA** comptent comme capital initial théorique ; les C0 ultérieurs passent par `calcRealTraj` (datés).
- **Pourquoi :** un bonus de 5 000 € en 2035 placé au mois 0 d'une projection serait composé sur 30 ans (≈ 66 k€) au lieu de sa vraie valeur (≈ 33 k€) → projection théorique faussée. Le bug a été identifié et corrigé.

## 2026-05 — Refonte design « v2 »
- **Décision :** Dashboard avec **hero immersif** (frise 30 ans, objectif, rente, composition versé/intérêts, phases numérotées) ; les 6 sous-pages reçoivent un **`page-hero`** allégé. Palette dorée inchangée.
- **Pourquoi :** rendre l'écran d'accueil motivant et lisible ; harmoniser toutes les pages. Toute la logique/les calculs sont restés intacts (validé par tests).
- **Méthode :** mise à niveau du **CSS partagé** (titres `.st` en serif, cartes raffinées) qui propage le style à toutes les pages, puis composants dédiés. Aucune réécriture de la logique.

## 2026-05 — Validation des entrées (formulaire d'ordre)
- **Décision :** `saveOrder` rejette parts/prix **≤ 0** (et exige une date).
- **Pourquoi :** une saisie négative corrompait total/PRU/allocation et la courbe « Réel ».

## 2026-05 — Persistance des checklists & onboarding
- **Décision :** cases cochées stockées dans `S.checks` ; écran d'accueil unique via `S.onboarded`.
- **Pourquoi :** les cases se décochaient au reload ; guider le 1er lancement.

## 2026-05 — Apport exceptionnel mis en évidence (C0)
- **Décision :** libellé C0 = « Apport exceptionnel (hors DCA) », bouton **+ Apport exceptionnel** (`addException`), titre du formulaire piloté automatiquement par `onCycleChange`.
- **Pourquoi :** le C0 (bonus, vente, prime) était peu visible. Le titre restait bloqué sur « Apport exceptionnel » quand on rechangeait de cycle → corrigé pour être automatique dans les deux sens.

## 2026-05 — Compte espèces / résiduel automatique
- **Décision :** nouveau tableau `S.deposits` (virements) ; **Solde espèces = Σ virements − Σ achats**, formaté avec **`fmtC`** (centimes), affiché sur la page DCA.
- **Pourquoi :** le marché n'autorise pas les fractions de parts → un **résiduel** de cash se reporte chaque mois. Modèle exact au centime, sans dérive sur 30 ans, **indépendant** des autres calculs (zéro impact sur projections/PRU/allocation). Le résiduel **n'entre pas** dans la courbe « Réel » car il n'est pas investi.
- **Alternatives écartées :** calculateur manuel ; champ résiduel à ajuster. Le solde auto (virements − achats) a été retenu pour sa fidélité et son report automatique.

## 2026-05-31 — Correction du plafond PEA (audit croisé app ↔ plan)
- **Problème :** l'app annonçait « plafond ~2044 » (carte phases, jalon An18, sous-titre). Faux.
- **Vérité (plan + recalcul) :** le plafond de **versements** 150 k€ est **jamais atteint en Scénario A** (117 163 € versés) et atteint **Décembre 2055 en Scénario B** (153 163 €). Le « ~150 k vers 2044 » est la **valeur de portefeuille** (An18, Sc A·9 % ≈ 148 k€), pas le plafond.
- **Correction :** carte phases → phase 3 affiche « 350 €/mois · rythme de croisière » (cohérent Sc A, objectif 504 k€) ; jalon An18 relabellé « Patrimoine » (plus « Plafond PEA ») ; `renderCeiling()` réécrit avec `planCeilingYear()` qui parcourt le calendrier des phases du scénario actif → message correct (Sc A « non atteint », Sc B « ~2055 »). Verrouillé par les tests E17/E18.
- **Pourquoi c'était faux :** l'ancienne estimation extrapolait à plat le rythme mensuel courant (ex. 180 €/mois sur tout le reste), ignorant les hausses de phase → année aberrante.

## 2026-05-31 — Version autonome (garantie 30 ans, zéro dépendance Internet)
- **Décision :** intégrer **Chart.js 4.4.1** et les **polices** (woff2 latin + latin-ext en base64) directement dans `PEA_Investment.html`, en remplacement des `<link>`/`<script src>` CDN.
- **Pourquoi :** garantir un fonctionnement **identique sur le très long terme** — les CDN (cdnjs, Google Fonts) peuvent changer/disparaître en 10–30 ans. Désormais l'app n'effectue **aucune requête réseau** ; tant qu'on possède le fichier, elle marche (et hors-ligne).
- **Conséquences :** fichier ~1,2 Mo (vs ~136 Ko). Sauvegarde de la version CDN : `PEA_Investment_CDN_BACKUP_20260531.html`. Les 2 URLs `https://...` restantes sont des commentaires internes au code Chart.js (jamais chargés).
- **Tests adaptés :** l'extraction du `<script>` applicatif cible désormais le bloc contenant `function calcProj` (car Chart.js est aussi un `<script>` inline) ; le test d'IDs uniques ignore le contenu des `<script>`/`<style>`. Les **216 tests restent à 0 erreur** sur la version autonome.
- **Reconstruction :** `build_autonome.js` (à la racine de travail) régénère la version autonome depuis la version CDN.

## 2026-06-01 — Icône d'écran d'accueil (PWA)
- **Décision :** ajout de `<link rel="apple-touch-icon" sizes="180x180" href="data:image/png;base64,…">` + `<link rel="icon" …>` dans le `<head>` (après `theme-color`). Icône = PNG 180×180 intégré en data-URI (carré sombre, « PEA » doré, flèche de croissance).
- **Pourquoi :** sans icône, iOS affiche une capture floue de la page sur l'écran d'accueil.
- **Sans risque :** purement additif (aucune logique/calcul/affichage touché), **0 dépendance réseau** (data-URI), **216 tests restent à 0 erreur**.

## Principe permanent
**Le plan métier prime.** Ne jamais inventer une règle, un taux ou un comportement non documenté. En cas d'ambiguïté : signaler, ne pas supposer. Toute évolution doit conserver les **214 tests à 0 erreur**.
