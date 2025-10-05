<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestion des Dépenses</h1>
          <p class="mt-2 text-sm text-gray-600">
            Enregistrez et suivez toutes les dépenses de l'école
          </p>
        </div>
        <router-link
          to="/dashboard"
          class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
        >
          ← Retour au tableau de bord
        </router-link>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-red-100 rounded-md p-3">
              <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total Dépenses</dt>
                <dd class="text-lg font-semibold text-gray-900">{{ stats.totalExpenses || 0 }}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-purple-100 rounded-md p-3">
              <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Montant Total</dt>
                <dd class="text-lg font-semibold text-gray-900">{{ formatCurrency(stats.totalAmount || 0) }}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Catégories</dt>
                <dd class="text-lg font-semibold text-gray-900">{{ stats.byCategory?.length || 0 }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
            <select
              v-model="filters.category"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Toutes les catégories</option>
              <option value="salaries">Salaires</option>
              <option value="supplies">Fournitures</option>
              <option value="maintenance">Maintenance</option>
              <option value="utilities">Services publics</option>
              <option value="transport">Transport</option>
              <option value="other">Autre</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date début</label>
            <input
              v-model="filters.startDate"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date fin</label>
            <input
              v-model="filters.endDate"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div class="flex items-end">
            <button
              @click="applyFilters"
              class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Filtrer
            </button>
          </div>
        </div>
      </div>

      <!-- Add Expense Button (for admin and teachers) -->
      <div v-if="canManageExpenses" class="mb-6">
        <button
          @click="openAddExpenseForm"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          + Nouvelle Dépense
        </button>
      </div>

      <!-- Add/Edit Expense Form Modal -->
      <div v-if="showExpenseForm" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">
              {{ editingExpense ? 'Modifier la dépense' : 'Nouvelle dépense' }}
            </h3>
            <div class="mt-2 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <input
                  v-model="expenseForm.description"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Salaire enseignant, Fournitures..."
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
                  <select
                    v-model="expenseForm.category"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="salaries">Salaires</option>
                    <option value="supplies">Fournitures</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="utilities">Services publics</option>
                    <option value="transport">Transport</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Montant (XAF) *</label>
                  <input
                    v-model.number="expenseForm.amount"
                    type="number"
                    required
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <input
                    v-model="expenseForm.date"
                    type="date"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Fournisseur</label>
                  <input
                    v-model="expenseForm.vendor"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Nom du fournisseur"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Mode de paiement *</label>
                  <select
                    v-model="expenseForm.paymentMethod"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash">Espèces</option>
                    <option value="check">Chèque</option>
                    <option value="bank_transfer">Virement bancaire</option>
                    <option value="credit_card">Carte de crédit</option>
                    <option value="mobile_money">Mobile Money</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Référence paiement</label>
                  <input
                    v-model="expenseForm.paymentReference"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Numéro de référence"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Numéro de reçu</label>
                <input
                  v-model="expenseForm.receiptNumber"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Numéro de reçu"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  v-model="expenseForm.notes"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Notes additionnelles..."
                ></textarea>
              </div>
            </div>

            <div class="mt-6 flex justify-end space-x-3">
              <button
                @click="cancelExpenseForm"
                class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Annuler
              </button>
              <button
                @click="submitExpenseForm"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {{ editingExpense ? 'Modifier' : 'Créer' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Expenses Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div v-if="loading" class="p-8 text-center text-gray-500">Chargement...</div>
        <div v-else-if="expenses.length === 0" class="p-8 text-center text-gray-500">
          Aucune dépense trouvée
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fournisseur
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th v-if="canManageExpenses" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="expense in expenses" :key="expense._id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(expense.date) }}
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ expense.description }}</div>
                  <div v-if="expense.notes" class="text-sm text-gray-500">{{ expense.notes }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getCategoryBadgeClass(expense.category)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ getCategoryLabel(expense.category) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ expense.vendor || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ formatCurrency(expense.amount) }}
                </td>
                <td v-if="canManageExpenses" class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    @click="openEditExpenseForm(expense)"
                    class="text-yellow-600 hover:text-yellow-900"
                  >
                    ✏️
                  </button>
                  <button
                    v-if="authStore.user?.role === 'admin'"
                    @click="deleteExpenseConfirm(expense)"
                    class="text-red-600 hover:text-red-900"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.pages > 1" class="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
              Page {{ pagination.page }} sur {{ pagination.pages }} ({{ pagination.total }} total)
            </div>
            <div class="flex space-x-2">
              <button
                @click="changePage(pagination.page - 1)"
                :disabled="pagination.page === 1"
                class="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <button
                @click="changePage(pagination.page + 1)"
                :disabled="pagination.page === pagination.pages"
                class="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';
import type { Expense, ExpenseStats, Pagination } from '@/types';

const authStore = useAuthStore();

