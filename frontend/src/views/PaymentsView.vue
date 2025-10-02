<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold text-gray-900">💳 Gestion des Paiements</h1>
        <button
          @click="$router.go(-1)"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          ← Retour
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            v-model="filters.paymentMethod"
            class="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Toutes les méthodes</option>
            <option value="cash">Espèces</option>
            <option value="check">Chèque</option>
            <option value="bank_transfer">Virement bancaire</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="card">Carte</option>
            <option value="other">Autre</option>
          </select>
          <button
            @click="loadPayments"
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            🔍 Filtrer
          </button>
        </div>
      </div>

      <!-- Add Payment Button -->
      <div v-if="canManage" class="mb-6">
        <button
          @click="showAddForm = true"
          class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          ➕ Enregistrer un paiement
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

      <!-- Payments Table -->
      <div v-if="!loading" class="bg-white rounded-lg shadow-md overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                N° Paiement
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Facture
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Élève
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
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reçu par
              </th>
              <th v-if="canManage" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="payment in payments" :key="payment._id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ payment.paymentNumber }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                {{ payment.invoice?.invoiceNumber || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ getStudentName(payment.student) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                {{ formatAmount(payment.amount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(payment.paymentDate) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getMethodColor(payment.paymentMethod)" class="px-2 py-1 text-xs rounded-full">
                  {{ getMethodLabel(payment.paymentMethod) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ getReceiverName(payment.receivedBy) }}
              </td>
              <td v-if="canManage" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button
                  @click="editPayment(payment)"
                  class="text-indigo-600 hover:text-indigo-900 mr-3"
                  title="Modifier"
                >
                  ✏️
                </button>
                <button
                  @click="deletePaymentConfirm(payment._id)"
                  class="text-red-600 hover:text-red-900"
                  title="Supprimer"
                >
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div v-if="payments.length === 0" class="text-center py-8">
          <p class="text-gray-500">Aucun paiement trouvé</p>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.pages > 1" class="mt-6 flex items-center justify-between">
        <p class="text-sm text-gray-700">
          Page {{ pagination.page }} sur {{ pagination.pages }} ({{ pagination.total }} paiements)
        </p>
        <div class="flex gap-2">
          <button
            @click="previousPage"
            :disabled="pagination.page === 1"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Précédent
          </button>
          <button
            @click="nextPage"
            :disabled="pagination.page === pagination.pages"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      </div>

      <!-- Add/Edit Form Modal -->
      <div
        v-if="showAddForm || showEditForm"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="closeForm"
      >
        <div class="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <h2 class="text-2xl font-bold mb-6">
            {{ showEditForm ? '✏️ Modifier le paiement' : '➕ Enregistrer un paiement' }}
          </h2>
          <form @submit.prevent="showEditForm ? updatePayment() : createPayment()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  ID Facture <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.invoice"
                  type="text"
                  required
                  placeholder="ID de la facture"
                  class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  ID Élève <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.student"
                  type="text"
                  required
                  placeholder="ID de l'élève"
                  class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Montant <span class="text-red-500">*</span>
                </label>
                <input
                  v-model.number="formData.amount"
                  type="number"
                  required
                  min="0"
                  placeholder="0"
                  class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Date de paiement <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.paymentDate"
                  type="date"
                  required
                  class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Méthode de paiement <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="formData.paymentMethod"
                  required
                  class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Sélectionner...</option>
                  <option value="cash">Espèces</option>
                  <option value="check">Chèque</option>
                  <option value="bank_transfer">Virement bancaire</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="card">Carte</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Référence
                </label>
                <input
                  v-model="formData.reference"
                  type="text"
                  placeholder="N° de transaction"
                  class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                v-model="formData.notes"
                rows="3"
                class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              ></textarea>
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                @click="closeForm"
                class="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                :disabled="loading"
              >
                {{ showEditForm ? 'Mettre à jour' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { api } from '../services/api';

const authStore = useAuthStore();

const payments = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const showAddForm = ref(false);
const showEditForm = ref(false);
const editingId = ref<string | null>(null);

const filters = ref({
  paymentMethod: '',
});

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  pages: 1,
});

