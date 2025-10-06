<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">📉 Dépenses</h1>
      <button
        v-if="canManageExpenses"
        @click="openCreateModal"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
      >
        <span class="text-xl">+</span>
        Nouvelle dépense
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-md p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
          <select
            v-model="filters.category"
            @change="fetchExpenses"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Toutes les catégories</option>
            <option value="salary">Salaires</option>
            <option value="supplies">Fournitures</option>
            <option value="maintenance">Maintenance</option>
            <option value="utilities">Services publics</option>
            <option value="transport">Transport</option>
            <option value="food">Alimentation</option>
            <option value="equipment">Équipement</option>
            <option value="other">Autre</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select
            v-model="filters.status"
            @change="fetchExpenses"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvé</option>
            <option value="paid">Payé</option>
            <option value="rejected">Rejeté</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
          <input
            v-model="filters.search"
            @input="debouncedSearch"
            type="text"
            placeholder="Rechercher..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div class="flex items-end">
          <button
            @click="resetFilters"
            class="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md"
          >
            Réinitialiser
          </button>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div v-if="stats" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="text-sm text-gray-600">Total dépenses</div>
        <div class="text-3xl font-bold text-blue-600">{{ stats.totalExpenses }}</div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="text-sm text-gray-600">En attente</div>
        <div class="text-3xl font-bold text-orange-600">{{ stats.pendingExpenses }}</div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="text-sm text-gray-600">Montant total</div>
        <div class="text-2xl font-bold text-red-600">{{ formatAmount(stats.totalAmount) }} FCFA</div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="text-sm text-gray-600">Montant payé</div>
        <div class="text-2xl font-bold text-green-600">{{ formatAmount(stats.paidAmount) }} FCFA</div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="text-gray-600">Chargement...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-red-600">{{ error }}</p>
    </div>

    <!-- Expenses List -->
    <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N°</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titre</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="expense in expenses" :key="expense._id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm font-mono text-gray-900">{{ expense.expenseNumber }}</td>
              <td class="px-6 py-4">
                <div class="font-medium text-gray-900">{{ expense.title }}</div>
                <div v-if="expense.supplier" class="text-sm text-gray-500">{{ expense.supplier }}</div>
              </td>
              <td class="px-6 py-4 text-sm">
                <span :class="getCategoryColor(expense.category)" class="px-2 py-1 rounded-full text-xs">
                  {{ getCategoryLabel(expense.category) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm font-semibold text-gray-900">{{ formatAmount(expense.amount) }} FCFA</td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ formatDate(expense.expenseDate) }}</td>
              <td class="px-6 py-4 text-sm">
                <span :class="getStatusColor(expense.status)" class="px-2 py-1 rounded-full text-xs">
                  {{ getStatusLabel(expense.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm">
                <div class="flex gap-2">
                  <button
                    @click="viewExpense(expense)"
                    class="text-blue-600 hover:text-blue-800"
                    title="Voir détails"
                  >
                    👁️
                  </button>
                  <button
                    v-if="canManageExpenses && expense.status !== 'paid'"
                    @click="editExpense(expense)"
                    class="text-green-600 hover:text-green-800"
                    title="Modifier"
                  >
                    ✏️
                  </button>
                  <button
                    v-if="isAdmin && expense.status === 'pending'"
                    @click="approveExpense(expense._id)"
                    class="text-green-600 hover:text-green-800"
                    title="Approuver"
                  >
                    ✅
                  </button>
                  <button
                    v-if="isAdmin && expense.status === 'approved'"
                    @click="openPaymentModal(expense)"
                    class="text-purple-600 hover:text-purple-800"
                    title="Enregistrer paiement"
                  >
                    💳
                  </button>
                  <button
                    v-if="isAdmin && expense.status !== 'paid'"
                    @click="deleteExpense(expense._id)"
                    class="text-red-600 hover:text-red-800"
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination" class="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
        <div class="text-sm text-gray-700">
          {{ (pagination.page - 1) * pagination.limit + 1 }} - 
          {{ Math.min(pagination.page * pagination.limit, pagination.total) }} sur {{ pagination.total }}
        </div>
        <div class="flex gap-2">
          <button
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Précédent
          </button>
          <button
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page >= pagination.pages"
            class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <h2 class="text-2xl font-bold mb-4">
            {{ isEditing ? 'Modifier la dépense' : 'Nouvelle dépense' }}
          </h2>
          
          <form @submit.prevent="submitForm" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input
                v-model="form.title"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                v-model="form.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
              ></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
                <select
                  v-model="form.category"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="salary">Salaires</option>
                  <option value="supplies">Fournitures</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="utilities">Services publics</option>
                  <option value="transport">Transport</option>
                  <option value="food">Alimentation</option>
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
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date de la dépense *</label>
              <input
                v-model="form.expenseDate"
                type="date"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                <input
                  v-model="form.supplier"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Contact fournisseur</label>
                <input
                  v-model="form.supplierContact"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                v-model="form.notes"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
              ></textarea>
            </div>

            <div class="flex justify-end gap-2 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
              >
                {{ submitting ? 'En cours...' : isEditing ? 'Mettre à jour' : 'Créer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <div v-if="showPaymentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-md w-full">
        <div class="p-6">
          <h2 class="text-2xl font-bold mb-4">Enregistrer le paiement</h2>
          
          <form @submit.prevent="submitPayment" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date de paiement *</label>
              <input
                v-model="paymentForm.paymentDate"
                type="date"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Méthode de paiement *</label>
              <select
                v-model="paymentForm.paymentMethod"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="cash">Espèces</option>
                <option value="check">Chèque</option>
                <option value="bank_transfer">Virement bancaire</option>
                <option value="credit_card">Carte bancaire</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Référence de paiement</label>
              <input
                v-model="paymentForm.paymentReference"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div class="flex justify-end gap-2 pt-4">
              <button
                type="button"
                @click="closePaymentModal"
                class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
              >
                {{ submitting ? 'En cours...' : 'Enregistrer' }}
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
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';
import type { Expense, ExpenseFormData, ExpenseStats, Pagination, Payment } from '@/types';

const authStore = useAuthStore();

const expenses = ref<Expense[]>([]);
const stats = ref<ExpenseStats | null>(null);
const pagination = ref<Pagination | null>(null);
const loading = ref(false);
const error = ref('');
const showModal = ref(false);
const showPaymentModal = ref(false);
const isEditing = ref(false);
const submitting = ref(false);
const editingId = ref<string>('');
const payingExpenseId = ref<string>('');

const filters = ref({
  category: '',
  status: '',
  search: '',
  page: 1,
  limit: 10,
});

const form = ref<ExpenseFormData>({
  title: '',
  description: '',
  category: 'supplies',
  amount: 0,
  expenseDate: new Date().toISOString().split('T')[0] || '',
  supplier: '',
  supplierContact: '',
  notes: '',
});

const paymentForm = ref<Payment>({
  paymentDate: new Date().toISOString().split('T')[0] || '',
  paymentMethod: 'bank_transfer',
  paymentReference: '',
});

const canManageExpenses = computed(() => {
  return authStore.userRole === 'admin' || authStore.userRole === 'teacher';
});

const isAdmin = computed(() => {
  return authStore.userRole === 'admin';
});

let searchTimeout: ReturnType<typeof setTimeout>;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchExpenses();
  }, 300);
};

const fetchExpenses = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const params: Record<string, string> = {
      page: filters.value.page.toString(),
      limit: filters.value.limit.toString(),
    };

    if (filters.value.category) params.category = filters.value.category;
    if (filters.value.status) params.status = filters.value.status;
    if (filters.value.search) params.search = filters.value.search;

    const response = await api.getExpenses(params);
    
    if (response.error) {
      error.value = response.error;
    } else if (response.data) {
      expenses.value = response.data.expenses;
      pagination.value = response.data.pagination;
    }
  } catch (err) {
    error.value = 'Erreur lors du chargement des dépenses';
  } finally {
    loading.value = false;
  }
};

const fetchStats = async () => {
  try {
    const response = await api.getExpenseStats();
    if (response.data) {
      stats.value = response.data;
    }
  } catch (err) {
    console.error('Erreur lors du chargement des statistiques');
  }
};

const resetFilters = () => {
  filters.value = {
    category: '',
    status: '',
    search: '',
    page: 1,
    limit: 10,
  };
  fetchExpenses();
};

const changePage = (page: number) => {
  filters.value.page = page;
  fetchExpenses();
};

const openCreateModal = () => {
  isEditing.value = false;
  form.value = {
    title: '',
    description: '',
    category: 'supplies',
    amount: 0,
    expenseDate: new Date().toISOString().split('T')[0] || '',
    supplier: '',
    supplierContact: '',
    notes: '',
  };
  showModal.value = true;
};

const editExpense = (expense: Expense) => {
  isEditing.value = true;
  editingId.value = expense._id;
  form.value = {
    title: expense.title,
    description: expense.description || '',
    category: expense.category,
    amount: expense.amount,
    expenseDate: expense.expenseDate.split('T')[0] || '',
    supplier: expense.supplier || '',
    supplierContact: expense.supplierContact || '',
    notes: expense.notes || '',
  };
  showModal.value = true;
};

const viewExpense = (expense: Expense) => {
  const details = [
    `Dépense: ${expense.title}`,
    `N°: ${expense.expenseNumber}`,
    `Catégorie: ${getCategoryLabel(expense.category)}`,
    `Montant: ${formatAmount(expense.amount)} FCFA`,
    `Date: ${formatDate(expense.expenseDate)}`,
    `Fournisseur: ${expense.supplier || 'Non spécifié'}`,
    `Statut: ${getStatusLabel(expense.status)}`,
  ];
  alert(details.join('\n'));
};

const closeModal = () => {
  showModal.value = false;
  isEditing.value = false;
  editingId.value = '';
};

const openPaymentModal = (expense: Expense) => {
  payingExpenseId.value = expense._id;
  paymentForm.value = {
    paymentDate: new Date().toISOString().split('T')[0] || '',
    paymentMethod: 'bank_transfer',
    paymentReference: '',
  };
  showPaymentModal.value = true;
};

const closePaymentModal = () => {
  showPaymentModal.value = false;
  payingExpenseId.value = '';
};

const submitForm = async () => {
  submitting.value = true;
  error.value = '';

  try {
    let response;
    if (isEditing.value) {
      response = await api.updateExpense(editingId.value, form.value);
    } else {
      response = await api.createExpense(form.value);
    }

    if (response.error) {
      error.value = response.error;
    } else {
      closeModal();
      await fetchExpenses();
      await fetchStats();
    }
  } catch (err) {
    error.value = 'Erreur lors de l\'enregistrement';
  } finally {
    submitting.value = false;
  }
};

const submitPayment = async () => {
  submitting.value = true;
  error.value = '';

  try {
    const response = await api.recordExpensePayment(payingExpenseId.value, paymentForm.value);

    if (response.error) {
      error.value = response.error;
    } else {
      closePaymentModal();
      await fetchExpenses();
      await fetchStats();
    }
  } catch (err) {
    error.value = 'Erreur lors de l\'enregistrement du paiement';
  } finally {
    submitting.value = false;
  }
};

const approveExpense = async (id: string) => {
  if (!confirm('Êtes-vous sûr de vouloir approuver cette dépense ?')) return;

  try {
    const response = await api.approveExpense(id);
    if (response.error) {
      error.value = response.error;
    } else {
      await fetchExpenses();
      await fetchStats();
    }
  } catch (err) {
    error.value = 'Erreur lors de l\'approbation';
  }
};

const deleteExpense = async (id: string) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) return;

  try {
    const response = await api.deleteExpense(id);
    if (response.error) {
      error.value = response.error;
    } else {
      await fetchExpenses();
      await fetchStats();
    }
  } catch (err) {
    error.value = 'Erreur lors de la suppression';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR');
};

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('fr-FR').format(amount);
};

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    salary: 'Salaires',
    supplies: 'Fournitures',
    maintenance: 'Maintenance',
    utilities: 'Services publics',
    transport: 'Transport',
    food: 'Alimentation',
    equipment: 'Équipement',
    other: 'Autre',
  };
  return labels[category] || category;
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    salary: 'bg-purple-100 text-purple-800',
    supplies: 'bg-blue-100 text-blue-800',
    maintenance: 'bg-orange-100 text-orange-800',
    utilities: 'bg-yellow-100 text-yellow-800',
    transport: 'bg-green-100 text-green-800',
    food: 'bg-pink-100 text-pink-800',
    equipment: 'bg-indigo-100 text-indigo-800',
    other: 'bg-gray-100 text-gray-800',
  };
  return colors[category] || colors.other;
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'En attente',
    approved: 'Approuvé',
    paid: 'Payé',
    rejected: 'Rejeté',
  };
  return labels[status] || status;
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return colors[status] || colors.pending;
};

onMounted(() => {
  fetchExpenses();
  if (canManageExpenses.value) {
    fetchStats();
  }
});
</script>
