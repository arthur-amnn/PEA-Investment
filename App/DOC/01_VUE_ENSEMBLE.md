# 01 — Vue d'ensemble

## Le projet

**PEA Investment** est un outil personnel de pilotage d'un investissement long terme en ETF via un **PEA Fortuneo**, sur un horizon de **30 ans (2026 → 2056)**. Il sert à :

- enregistrer chaque achat mensuel (DCA) et chaque apport exceptionnel ;
- suivre le capital, la plus-value, l'allocation réelle vs cible, le compte espèces (résiduel) ;
- projeter le patrimoine final selon plusieurs taux et scénarios ;
- préparer les bilans semestriels de rééquilibrage ;
- rester discipliné (checklists, mode crise, objectif visible).

## Profil utilisateur (contexte qui justifie les choix)

- ~24 ans en 2026, étudiant en **alternance** (revenus limités mais réguliers au départ).
- Horizon **30 ans**, objectif **liberté financière à 54 ans** (2056).
- Tolérance au risque modérée à élevée.
- Courtier **Fortuneo**, enveloppe **PEA** (France).
- Contraintes Fortuneo : **1 ordre gratuit/mois** si < 500 €, puis 1 €/ordre ; **pas d'achat fractionné** d'ETF (d'où le **résiduel** de cash chaque mois) ; ETF éligibles PEA uniquement.

## Portefeuille cible : 60 / 30 / 10

| ETF | Code | ISIN | Poids | TER | Rôle |
|---|---|---|---|---|---|
| **DCAM** — Amundi PEA Monde (MSCI World) | DCAM | FR001400U5Q4 | 60 % | 0,20 % | Cœur, vendre en 2ᵉ |
| **PAEEM** — Amundi PEA Emergents (MSCI EM) | PAEEM | FR0013412020 | 30 % | 0,30 % | Croissance, vendre en 1ᵉʳ |
| **CEM** — Amundi MSCI Europe Small Cap ESG | CEM | LU1681041544 | 10 % | 0,23 % | Diversification, vendre en dernier |

TER pondéré ≈ **0,233 %/an**. Les 3 ETF sont **capitalisants** (dividendes réinvestis).

## Stack technique

- **1 seul fichier** : `PEA_Investment.html` (~1,2 Mo). Tout le CSS et le JS sont **inline**.
- **Version AUTONOME (100 % hors-ligne, garantie longue durée)** : **Chart.js 4.4.1 est intégré en dur** dans le fichier (plus de CDN), et les **polices** (EB Garamond, Figtree, DM Mono — sous-ensembles latin + latin-ext, accents & €) sont **embarquées en base64** (`@font-face` data-URI). → **aucune dépendance Internet** : l'app fonctionne identique même si cdnjs/Google Fonts disparaissent. Une copie de l'ancienne version (qui chargeait Chart.js/polices via CDN) est conservée en `PEA_Investment_CDN_BACKUP_20260531.html`.
- Reconstruire la version autonome (si besoin de remettre à jour Chart.js) : voir `build_autonome.js` (télécharge Chart.js + woff2 et les inline). Process documenté dans `09_HISTORIQUE_DECISIONS.md`.
- **Stockage** : `localStorage` du navigateur, clé **`pea_v4`** (JSON). Migration automatique depuis `pea_v3` si présent.
- **PWA** : installable sur iPhone (Safari → Partager → Sur l'écran d'accueil). Fonctionne **hors-ligne** une fois chargé (sauf 1ᵉʳ chargement des CDN).
- **Aucun build, aucun serveur, aucune installation.** Double-clic du fichier = ça marche. Un serveur statique local n'est utile que pour tester la PWA/HTTPS.

## Ce que l'application NE fait PAS (volontairement)

- Pas de connexion à Fortuneo / pas de cours en temps réel (les cours sont **saisis à la main**).
- Pas de cloud / pas de compte / pas de synchronisation (données 100 % locales).
- Pas de conseil financier automatisé hors du plan défini.
- Pas de gestion fractionnée (le marché réel ne le permet pas → mécanique du résiduel).

## Documents historiques associés (hors app)

Dans `D:\OneDrive\Bureau\Plan PEA\` : `Plan PEA 30 ans — A.L.html` (plan détaillé, **source de vérité métier d'origine**), `INDEX PLAN PEA.html`, et `App\RESUME_PEA_Investment.md` (résumé de reprise de conversation). En cas de doute sur une règle, **le plan prime**.
