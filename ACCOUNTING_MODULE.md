# 💵 Module Comptabilité (Accounting) - Documentation Technique

## Vue d'ensemble

Le module Comptabilité fournit un système complet de gestion financière pour l'application Schoman. Il permet le suivi des transactions (revenus et dépenses), la planification budgétaire, et l'analyse financière avec des rapports détaillés.

## Fonctionnalités Implémentées

### Gestion des Transactions
- ✅ **Enregistrement des transactions** - Revenus et dépenses avec numérotation automatique
- ✅ **Catégorisation** - Classification par catégorie personnalisable
- ✅ **Méthodes de paiement** - Espèces, chèque, virement bancaire, mobile money, autre
- ✅ **Recherche et filtrage** - Par type, catégorie, année fiscale, plage de dates
- ✅ **Statistiques** - Totaux, solde, répartition par catégorie, évolution mensuelle
- ✅ **Référencement** - Liens avec factures et dépenses existantes
- ✅ **Contrôle d'accès** - Basé sur les rôles (admin et enseignant)

### Gestion des Budgets
- ✅ **Création de budgets** - Budgets annuels avec dates de début et fin
- ✅ **Catégorisation** - Items budgétaires pour revenus et dépenses
- ✅ **Suivi** - Montants alloués vs montants dépensés
- ✅ **Statuts** - Brouillon, actif, clôturé
- ✅ **Comparaison** - Budget prévu vs réalisé avec calcul des écarts
- ✅ **Rapports** - Vue détaillée des performances budgétaires

---

## Architecture Backend

### Modèles de Données

#### Transaction Model (`backend/src/models/Transaction.ts`)

```typescript
{
  transactionNumber: String (unique, auto-généré: TRX-YYYY-NNNNN)
  type: 'income' | 'expense'
  amount: Number (min: 0)
  category: String (required)
  description: String (required)
  transactionDate: Date (default: now)
  paymentMethod: 'cash' | 'check' | 'bank_transfer' | 'mobile_money' | 'other'
  reference: String
  relatedInvoice: ObjectId -> Invoice
  relatedExpense: ObjectId -> Expense
  fiscalYear: String (required)
  notes: String
  createdBy: ObjectId -> User (required)
  timestamps: true
}
```

**Indexes:**
- `{ type: 1, transactionDate: -1 }`
- `{ fiscalYear: 1, type: 1 }`
- `{ category: 1, type: 1 }`
- `{ transactionNumber: 1 }`

**Numérotation automatique:**
- Format: `TRX-2024-00001`, `TRX-2024-00002`, etc.
- Généré automatiquement avant la sauvegarde (pre-save hook)

#### Budget Model (`backend/src/models/Budget.ts`)

```typescript
{
  name: String (required)
  fiscalYear: String (required)
  startDate: Date (required)
  endDate: Date (required)
  totalBudget: Number (required, min: 0)
  incomeItems: [BudgetItem]
  expenseItems: [BudgetItem]
  status: 'draft' | 'active' | 'closed' (default: 'draft')
  notes: String
  createdBy: ObjectId -> User (required)
  timestamps: true
}

BudgetItem {
  category: String (required)
  allocatedAmount: Number (required, min: 0)
  spentAmount: Number (default: 0, min: 0)
  description: String
}
```

**Indexes:**
- `{ fiscalYear: 1, status: 1 }`
- `{ startDate: 1, endDate: 1 }`

### Endpoints API

#### Transactions

##### 1. Créer une transaction
```
POST /api/transactions
Authorization: Bearer <token>
Role: admin, teacher
```

**Body:**
```json
{
  "type": "income",
  "amount": 150000,
  "category": "Frais de scolarité",
  "description": "Paiement premier trimestre",
  "transactionDate": "2024-09-15",
  "paymentMethod": "bank_transfer",
  "reference": "PAY-2024-001",
  "fiscalYear": "2024",
  "notes": "Paiement complet"
}
```

