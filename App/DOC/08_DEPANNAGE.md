# 08 — Dépannage & conventions

## Conventions de code à respecter (sinon ça casse)

1. **Apostrophes françaises dans les strings JS** : ne JAMAIS écrire `'l'allocation'` (l'apostrophe ferme la chaîne → tout casse). Utiliser une entité HTML (`l’allocation`), échapper (`l\'allocation`), ou des guillemets doubles. Dans le **HTML** affiché, préférer les entités (`&#xE9;` pour é, `&#x20AC;` pour €, etc.).
2. **Graphiques (Chart.js)** : mettre à jour avec `chart.update()` (ou `.update('none')`), **jamais** détruire/recréer le chart à chaque rendu (ancien bug : canvas 0×0, scénarios figés). Seule exception : `allocChart.destroy()` quand le `<canvas>` est réellement retiré du DOM (état vide).
3. **IDs uniques** : un `id` ne doit apparaître qu'**une fois** dans le document (`getElementById` ne renvoie que le premier). Le test `C01` de `fullapp_tests.js` le vérifie.
4. **Handlers** : tout `onclick="maFonction()"` doit correspondre à une `function maFonction()` globale définie. Test `B01`.
5. **Compatibilité données** : ne pas changer la clé `pea_v4` ni renommer une clé de `S` sans migration (voir `04`).
6. **Style** : dark + doré `#C9913A`, polices EB Garamond / Figtree / DM Mono. `--gold2` = fond doré translucide (le doré clair est `#e0b25e`).
7. **Modifications chirurgicales** : changer le minimum, justifier, re-tester.

## Pannes courantes → causes → solutions

| Symptôme | Cause probable | Solution |
|---|---|---|
| Page blanche / rien ne s'affiche | Erreur JS au chargement (souvent apostrophe non échappée) | F12 → Console ; `node --check` ; corriger la string |
| Un bouton ne fait rien | Fonction du `onclick` non définie ou renommée | Test `B01` ; vérifier le nom de la fonction |
| Un chiffre est faux | Calcul modifié par erreur | Comparer à `03_CALCULS` ; lancer les 3 suites |
| Projection ≠ 504 000 € | `dcaBase` modifié, ou `initialCapital`/`calcProj` touché | Vérifier `S.dcaBase=180` ; tests E01–E12 |
| Courbe « Réel » ne monte pas | Ordres non datés / dates futures / `calcRealTraj` cassé | `realcurve_tests.js` ; vérifier `date` des ordres |
| Solde espèces aberrant | Confusion virements/achats ou arrondi | `soldeEspeces` = Σ deposits − Σ orders ; tests I03–I04 |
| Graphique figé en changeant de scénario | Chart recréé au lieu de `.update()` | Revenir à `chart.update()` |
| Données perdues | `localStorage` vidé (changement de navigateur / mode privé / nettoyage) | Restaurer via **Import JSON** (page Export) ou la sauvegarde |
| Élément affiché 2× / écrasé | ID dupliqué | Test `C01` ; renommer l'un des deux |
| L'app ne s'installe pas en PWA | Ouverte en `file://` au lieu de `http(s)://` | Servir via un serveur statique local, puis Safari → Partager |

## Sauvegarde & restauration des données utilisateur

- **Sauvegarder** : page **Export → Télécharger JSON** (`downloadJSON`). Conserver ce fichier.
- **Restaurer** : page **Export → Importer** (`handleImport`) avec le JSON sauvegardé.
- Les données vivent dans le navigateur de l'appareil ; un nettoyage de navigateur les efface → faire des exports réguliers.

## Étendre l'application (bonnes pratiques)

- Nouvelle donnée persistée → **ajouter** une clé à `S` (avec défaut) + l'utiliser dans `save`/render. Ne pas casser l'existant.
- Nouvelle page → `<section class="page" id="page-x">` + `.page-hero` + entrées de nav (`gotoPage`/`gotoPageM`) + cartes `.cc`.
- Nouveau calcul financier → l'ajouter dans `03_CALCULS` avec sa valeur attendue **et** un test dans `tests/`.
- Toujours finir par : `node --check` + les 3 suites à **0 erreur**.

## Restauration complète (« tout est cassé »)

Repartir de la sauvegarde de référence `PEA_Investment_BACKUP_20260531.html` (état validé 214/214) et ré-appliquer la correction proprement.