const formData = ref({
  invoice: '',
  student: '',
  amount: 0,
  paymentDate: new Date().toISOString().split('T')[0],
  paymentMethod: '',
  reference: '',
  notes: '',
});

const canManage = computed(() => {
  return authStore.user && ['admin', 'teacher'].includes(authStore.user.role);
});

const loadPayments = async () => {
  loading.value = true;
  error.value = null;

  try {
    const params: any = {
      page: pagination.value.page,
      limit: pagination.value.limit,
    };

    if (filters.value.paymentMethod) params.paymentMethod = filters.value.paymentMethod;

    const response = await api.getPayments(params);
    if (response.data) {
      payments.value = response.data.payments;
      pagination.value = response.data.pagination;
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors du chargement des paiements';
  } finally {
    loading.value = false;
  }
};

const createPayment = async () => {
  loading.value = true;
  error.value = null;

  try {
    await api.recordPayment(formData.value);
    closeForm();
    await loadPayments();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de l\'enregistrement du paiement';
  } finally {
    loading.value = false;
  }
};

const updatePayment = async () => {
  if (!editingId.value) return;

  loading.value = true;
  error.value = null;

  try {
    await api.updatePayment(editingId.value, formData.value);
    closeForm();
    await loadPayments();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la mise à jour du paiement';
  } finally {
    loading.value = false;
  }
};

const editPayment = (payment: any) => {
  editingId.value = payment._id;
  formData.value = {
    invoice: payment.invoice?._id || payment.invoice,
    student: payment.student?._id || payment.student,
    amount: payment.amount,
    paymentDate: payment.paymentDate?.split('T')[0] || '',
    paymentMethod: payment.paymentMethod,
    reference: payment.reference || '',
    notes: payment.notes || '',
  };
  showEditForm.value = true;
};

const deletePaymentConfirm = async (id: string) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce paiement ? La facture sera mise à jour.')) return;

  loading.value = true;
  error.value = null;

  try {
    await api.deletePayment(id);
    await loadPayments();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la suppression du paiement';
  } finally {
    loading.value = false;
  }
};

const closeForm = () => {
  showAddForm.value = false;
  showEditForm.value = false;
  editingId.value = null;
  formData.value = {
    invoice: '',
    student: '',
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    reference: '',
    notes: '',
  };
};

const previousPage = () => {
  if (pagination.value.page > 1) {
    pagination.value.page--;
    loadPayments();
  }
};

const nextPage = () => {
  if (pagination.value.page < pagination.value.pages) {
    pagination.value.page++;
    loadPayments();
  }
};

const getStudentName = (student: any) => {
  if (!student || !student.userId) return 'N/A';
  return `${student.userId.firstName} ${student.userId.lastName}`;
};

const getReceiverName = (receiver: any) => {
  if (!receiver) return 'N/A';
  return `${receiver.firstName} ${receiver.lastName}`;
};

const formatDate = (date: string) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('fr-FR');
};

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
};

const getMethodColor = (method: string) => {
  const colors: Record<string, string> = {
    cash: 'bg-green-100 text-green-800',
    check: 'bg-blue-100 text-blue-800',
    bank_transfer: 'bg-purple-100 text-purple-800',
    mobile_money: 'bg-yellow-100 text-yellow-800',
    card: 'bg-indigo-100 text-indigo-800',
    other: 'bg-gray-100 text-gray-800',
  };
  return colors[method] || 'bg-gray-100 text-gray-800';
};

const getMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    cash: 'Espèces',
    check: 'Chèque',
    bank_transfer: 'Virement',
    mobile_money: 'Mobile Money',
    card: 'Carte',
    other: 'Autre',
  };
  return labels[method] || method;
};

onMounted(() => {
  loadPayments();
});
</script>