**Response:**
```json
{
  "message": "Transaction créée avec succès",
  "transaction": {
    "_id": "...",
    "transactionNumber": "TRX-2024-00001",
    "type": "income",
    "amount": 150000,
    ...
  }
}
```

##### 2. Lister les transactions
```
GET /api/transactions?page=1&limit=20&type=income&fiscalYear=2024
Authorization: Bearer <token>
Role: admin, teacher
```

**Paramètres:**
- `page`: Numéro de page (default: 1)
- `limit`: Résultats par page (default: 20, max: 100)
- `type`: 'income' | 'expense'
- `category`: Filtrer par catégorie
- `fiscalYear`: Filtrer par année fiscale
- `startDate`: Date de début (ISO format)
- `endDate`: Date de fin (ISO format)
- `search`: Recherche dans description/référence/numéro

**Response:**
```json
{
  "transactions": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

##### 3. Obtenir une transaction
```
GET /api/transactions/:id
Authorization: Bearer <token>
Role: admin, teacher
```

##### 4. Modifier une transaction
```
PUT /api/transactions/:id
Authorization: Bearer <token>
Role: admin, teacher
```

##### 5. Supprimer une transaction
```
DELETE /api/transactions/:id
Authorization: Bearer <token>
Role: admin only
```

##### 6. Obtenir les statistiques
```
GET /api/transactions/stats?fiscalYear=2024
Authorization: Bearer <token>
Role: admin, teacher
```

**Response:**
```json
{
  "fiscalYear": "2024",
  "totalIncome": 230000,
  "totalExpenses": 120000,
  "balance": 110000,
  "transactionCount": 6,
  "incomeByCategory": {
    "Frais de scolarité": 150000,
    "Frais de cantine": 50000,
    ...
  },
  "expensesByCategory": {
    "Salaires": 80000,
    "Fournitures": 25000,
    ...
  },
  "monthlyData": {
    "2024-09": { "income": 180000, "expenses": 105000 },
    "2024-10": { "income": 50000, "expenses": 15000 }
  }
}
```

#### Budgets

##### 1. Créer un budget
```
POST /api/budgets
Authorization: Bearer <token>
Role: admin, teacher
```

**Body:**
```json
{
  "name": "Budget Annuel 2024-2025",
  "fiscalYear": "2024",
  "startDate": "2024-09-01",
  "endDate": "2025-08-31",
  "totalBudget": 2500000,
  "incomeItems": [
    {
      "category": "Frais de scolarité",
      "allocatedAmount": 1800000,
      "description": "Inscription et frais annuels"
    }
  ],
  "expenseItems": [
    {
      "category": "Salaires",
      "allocatedAmount": 1200000,
      "description": "Personnel enseignant et administratif"
    }
  ],
  "status": "active",
  "notes": "Budget prévisionnel"
}
```

##### 2. Lister les budgets
```
GET /api/budgets?page=1&limit=10&fiscalYear=2024&status=active
Authorization: Bearer <token>
Role: admin, teacher
```

##### 3. Obtenir un budget
```
GET /api/budgets/:id
Authorization: Bearer <token>
Role: admin, teacher
```

##### 4. Modifier un budget
```
PUT /api/budgets/:id
Authorization: Bearer <token>
Role: admin, teacher
```

##### 5. Supprimer un budget
```
DELETE /api/budgets/:id
Authorization: Bearer <token>
Role: admin only
```

##### 6. Comparaison budget vs réalisé
```
GET /api/budgets/:id/comparison
Authorization: Bearer <token>
Role: admin, teacher
```

**Response:**
```json
{
  "budget": {...},
  "incomeItems": [
    {
      "category": "Frais de scolarité",
      "allocatedAmount": 1800000,
      "spentAmount": 0,
      "actualAmount": 150000,
      "variance": -1650000
    }
  ],
  "expenseItems": [...],
  "summary": {
    "totalAllocatedIncome": 2500000,
    "totalActualIncome": 230000,
    "incomeVariance": -2270000,
    "totalAllocatedExpenses": 2000000,
    "totalActualExpenses": 120000,
    "expenseVariance": 1880000,
    "projectedBalance": 500000,
    "actualBalance": 110000
  }
}
```

### Contrôleurs

#### Transaction Controller (`backend/src/controllers/transactionController.ts`)

Fonctions principales:
- `createTransaction` - Créer une transaction avec génération automatique du numéro
- `getTransactions` - Liste paginée avec filtres multiples
- `getTransaction` - Détails d'une transaction
- `updateTransaction` - Modifier une transaction existante
- `deleteTransaction` - Supprimer une transaction (admin seulement)
- `getTransactionStats` - Statistiques financières agrégées

#### Budget Controller (`backend/src/controllers/budgetController.ts`)

Fonctions principales:
- `createBudget` - Créer un budget avec items de revenus/dépenses
- `getBudgets` - Liste paginée avec filtres
- `getBudget` - Détails d'un budget
- `updateBudget` - Modifier un budget existant
- `deleteBudget` - Supprimer un budget (admin seulement)
- `getBudgetComparison` - Comparer budget prévu vs transactions réelles

### Intégration Dashboard

Le contrôleur dashboard a été mis à jour pour inclure les statistiques comptables:

```typescript
// Dans dashboardController.ts
const accountingIncome = // Total des revenus de l'année en cours
const accountingExpenses = // Total des dépenses de l'année en cours
const accountingBalance = accountingIncome - accountingExpenses
const activeBudgets = // Nombre de budgets actifs
```

---

## Architecture Frontend

### Vues (Views)

#### AccountingView.vue

Vue complète de gestion des transactions avec:
- **Statistiques en temps réel** - 4 cartes affichant revenus, dépenses, solde, total transactions
- **Filtres avancés** - Par type, année fiscale, recherche textuelle
- **Liste des transactions** - Tableau paginé avec toutes les informations
- **Actions CRUD** - Créer, voir, modifier, supprimer (selon droits)
- **Modal de création/édition** - Formulaire complet avec validation
- **Modal de visualisation** - Affichage détaillé d'une transaction
- **Formatage automatique** - Montants en FCFA, dates localisées
- **Indicateurs visuels** - Couleurs différentes pour revenus (+vert) et dépenses (-rouge)

**Features principales:**
- Debounced search (300ms)
- Pagination côté serveur
- Tri et filtrage optimisés
- Responsive design (mobile-friendly)
- Contrôle d'accès basé sur le rôle

#### BudgetView.vue

Vue simplifiée de gestion des budgets avec:
- **Liste des budgets** - Cartes affichant nom, période, statut, montant total
- **Badges de statut** - Visual indicators pour brouillon/actif/clôturé
- **Navigation** - Lien vers la vue des transactions
- **Formatage** - Dates et montants localisés

### Types TypeScript

**Fichier:** `frontend/src/types/index.ts`

```typescript
interface Transaction {
  _id: string;
  transactionNumber: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  transactionDate: string;
  paymentMethod?: string;
  reference?: string;
  relatedInvoice?: {...};
  relatedExpense?: {...};
  fiscalYear: string;
  notes?: string;
  createdBy: {...};
  createdAt: string;
  updatedAt: string;
}

