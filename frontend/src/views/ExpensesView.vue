<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold text-gray-900">📉 Gestion des Dépenses</h1>
        <button
          @click="$router.go(-1)"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          ← Retour
        </button>
      </div>

      <!-- Statistics Card -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">📊 Statistiques</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-red-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600">Total Dépenses</p>
            <p class="text-2xl font-bold text-red-600">{{ formatAmount(statistics.totalExpenses) }}</p>
          </div>
          <div class="bg-blue-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600">Salaires</p>
            <p class="text-2xl font-bold text-blue-600">
              {{ formatAmount(getCategoryTotal('salaries')) }}
            </p>
          </div>
          <div class="bg-green-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600">Fournitures</p>
            <p class="text-2xl font-bold text-green-600">
              {{ formatAmount(getCategoryTotal('supplies')) }}
            </p>
          </div>
          <div class="bg-yellow-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600">Maintenance</p>
            <p class="text-2xl font-bold text-yellow-600">
              {{ formatAmount(getCategoryTotal('maintenance')) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            v-model="filters.category"
            class="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Toutes les catégories</option>
            <option value="salaries">Salaires</option>
            <option value="supplies">Fournitures</option>
            <option value="maintenance">Maintenance</option>
            <option value="utilities">Services publics</option>
            <option value="rent">Loyer</option>
            <option value="transport">Transport</option>
            <option value="equipment">Équipement</option>
            <option value="other">Autre</option>
          </select>
          <select
            v-model="filters.paymentMethod"
            class="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Toutes les méthodes</option>
            <option value="cash">Espèces</option>
            <option value="check">Chèque</option>
            <option value="bank_transfer">Virement bancaire</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="card">Carte</option>
            <option value="other">Autre</option>
          </select>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Rechercher..."
            class="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            @click="loadExpenses"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            🔍 Filtrer
          </button>
        </div>
      </div>

      <!-- Add Expense Button -->
      <div v-if="canManage" class="mb-6">
        <button
          @click="showAddForm = true"
          class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          ➕ Enregistrer une dépense
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <p class="text-gray-600">Chargement...</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        {{ error }}
      </div>

      <!-- Expenses Table -->
      <div v-if="!loading" class="bg-white rounded-lg shadow-md overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                N° Dépense
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catégorie
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bénéficiaire
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Méthode
              </th>
              <th v-if="canManage" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="expense in expenses" :key="expense._id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ expense.expenseNumber }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span :class="getCategoryBadgeClass(expense.category)" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ getCategoryLabel(expense.category) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                {{ expense.description }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ expense.payee }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                {{ formatAmount(expense.amount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(expense.expenseDate) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ getPaymentMethodLabel(expense.paymentMethod) }}
              </td>
              <td v-if="canManage" class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  @click="editExpense(expense)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  ✏️ Modifier
                </button>
                <button
                  v-if="canDelete"
                  @click="deleteExpenseConfirm(expense._id)"
                  class="text-red-600 hover:text-red-900"
                >
                  🗑️ Supprimer
                </button>
              </td>
            </tr>
            <tr v-if="expenses.length === 0">
              <td :colspan="canManage ? 8 : 7" class="px-6 py-4 text-center text-gray-500">
                Aucune dépense trouvée
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.pages > 1" class="mt-6 flex justify-center items-center space-x-2">
        <button
          @click="changePage(pagination.page - 1)"
          :disabled="pagination.page === 1"
          class="px-4 py-2 bg-white border rounded disabled:opacity-50"
        >
          ← Précédent
        </button>
        <span class="px-4 py-2">
          Page {{ pagination.page }} sur {{ pagination.pages }}
        </span>
        <button
          @click="changePage(pagination.page + 1)"
          :disabled="pagination.page === pagination.pages"
          class="px-4 py-2 bg-white border rounded disabled:opacity-50"
        >
          Suivant →
        </button>
      </div>
    </div>

    <!-- Add/Edit Expense Modal -->
    <div v-if="showAddForm || editingExpense" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">
            {{ editingExpense ? '✏️ Modifier la dépense' : '➕ Enregistrer une dépense' }}
          </h2>
          <form @submit.prevent="submitExpense">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
                <select v-model="form.category" required class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="">Sélectionner</option>
                  <option value="salaries">Salaires</option>
                  <option value="supplies">Fournitures</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="utilities">Services publics</option>
                  <option value="rent">Loyer</option>
                  <option value="transport">Transport</option>
                  <option value="equipment">Équipement</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Montant (FCFA) *</label>
                <input
                  v-model.number="form.amount"
                  type="number"
                  min="0"
                  required
                  class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  v-model="form.description"
                  required
                  rows="2"
                  class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Bénéficiaire *</label>
                <input
                  v-model="form.payee"
                  type="text"
                  required
                  class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date de dépense *</label>
                <input
                  v-model="form.expenseDate"
                  type="date"
                  required
                  class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Méthode de paiement *</label>
                <select v-model="form.paymentMethod" required class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="">Sélectionner</option>
                  <option value="cash">Espèces</option>
                  <option value="check">Chèque</option>
                  <option value="bank_transfer">Virement bancaire</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="card">Carte</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Année académique *</label>
                <input
                  v-model="form.academicYear"
                  type="text"
                  required
                  placeholder="2024-2025"
                  class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Référence</label>
                <input
                  v-model="form.reference"
                  type="text"
                  class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">N° Reçu</label>
                <input
                  v-model="form.receiptNumber"
                  type="text"
                  class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  v-model="form.notes"
                  rows="2"
                  class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                ></textarea>
              </div>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                @click="cancelForm"
                class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                {{ editingExpense ? 'Mettre à jour' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';

interface Expense {
  _id: string;
  expenseNumber: string;
  category: string;
  description: string;
  amount: number;
  expenseDate: string;
  payee: string;
  paymentMethod: string;
  reference?: string;
  receiptNumber?: string;
  notes?: string;
  academicYear: string;
  recordedBy: any;
  approvedBy?: any;
}

const authStore = useAuthStore();
const expenses = ref<Expense[]>([]);
const loading = ref(false);
const error = ref('');
const showAddForm = ref(false);
const editingExpense = ref<Expense | null>(null);

const filters = ref({
  category: '',
  paymentMethod: '',
  search: '',
});

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0,
});

const statistics = ref({
  totalExpenses: 0,
  expensesByCategory: [] as any[],
  expensesByPaymentMethod: [] as any[],
  monthlyExpenses: [] as any[],
});

const form = ref({
  category: '',
  description: '',
  amount: 0,
  expenseDate: new Date().toISOString().split('T')[0],
  payee: '',
  paymentMethod: '',
  reference: '',
  receiptNumber: '',
  notes: '',
  academicYear: '2024-2025',
});

const canManage = computed(() => {
  return authStore.userRole === 'admin' || authStore.userRole === 'teacher';
});

const canDelete = computed(() => {
  return authStore.userRole === 'admin';
});

const loadExpenses = async () => {
  loading.value = true;
  error.value = '';
  try {
    const params: any = {
      page: pagination.value.page,
      limit: pagination.value.limit,
    };

    if (filters.value.category) params.category = filters.value.category;
    if (filters.value.paymentMethod) params.paymentMethod = filters.value.paymentMethod;
    if (filters.value.search) params.search = filters.value.search;

    const response = await api.getExpenses(params);
    expenses.value = response.expenses;
    pagination.value = response.pagination;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors du chargement des dépenses';
  } finally {
    loading.value = false;
  }
};

const loadStatistics = async () => {
  try {
    const response = await api.getExpenseStatistics();
    statistics.value = response;
  } catch (err: any) {
    console.error('Erreur lors du chargement des statistiques:', err);
  }
};

const submitExpense = async () => {
  try {
    if (editingExpense.value) {
      await api.updateExpense(editingExpense.value._id, form.value);
    } else {
      await api.createExpense(form.value);
    }
    cancelForm();
    await loadExpenses();
    await loadStatistics();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de l\'enregistrement';
  }
};

const editExpense = (expense: Expense) => {
  editingExpense.value = expense;
  form.value = {
    category: expense.category,
    description: expense.description,
    amount: expense.amount,
    expenseDate: expense.expenseDate.split('T')[0],
    payee: expense.payee,
    paymentMethod: expense.paymentMethod,
    reference: expense.reference || '',
    receiptNumber: expense.receiptNumber || '',
    notes: expense.notes || '',
    academicYear: expense.academicYear,
  };
};

const deleteExpenseConfirm = async (id: string) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
    try {
      await api.deleteExpense(id);
      await loadExpenses();
      await loadStatistics();
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la suppression';
    }
  }
};

