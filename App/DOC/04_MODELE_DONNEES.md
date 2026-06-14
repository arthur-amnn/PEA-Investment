# 04 — Modèle de données

## Stockage

Tout l'état tient dans **`localStorage`**, clé **`pea_v4`**, valeur = JSON de l'objet `S`. Écrit par `save()` à chaque modification ; lu au chargement.

```js
function save() { try { localStorage.setItem('pea_v4', JSON.stringify(S)); } catch(e) {} }
```

Lecture au démarrage (fusion avec les valeurs par défaut, donc **les nouvelles clés ne cassent pas un ancien état**) :

```js
var S = {orders:[], scenario:'A', rate:9, dcaBase:180, bilans:[], checks:{}, onboarded:false, deposits:[]};
(function(){ try { var d = localStorage.getItem('pea_v4');
  if (d) { var p = JSON.parse(d); S = Object.assign({}, S, p); } } catch(e){} })();
```

## Structure de l'objet `S`

| Clé | Type | Rôle |
|---|---|---|
| `orders` | `Array` | Tous les **achats** d'ETF (DCA C1..C10 **et** apports C0) |
| `deposits` | `Array` | Tous les **virements** de cash vers le PEA (pour le compte espèces) |
| `bilans` | `Array` | Bilans semestriels archivés |
| `scenario` | `'A'` \| `'B'` | Scénario d'apport actif |
| `rate` | `7` \| `9` \| `11` | Taux de rendement sélectionné |
| `dcaBase` | `Number` | Montant mensuel Phase 1 (défaut 180) |
| `checks` | `Object` | Cases de checklist cochées (persistées) |
| `onboarded` | `Boolean` | L'écran d'accueil a-t-il été vu |

### `orders[]` — un achat

```json
{ "etf":"DCAM", "cycle":"C1", "qty":34, "price":5.30,
  "date":"2026-07-01", "total":180.20, "note":"", "id":1690000000000 }
```
- `etf` ∈ {DCAM, PAEEM, CEM} · `cycle` ∈ {C0, C1..C10}
- `total = round(qty*price*100)/100` · `date` au format `YYYY-MM-DD`
- `id` = `Date.now()` à la création (identifiant unique)

### `deposits[]` — un virement (compte espèces)

```json
{ "date":"2026-07-01", "amount":180, "note":"virement mensuel", "id":1690000000001 }
```
- `amount = round(amt*100)/100` · trié par date croissante.

### `bilans[]` — un bilan semestriel

Créé par `computeBilan()`. Contient période, valeurs marché saisies, total investi, écarts d'allocation, action recommandée. Affiché par `renderBilanArchive()` / `buildAnnual()`.

### `checks{}` — checklists

Clé = `"<groupe>-<index>"` (groupes : `monthly`, `semi`, `crisis`, `rules`), valeur = `1` si cochée. Géré par `toggleCheck()` / `setCheckState()` / `buildChecklists()`.

## Migration

Au `init()`, si une ancienne clé **`pea_v3`** existe et que `pea_v4` est absent, les ordres sont repris :

```js
var oldData = localStorage.getItem('pea_v3');
if (oldData && !localStorage.getItem('pea_v4')) { /* S.orders = old.orders; save(); */ }
```

> **Règle de compatibilité ascendante :** ne jamais changer la clé `pea_v4` ni renommer/retirer une clé existante de `S` sans migration. Pour ajouter une fonctionnalité, **ajouter** une clé (comme l'a été `deposits`) avec une valeur par défaut dans `S`.

## Invariants importants

- `S.orders` = **achats uniquement** (débits). Tous les calculs financiers (projections, PRU, allocation, capital) en dépendent.
- `S.deposits` = **crédits cash uniquement**. N'influence **que** le compte espèces (`soldeEspeces`). N'entre **pas** dans la courbe « Réel » ni les projections.
- Les `id` doivent rester **uniques** au sein de leur tableau.
- Les montants sont en **euros**, arrondis au **centime**.