interface TransactionFormData {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  transactionDate?: string;
  paymentMethod?: string;
  reference?: string;
  fiscalYear?: string;
  notes?: string;
}

interface TransactionStats {
  fiscalYear: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
  incomeByCategory: Record<string, number>;
  expensesByCategory: Record<string, number>;
  monthlyData: Record<string, { income: number; expenses: number }>;
}

interface Budget { ... }
interface BudgetFormData { ... }
interface BudgetComparison { ... }
```

### Service API

**Fichier:** `frontend/src/services/api.ts`

Méthodes ajoutées:
```typescript
// Transactions
async getTransactions(params?: {...})
async getTransaction(id: string)
async createTransaction(data: TransactionFormData)
async updateTransaction(id: string, data: TransactionFormData)
async deleteTransaction(id: string)
async getTransactionStats(fiscalYear?: string)

// Budgets
async getBudgets(params?: {...})
async getBudget(id: string)
async createBudget(data: BudgetFormData)
async updateBudget(id: string, data: BudgetFormData)
async deleteBudget(id: string)
async getBudgetComparison(id: string)
```

### Routing

**Fichier:** `frontend/src/router/index.ts`

Routes ajoutées:
```typescript
{
  path: '/accounting',
  name: 'accounting',
  component: AccountingView,
  meta: { requiresAuth: true }
},
{
  path: '/budgets',
  name: 'budgets',
  component: BudgetView,
  meta: { requiresAuth: true }
}
```

### Intégration Dashboard

Deux nouvelles cartes de navigation ajoutées au tableau de bord:

1. **Comptabilité (💵)** - Icône monétaire indigo, lien vers /accounting
2. **Budgets (📊)** - Icône calculatrice ambre, lien vers /budgets

---

## Données de Démonstration (Seed)

### Transactions créées:
- **3 revenus:**
  - Frais de scolarité: 150,000 FCFA (virement bancaire)
  - Frais de cantine: 50,000 FCFA (mobile money)
  - Activités extra-scolaires: 30,000 FCFA (espèces)

- **3 dépenses:**
  - Salaires enseignants: 80,000 FCFA (virement bancaire)
  - Fournitures scolaires: 25,000 FCFA (espèces)
  - Maintenance électrique: 15,000 FCFA (chèque)

### Budget créé:
- **Nom:** Budget Annuel 2024-2025
- **Période:** 01/09/2024 - 31/08/2025
- **Budget total:** 2,500,000 FCFA
- **Revenus prévus:** 2,500,000 FCFA (4 catégories)
- **Dépenses prévues:** 2,000,000 FCFA (6 catégories)
- **Statut:** Actif

---

## Sécurité et Permissions

### Matrice de contrôle d'accès

| Action | Admin | Teacher | Student | Parent |
|--------|-------|---------|---------|--------|
| **Transactions** |
| Voir les transactions | ✅ | ✅ | ❌ | ❌ |
| Créer une transaction | ✅ | ✅ | ❌ | ❌ |
| Modifier une transaction | ✅ | ✅ | ❌ | ❌ |
| Supprimer une transaction | ✅ | ❌ | ❌ | ❌ |
| Voir les statistiques | ✅ | ✅ | ❌ | ❌ |
| **Budgets** |
| Voir les budgets | ✅ | ✅ | ❌ | ❌ |
| Créer un budget | ✅ | ✅ | ❌ | ❌ |
| Modifier un budget | ✅ | ✅ | ❌ | ❌ |
| Supprimer un budget | ✅ | ❌ | ❌ | ❌ |
| Voir la comparaison | ✅ | ✅ | ❌ | ❌ |

### Validation des données

**Backend:**
- Montants: Doivent être >= 0
- Dates: Format ISO valide
- Types: Énumérations strictes (income/expense, etc.)
- Références: IDs ObjectId valides

**Frontend:**
- Champs requis marqués avec *
- Validation HTML5 (required, min, type)
- Feedback visuel en cas d'erreur

---

## Performance et Optimisation

### Base de données
- **Indexes multiples** pour optimiser les requêtes fréquentes
- **Agrégations efficaces** pour les statistiques
- **Pagination** pour limiter le volume de données

### Frontend
- **Debounced search** (300ms) pour réduire les appels API
- **Pagination côté serveur** pour performances
- **Lazy loading** des données au scroll
- **Cache local** des statistiques

---

## Tests et Vérification

### Tests Backend
```bash
cd backend
npm run build  # Vérifier la compilation TypeScript
npm run dev    # Démarrer le serveur
npm run seed   # Initialiser les données de test
```

### Tests Frontend
```bash
cd frontend
npm run build  # Vérifier la compilation
npm run dev    # Démarrer en développement
```

### Tests d'intégration
1. Se connecter avec admin@schoman.com / admin123
2. Naviguer vers Comptabilité
3. Vérifier les statistiques affichées
4. Créer une nouvelle transaction
5. Filtrer par type/année
6. Modifier une transaction
7. Supprimer une transaction (admin)
8. Naviguer vers Budgets
9. Vérifier le budget actif
10. Naviguer vers Transactions depuis Budgets

---

## Intégration avec les Modules Existants

### Factures (Invoices)
- Les transactions peuvent être liées aux factures via `relatedInvoice`
- Possibilité de créer une transaction automatiquement lors du paiement d'une facture

### Dépenses (Expenses)
- Les transactions peuvent être liées aux dépenses via `relatedExpense`
- Création automatique de transaction lors de l'approbation d'une dépense

### Dashboard
- Statistiques comptables affichées sur le tableau de bord principal
- Revenus, dépenses et solde de l'année en cours
- Nombre de budgets actifs

---

## Améliorations Futures

### Fonctionnalités potentielles
1. **Rapports PDF** - Génération de rapports financiers exportables
2. **Graphiques** - Visualisations avec Chart.js ou Recharts
3. **Prévisions** - Projections basées sur l'historique
4. **Catégories personnalisées** - Gestion dynamique des catégories
5. **Multi-devises** - Support de plusieurs monnaies
6. **Réconciliation bancaire** - Import et rapprochement bancaire
7. **Alertes** - Notifications pour dépassements budgétaires
8. **Workflow d'approbation** - Validation multi-niveaux des transactions
9. **Export Excel** - Export des données pour analyse externe
10. **API webhooks** - Intégration avec systèmes externes

---

## Métriques du Module

### Code Backend
- **Modèles:** 2 fichiers (~210 lignes)
- **Contrôleurs:** 2 fichiers (~260 lignes)
- **Routes:** 2 fichiers (~40 lignes)
- **Updates:** 3 fichiers (~50 lignes)

### Code Frontend
- **Vues:** 2 fichiers (~540 lignes)
- **Types:** 1 mise à jour (~120 lignes)
- **API Service:** 1 mise à jour (~110 lignes)
- **Router:** 1 mise à jour (~10 lignes)
- **Dashboard:** 1 mise à jour (~30 lignes)

### Total
- **Fichiers créés/modifiés:** 15 fichiers
- **Lignes de code:** ~1,370 lignes
- **Endpoints API:** 12 endpoints
- **Vues frontend:** 2 vues complètes

---

## Support et Maintenance

### Logs
Les erreurs sont loguées dans la console avec des messages explicites:
- Backend: `console.error()` dans les contrôleurs
- Frontend: `console.error()` dans les composants Vue

### Debugging
- Vérifier la connexion MongoDB
- Vérifier les tokens JWT
- Vérifier les permissions utilisateur
- Vérifier la structure des données

### FAQ

**Q: Comment changer l'année fiscale par défaut?**
R: Modifier la ligne `fiscalYear: fiscalYear || new Date().getFullYear().toString()` dans transactionController.ts

**Q: Comment ajouter de nouvelles méthodes de paiement?**
R: Ajouter l'option dans l'enum du modèle Transaction et dans le formulaire frontend

**Q: Comment exporter les transactions?**
R: Utiliser l'API GET /api/transactions avec pagination élevée, puis traiter côté client

**Q: Les transactions sont-elles supprimables?**
R: Oui, mais seulement par les administrateurs

---

## Conclusion

Le module Comptabilité est maintenant **complet et opérationnel**. Il fournit:
- ✅ Gestion complète des transactions
- ✅ Planification et suivi budgétaire
- ✅ Statistiques et rapports financiers
- ✅ Intégration avec modules existants
- ✅ Interface utilisateur intuitive
- ✅ Sécurité et contrôle d'accès
- ✅ Performance optimisée
- ✅ Documentation complète

Le système est prêt pour une utilisation en production! 🎉

---

**Version du module:** 1.0.0  
**Date de création:** Janvier 2025  
**Statut:** ✅ Complet et Production Ready