const cancelForm = () => {
  showAddForm.value = false;
  editingExpense.value = null;
  form.value = {
    category: '',
    description: '',
    amount: 0,
    expenseDate: new Date().toISOString().split('T')[0],
    payee: '',
    paymentMethod: '',
    reference: '',
    receiptNumber: '',
    notes: '',
    academicYear: '2024-2025',
  };
};

const changePage = (page: number) => {
  pagination.value.page = page;
  loadExpenses();
};

const formatAmount = (amount: number) => {
  return `${amount.toLocaleString('fr-FR')} FCFA`;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR');
};

const getCategoryLabel = (category: string) => {
  const labels: { [key: string]: string } = {
    salaries: 'Salaires',
    supplies: 'Fournitures',
    maintenance: 'Maintenance',
    utilities: 'Services publics',
    rent: 'Loyer',
    transport: 'Transport',
    equipment: 'Équipement',
    other: 'Autre',
  };
  return labels[category] || category;
};

const getCategoryBadgeClass = (category: string) => {
  const classes: { [key: string]: string } = {
    salaries: 'bg-purple-100 text-purple-800',
    supplies: 'bg-blue-100 text-blue-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    utilities: 'bg-green-100 text-green-800',
    rent: 'bg-red-100 text-red-800',
    transport: 'bg-indigo-100 text-indigo-800',
    equipment: 'bg-pink-100 text-pink-800',
    other: 'bg-gray-100 text-gray-800',
  };
  return classes[category] || 'bg-gray-100 text-gray-800';
};

const getPaymentMethodLabel = (method: string) => {
  const labels: { [key: string]: string } = {
    cash: 'Espèces',
    check: 'Chèque',
    bank_transfer: 'Virement bancaire',
    mobile_money: 'Mobile Money',
    card: 'Carte',
    other: 'Autre',
  };
  return labels[method] || method;
};

const getCategoryTotal = (category: string) => {
  const cat = statistics.value.expensesByCategory.find((c: any) => c.category === category);
  return cat ? cat.total : 0;
};

onMounted(() => {
  loadExpenses();
  loadStatistics();
});
</script>
