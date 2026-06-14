# 07 — Tests et validation

> **Règle absolue après toute modification :** `node --check` doit passer **et** les **214 tests** doivent rester à **0 erreur**.

## Pré-requis : Node.js

Les tests s'exécutent avec **Node.js** (n'importe quelle version récente, validé sur v24). Node peut ne pas être dans le PATH système ; sur la machine d'origine il était à :

```
C:\Program Files\nodejs\node.exe
```

Astuce Windows (espace dans le chemin) : utiliser le chemin court ou les guillemets. Exemples d'appel :
- PowerShell : `& "C:\Program Files\nodejs\node.exe" --version`
- Bash (Git) : `"/c/Program Files/nodejs/node.exe" --version`

## A. Vérifier la syntaxe JS — `node --check`

Le JS est **inline** dans le `.html` ; on extrait d'abord le `<script>` puis on vérifie :

```js
// extrait_check.js — usage: node extrait_check.js PEA_Investment.html
const fs=require('fs'),os=require('os'),cp=require('child_process');
const h=fs.readFileSync(process.argv[2],'utf8');
const code=h.match(/<script>(?![^>]*src=)([\s\S]*?)<\/script>/)[1];
fs.writeFileSync(os.tmpdir()+'/c.js',code);
try{cp.execSync('"'+process.execPath+'" --check "'+os.tmpdir()+'/c.js"');console.log('node --check: OK');}
catch(e){console.log('ERREUR',e.message);}
```

## B. Les 3 suites de tests fournies (dossier `DOC/tests/`)

Chaque suite charge l'app dans un **DOM simulé** (stub), exécute les fonctions, et compare aux valeurs attendues. Aucune dépendance, aucune installation.

| Suite | Tests | Couvre |
|---|---|---|
| `fullapp_tests.js` | **91** | Chargement, **tous les handlers**, **IDs uniques (tout le doc)**, exécution sans erreur des **27 fonctions de rendu**, **tous les calculs vs plan**, parcours utilisateur (scénarios, ordres, virements, bilan, export, checklists, nav), **persistance & migration**, robustesse |
| `dca_tests.js` | **98** | Page DCA en profondeur : compte espèces (résiduel, report, volume 360 mois, précision centime), C0, apport exceptionnel, double carte prochain ordre, countdown, saveOrder, non-régression |
| `realcurve_tests.js` | **25** | Courbe « Réel » : croissance DCA + apports exceptionnels, exclusion ordres futurs, taux, cash résiduel exclu |

### Lancer les tests

```
node DOC/tests/fullapp_tests.js   PEA_Investment.html
node DOC/tests/dca_tests.js       PEA_Investment.html
node DOC/tests/realcurve_tests.js PEA_Investment.html
```

Le chemin du `.html` est passé en argument. Chaque suite affiche `X OK / Y KO` et se termine en erreur (exit code 1) s'il y a un échec.

### Résultat de référence (2026-05-31)
```
APPLICATION COMPLETE : 91 OK / 0 KO
PAGE DCA            : 98 OK / 0 KO
COURBE REELLE       : 25 OK / 0 KO
TOTAL              : 214 OK / 0 KO
```

## C. Notes sur les tests (pièges connus)

- **Format `fr-FR`** : `toLocaleString` sépare les milliers par une **espace insécable étroite (U+202F)**, pas une espace normale. Une comparaison de chaîne stricte « 64 800 » peut échouer à tort → normaliser les espaces dans l'assertion (ce n'est pas un bug de l'app).
- **Arrondis** : la courbe « Réel » arrondit la **somme** une fois ; comparer un delta peut donner ±1 € (normal).
- Le stub DOM doit fournir `scrollTo`, `getContext`, `scrollIntoView` (déjà inclus) pour exécuter `gotoPage`, les charts, etc.

## D. Validation visuelle (navigateur)

Ouvrir `PEA_Investment.html` (double-clic) ou via un petit serveur statique local (utile pour la PWA). Vérifier chaque onglet : rendu, formulaires, graphiques, console (F12) sans erreur rouge.
