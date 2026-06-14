# 02 — Règles métier

> **Source de vérité.** Ces règles viennent du plan d'origine (`Plan PEA 30 ans — A.L.html`). En cas de contradiction entre le code, le résumé et le plan, **le plan prime**. Ne jamais inventer une règle non documentée ici.

## 1. Cycle DCA (Dollar Cost Averaging)

Investissement **régulier** : **1 ordre par mois**, sur **1 seul ETF** à la fois, en suivant un **cycle de 10 mois** qui se répète indéfiniment. Cela respecte « 1 ordre gratuit/mois » chez Fortuneo et reconstitue la cible 60/30/10.

```
C1=DCAM  C2=PAEEM  C3=DCAM  C4=PAEEM  C5=DCAM
C6=DCAM  C7=PAEEM  C8=CEM   C9=DCAM   C10=DCAM
```

Sur 10 mois : **6×DCAM (60 %) + 3×PAEEM (30 %) + 1×CEM (10 %)**. Dans le code : constante `CYCLE_DEF` (10 entrées `{pos, etf, type}` ; `type` = `w` World / `e` Emerging / `s` Small).

- **Dates clés** : PEA ouvert / déploiement initial **Juin 2026** (`PEA_OPEN_DATE`) ; **premier DCA C1 = Juillet 2026** (`PEA_DCA_START = new Date(2026, 6, 1)`, mois index 6).

## 2. Apports « C0 » (hors cycle DCA)

Le **cycle « C0 »** désigne tout apport qui **n'avance pas** le cycle DCA :
- le **capital initial** déployé en juin 2026 (~1 363 €) ;
- les **apports exceptionnels** : bonus, prime, remboursement, parrainage, produit d'une vente, etc.

Caractéristiques :
- tracé comme un ordre normal (ETF, parts, prix, total, date, PRU) mais avec `cycle = 'C0'` ;
- **ne décale pas** la position dans le cycle C1→C10 (`dcaOrders()` exclut les C0) ;
- dans les projections : voir `03_CALCULS` — les C0 **antérieurs au 1ᵉʳ DCA** servent de capital initial théorique ; les C0 **ultérieurs** sont pris en compte **datés** par la courbe « Réel ».

## 3. Phases d'apport (le montant mensuel augmente avec les revenus)

| Phase | Période | Montant /mois | Contexte |
|---|---|---|---|
| **Phase 1** | 2026 → 2031 (60 mois) | **180 €** | Alternance |
| **Phase 2** | 2031 → 2036 (60 mois) | **350 €** | CDI |
| **Phase 3** | 2036 → 2056 (240 mois) | **350 € (Sc. A) / 500 € (Sc. B)** | Capitalisation |

Dans le code : `getPhases(sc)` retourne `[{m, dca}, …]` (m = nb de mois, dca = montant). Le montant de la **Phase 1** est paramétrable par l'utilisateur (`S.dcaBase`, défaut 180) ; le reste suit le scénario.

## 4. Scénarios A et B

- **Scénario A** (prudent) : 180 → 350 → **350** €/mois. Objectif de référence affiché = **504 000 €** à 9 %/an.
- **Scénario B** (ambitieux) : 180 → 350 → **500** €/mois. ≈ 600 000 € à 9 %/an.

Le **scénario A à 9 %/an** est l'**objectif de référence** de l'app (`planObjective()`), affiché partout (hero, composition, alerte projections).

## 5. Taux de rendement testés

3 hypothèses de rendement annuel net : **7 % (prudent), 9 % (médian), 11 % (optimiste)**. L'utilisateur bascule entre eux (`selRate`). Les projections retombent sur les chiffres du plan (voir `03_CALCULS`).

## 6. Plafond PEA

Plafond de **versements** = **150 000 €** — ce sont les **versements cumulés** qui sont plafonnés, **pas** la valeur du portefeuille. Selon le calendrier des phases :
- **Scénario A** (117 163 € versés au total) → **jamais atteint** ;
- **Scénario B** (153 163 €) → atteint en **Décembre 2055** (dépassement final 3 163 €).

Au-delà, on continue sur un **CTO** (compte-titres ordinaire). Calculé par `planCeilingYear()` (parcourt le calendrier des phases du scénario actif), affiché par `renderCeiling()`.

⚠️ **Ne pas confondre** avec la *valeur de portefeuille* qui passe ~150 k€ vers **2044** (An18, Sc A·9 %) — c'est une coïncidence de montant, pas le plafond. (Erreur historique corrigée : l'app annonçait à tort « plafond ~2044 ».)

## 7. Le résiduel / compte espèces

Le marché ne permet pas d'acheter des **fractions** de parts. Avec un budget de 180 € et un prix d'ETF qui **change chaque mois**, on achète un **nombre entier** de parts → il reste un **résiduel** de cash. Ce résiduel **se reporte** au mois suivant et s'ajoute au budget.

Modèle retenu (voir `03_CALCULS` § Compte espèces) : **Solde espèces = Σ virements − Σ achats**. C'est exact, se reporte automatiquement, et n'est **pas** exposé au marché (donc absent de la courbe « Réel »).

## 8. Fiscalité (pour les rentes)

PEA : exonération d'impôt sur le revenu après 5 ans ; restent les **prélèvements sociaux 17,2 %** sur les **gains uniquement**. Utilisé pour estimer la rente nette (règle des 4 %).

## 9. Règles d'or (discipline, page Checklists / Mode crise)

1. Ne **jamais interrompre** le DCA, même en période difficile.
2. Ne **jamais diversifier hors ETF** (pas de crypto, stock-picking, SCPI).
3. **Augmenter** le DCA à chaque hausse de salaire.
4. **Rééquilibrer** semestriellement (Juin + Décembre uniquement).
5. Garder le **Livret A** plein (3 mois de charges mini).
6. Ne retirer le PEA qu'**après 5 ans** (avant 2031 = pénalisant).
7. En crise : règle des 48 h, ne jamais vendre, doubler le DCA si possible.

### Protocole de rééquilibrage (bilan semestriel)
- Écart < 5 pts → ne rien faire (le DCA corrige).
- Écart 5–10 pts → surpondérer le prochain DCA sur l'ETF sous-pondéré.
- Écart > 10 pts → arbitrage interne PEA (vendre surplus, racheter déficit).
