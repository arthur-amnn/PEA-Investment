# PEA Investment — Dossier de maintenance

> **But de ce dossier :** permettre, même dans 10 ans, de comprendre, vérifier, corriger ou faire évoluer l'application **sans aucune connaissance préalable**, en fournissant uniquement :
> 1. le fichier **`PEA_Investment.html`** (l'application, un seul fichier autonome) ;
> 2. ce dossier **`DOC/`**.

---

## Ce qu'est l'application en une phrase

Une application web **mono-fichier** (HTML + CSS + JS inline, Chart.js via CDN) de pilotage d'un **PEA (Plan d'Épargne en Actions) sur 30 ans** (2026 → 2056), installable en PWA sur iPhone, données stockées **en local** dans le navigateur (`localStorage`, clé `pea_v4`). Aucune donnée ne quitte l'appareil. Aucun serveur, aucune dépendance à installer.

## Comment lire ce dossier

| Fichier | Contenu |
|---|---|
| **PEA_Investment.html** | **L'APPLICATION elle-même** (copie identique octet-pour-octet à celle utilisée, validée 214/214 tests). À ouvrir / télécharger / réinstaller. |
| **00_LISEZMOI.md** | Ce fichier : vue d'ensemble du kit + procédure de dépannage |
| **01_VUE_ENSEMBLE.md** | Le projet, le profil utilisateur, les objectifs, la stack technique |
| **02_REGLES_METIER.md** | Règles métier : cycle DCA, phases d'apport, scénarios, apports C0, plafond PEA, règles d'or |
| **03_CALCULS_ET_FORMULES.md** | **Toutes** les formules financières avec valeurs attendues (source de vérité chiffrée) |
| **04_MODELE_DONNEES.md** | Structure `localStorage` / objet `S`, ordres, virements, bilans, migration |
| **05_ARCHITECTURE_ET_CODE.md** | Organisation du code, design system CSS, carte des fonctions JS, IDs critiques |
| **06_FONCTIONNALITES.md** | Les 7 pages et chaque fonctionnalité en détail |
| **07_TESTS_ET_VALIDATION.md** | Comment valider (Node), les 3 suites de tests fournies (214 tests) |
| **08_DEPANNAGE.md** | Pannes courantes + solutions + conventions de code à respecter |
| **09_HISTORIQUE_DECISIONS.md** | Journal des décisions importantes (le « pourquoi ») |
| **tests/** | Les 3 scripts de test automatiques (rejouables à tout moment) |

---

## 🔧 PROCÉDURE EN CAS DE PROBLÈME (à suivre dans l'ordre)

1. **Sauvegarder** une copie du fichier `PEA_Investment.html` avant toute modification.
2. **Reproduire** le problème et noter : quelle page, quelle action, quel message d'erreur (console du navigateur : F12 → Console).
3. **Lire** le fichier `DOC/` correspondant (calculs → 03, données → 04, code → 05, panne connue → 08).
4. **Localiser** la fonction concernée via `05_ARCHITECTURE_ET_CODE.md` (carte des fonctions).
5. **Corriger** en respectant les conventions (`08_DEPANNAGE.md` § Conventions).
6. **Valider** avec les 3 suites de tests (`07_TESTS_ET_VALIDATION.md`) → **les 214 tests doivent rester verts** + `node --check` OK.
7. Tester visuellement sur navigateur / iPhone.

### Prompt prêt à coller (si tu donnes le tout à une IA dans 10 ans)

```
Tu es développeur senior. Voici l'application PEA_Investment.html (fichier unique
HTML/CSS/JS) et son dossier DOC/. Avant toute modification :
1. Lis DOC/00_LISEZMOI.md puis le fichier DOC pertinent.
2. La hiérarchie des sources de vérité : le plan métier (DOC/02 et 03) PRIME sur tout.
3. Ne jamais inventer une règle financière non documentée : signale toute ambiguïté.
4. Modifications chirurgicales, compatibilité ascendante (clé localStorage 'pea_v4').
5. Après correction : exécute les 3 suites DOC/tests/*.js avec Node — les 214 tests
   doivent rester à 0 erreur — et 'node --check' sur le <script> doit passer.
6. Respecte les conventions de DOC/08_DEPANNAGE.md (apostrophes échappées, charts en
   .update() jamais destroy/recreate, pas d'IDs dupliqués, style dark + doré #C9913A).
Problème à corriger : <décris ici>.
```

---

## État validé à la livraison (2026-05-31)

- **214 tests automatiques : 0 erreur** (91 application + 98 page DCA + 25 courbe réelle).
- `node --check` : OK. Aucun handler `onclick` orphelin. Aucun ID dupliqué.
- Sauvegarde de référence : `PEA_Investment_BACKUP_20260531.html`.
- Version : design « v2 » (hero immersif + compte espèces + apports exceptionnels).