const loading = ref(false);
const expenses = ref<Expense[]>([]);
const stats = ref<ExpenseStats>({
  totalExpenses: 0,
  totalAmount: 0,
  byCategory: [],
  period: {
    startDate: '',
    endDate: '',
  },
});

const filters = ref({
  category: '',
  startDate: '',
  endDate: '',
});

const pagination = ref<Pagination>({
  page: 1,
  pages: 1,
  total: 0,
  limit: 10,
});

const showExpenseForm = ref(false);
const editingExpense = ref<Expense | null>(null);

const expenseForm = ref({
  description: '',
  category: 'supplies' as 'salaries' | 'supplies' | 'maintenance' | 'utilities' | 'transport' | 'other',
  amount: 0,
  date: new Date().toISOString().split('T')[0],
  vendor: '',
  paymentMethod: 'cash' as 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'mobile_money',
  paymentReference: '',
  receiptNumber: '',
  notes: '',
});

const canManageExpenses = computed(() => {
  return authStore.user?.role === 'admin' || authStore.user?.role === 'teacher';
});

const fetchExpenses = async () => {
  loading.value = true;
  const params: {
    page: number;
    limit: number;
    category?: string;
    startDate?: string;
    endDate?: string;
  } = {
    page: pagination.value.page,
    limit: pagination.value.limit,
  };

  if (filters.value.category) params.category = filters.value.category;
  if (filters.value.startDate) params.startDate = filters.value.startDate;
  if (filters.value.endDate) params.endDate = filters.value.endDate;

  const response = await api.getExpenses(params);
  if (response.data) {
    expenses.value = response.data.expenses;
    pagination.value = response.data.pagination;
  }
  loading.value = false;
};

const fetchStats = async () => {
  const params: { startDate?: string; endDate?: string } = {};
  if (filters.value.startDate) params.startDate = filters.value.startDate;
  if (filters.value.endDate) params.endDate = filters.value.endDate;

  const response = await api.getExpenseStats(params);
  if (response.data) {
    stats.value = response.data;
  }
};

const applyFilters = () => {
  pagination.value.page = 1;
  fetchExpenses();
  fetchStats();
};

const changePage = (page: number) => {
  pagination.value.page = page;
  fetchExpenses();
};

const openAddExpenseForm = () => {
  editingExpense.value = null;
  expenseForm.value = {
    description: '',
    category: 'supplies',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    paymentMethod: 'cash',
    paymentReference: '',
    receiptNumber: '',
    notes: '',
  };
  showExpenseForm.value = true;
};

const openEditExpenseForm = (expense: Expense) => {
  editingExpense.value = expense;
  expenseForm.value = {
    description: expense.description,
    category: expense.category,
    amount: expense.amount,
    date: expense.date.split('T')[0],
    vendor: expense.vendor || '',
    paymentMethod: expense.paymentMethod,
    paymentReference: expense.paymentReference || '',
    receiptNumber: expense.receiptNumber || '',
    notes: expense.notes || '',
  };
  showExpenseForm.value = true;
};

const cancelExpenseForm = () => {
  showExpenseForm.value = false;
  editingExpense.value = null;
};

const submitExpenseForm = async () => {
  if (!expenseForm.value.description || expenseForm.value.amount <= 0) {
    alert('Veuillez remplir tous les champs obligatoires');
    return;
  }

  try {
    if (editingExpense.value) {
      await api.updateExpense(editingExpense.value._id, expenseForm.value);
      alert('Dépense modifiée avec succès');
    } else {
      await api.createExpense(expenseForm.value);
      alert('Dépense créée avec succès');
    }
    cancelExpenseForm();
    fetchExpenses();
    fetchStats();
  } catch (error) {
    alert('Erreur lors de l\'enregistrement de la dépense');
  }
};

const deleteExpenseConfirm = async (expense: Expense) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer cette dépense ?`)) {
    const response = await api.deleteExpense(expense._id);
    if (response.data) {
      alert('Dépense supprimée avec succès');
      fetchExpenses();
      fetchStats();
    }
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR');
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
  }).format(amount);
};

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    salaries: 'Salaires',
    supplies: 'Fournitures',
    maintenance: 'Maintenance',
    utilities: 'Services publics',
    transport: 'Transport',
    other: 'Autre',
  };
  return labels[category] || category;
};

const getCategoryBadgeClass = (category: string) => {
  const classes: Record<string, string> = {
    salaries: 'bg-purple-100 text-purple-800',
    supplies: 'bg-blue-100 text-blue-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    utilities: 'bg-green-100 text-green-800',
    transport: 'bg-indigo-100 text-indigo-800',
    other: 'bg-gray-100 text-gray-800',
  };
  return classes[category] || classes.other;
};

onMounted(() => {
  fetchExpenses();
  fetchStats();
});
</script>
