# 03 — Calculs et formules (source de vérité chiffrée)

> Si un chiffre affiché par l'app diverge de ce fichier, **c'est l'app qui a un bug** (ou ce fichier doit être mis à jour suite à une décision documentée dans `09`). Toutes les valeurs ci-dessous sont **vérifiées par les suites de test** (`DOC/tests/`).

## 0. Brique de base — taux mensuel

Tous les calculs de croissance utilisent un **taux mensuel équivalent** au taux annuel :

```
mr = (1 + taux/100)^(1/12) − 1
```

Exemple 9 % : `mr = 1.09^(1/12) − 1 ≈ 0,0072073`.

## 1. Projection théorique — `calcProj(sc, rate)`

Annuité mensuelle composée, **apports en fin de mois**, **partant du capital initial** :

```
cap = initialCapital()                      // capital de départ (≈ 1363 €)
pour chaque phase (getPhases(sc)) :
  pour chaque mois m de la phase :
    cap = cap * (1 + mr) + phase.dca         // on capitalise puis on ajoute l'apport
    si (mois % 12 == 0) -> enregistrer cap   // 1 point par an, 30 points
retour : tableau de 30 valeurs (An1..An30)
```

### Valeurs attendues (An30 = 2056), dcaBase = 180

| Scénario | 7 % | 9 % | 11 % |
|---|---|---|---|
| **A** (180→350→350) | **353 994** | **504 271** | **727 301** |
| **B** (180→350→500) | **430 125** | **600 098** | **848 583** |

(Affiché arrondi au millier : A·9% = « 504 000 € », etc.)

## 2. Capital initial — `initialCapital()`

```
c0 = somme des ordres cycle 'C0' dont la date < PEA_DCA_START (1er juillet 2026)
retour : c0 > 0 ? c0 : 1363   // défaut plan = 1363 €
```

**Pourquoi le filtre de date :** seuls les C0 du **déploiement initial** comptent comme capital de départ théorique. Un C0 **ultérieur** (bonus 2035…) ne doit PAS être placé au mois 0 (sinon il serait composé sur 30 ans → fortement surévalué). Il est géré, daté, par `calcRealTraj()`. → décision `09 § C0 date-filter`.

## 3. Capital versé — `calcInvested(sc)` / `planInvested()`

```
inv = initialCapital() + Σ (phase.m * phase.dca)
```

Valeurs attendues (dcaBase 180) : **A = 117 163 €**, **B = 153 163 €**.
Décomposition A : `1363 + 60×180 + 60×350 + 240×350 = 1363 + 10800 + 21000 + 84000 = 117163`.

## 4. Objectif de référence — `planObjective()`

```
planObjective() = dernier point de calcProj('A', 9) = 504271
```

## 5. Rente nette estimée (règle des 4 %) — `planRente4()`

```
obj      = planObjective()                       // 504271
gains    = obj − planInvested()                  // 504271 − 117163 = 387108
afterTax = obj − gains * 0.172                    // PS 17,2 % sur les gains
rente4   = round(afterTax * 0.04 / 12)
```

Valeur attendue : **1 459 €/mois**. (Détail : afterTax = 504271 − 66583 = 437688 ; ×0,04/12 = 1459.)
Règle des 3 % (conservatrice, capital intact) : ≈ **1 094 €/mois** (`updateRentes`).

## 6. Composition du capital final — `renderComposition()`

```
obj      = planObjective()                       // 504271 -> affiché 504 000
invested = planInvested()                         // 117163
gains    = obj − invested                         // 387108 -> affiché ~387 000
pctVerse = round(invested / obj * 100)            // 23 %
pctInt   = 100 − pctVerse                          // 77 %
```

Affiché : barre **23 % versé / 77 % intérêts** · « 117 163 € versés » · « ≈ 387 000 € d'intérêts ».

## 7. Courbe « Réel » (violette) — `calcRealTraj()`

Valorisation **réelle estimée** de tes ordres : **chaque ordre est composé depuis sa propre date** jusqu'à la fin de chaque année, au **taux sélectionné** (`S.rate`).

```
pour chaque année cible Y (2027..2056) :
  pv = 0
  pour chaque ordre o de S.orders :       // INCLUT DCA (C1..C10) ET apports C0
    si date(o) > 31/12/Y : ignorer (ordre futur)
    mois = nb de mois entre date(o) et 31/12/Y (>= 0)
    pv += o.total * (1 + mr)^mois
  point[Y] = round(pv)   (null si aucun ordre avant Y)
```

Propriétés (testées, voir `realcurve_tests.js`) :
- Monte avec le DCA **et** les apports exceptionnels.
- Un apport futur n'affecte que les années **≥ sa date**.
- Le **cash résiduel (virements non investis) n'y figure pas** (pas exposé au marché) — c'est **correct**.

## 8. Simulateur — `calcProjCustom(extra, rate)` / `updateSim()`

Identique à `calcProj` mais ajoute `extra` €/mois à chaque apport. Sert à montrer l'impact d'investir « +X €/mois ».

## 9. Compte espèces / résiduel — `soldeEspeces()` / `renderCash()`

```
soldeEspeces = round( (Σ S.deposits[].amount − Σ S.orders[].total) * 100 ) / 100
```

- **Exact au centime** (arrondi explicite), donc **aucune dérive sur 360 mois**.
- Affiché avec `fmtC` (2 décimales : « 1,14 € »). Les autres montants utilisent `fmt` (arrondi à l'euro).
- Solde **négatif** possible si on a saisi plus d'achats que de virements → avertissement rouge.
- **Indépendant** de tous les autres calculs (projections/PRU/allocation n'utilisent que `S.orders`).

## 10. Allocation réelle — `renderRealAlloc()`

```
pour chaque ETF : valeur = Σ total des ordres de cet ETF ; % = valeur / total
écart = % réel − cible (60/30/10) ; badge vert <5pts, orange <10pts, rouge sinon
```

## 11. Santé du plan — `renderHealthScore()`

Score /10 basé sur des critères (ordres passés, régularité, allocation évaluée, objectif 6 mois, notes). Cosmétique/motivationnel, pas un calcul financier critique.

## 12. Plafond de versements — `planCeilingYear()` / `renderCeiling()`

Le plafond porte sur les **versements cumulés** (150 000 €), pas la valeur du portefeuille. `planCeilingYear()` parcourt le calendrier des phases du **scénario actif** depuis le déploiement et renvoie l'année où le cumul atteint 150 k€, ou `null` si jamais :

```
cum = initialCapital()                 // ≈ 1363 €, juin 2026
pour chaque phase (getPhases(S.scenario)), pour chaque mois :
  cum += phase.dca
  si cum >= 150000 -> retourner l'année courante
retourner null   // jamais atteint
```

Valeurs attendues (testées E17/E18) : **Sc A → `null` (jamais, total 117 163 €)** · **Sc B → `2055`** (cumul 150 163 € en Déc 2055). `renderCeiling()` affiche la barre `versé / 150 000` (versé réel = Σ ordres) + ce message.

---

### Constante du taux d'arrondi
Tous les **totaux d'ordres** : `total = round(qty * price * 100) / 100` (au centime). Les **virements** : `amount = round(amt * 100) / 100`.
