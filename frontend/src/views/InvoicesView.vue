<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold text-gray-900">💰 Gestion des Factures</h1>
        <button
          @click="$router.go(-1)"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          ← Retour
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            v-model="filters.status"
            class="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="issued">Émise</option>
            <option value="partial">Partielle</option>
            <option value="paid">Payée</option>
            <option value="overdue">En retard</option>
            <option value="cancelled">Annulée</option>
          </select>
          <input
            v-model="filters.academicYear"
            type="text"
            placeholder="Année académique (ex: 2024-2025)"
            class="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            @click="loadInvoices"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🔍 Filtrer
          </button>
          <button
            v-if="canManage"
            @click="updateOverdueInvoices"
            class="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            :disabled="loading"
          >
            ⏰ Mettre à jour retards
          </button>
        </div>
      </div>

      <!-- Add Invoice Button -->
      <div v-if="canManage" class="mb-6">
        <button
          @click="showAddForm = true"
          class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          ➕ Créer une facture
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

      <!-- Invoices Table -->
      <div v-if="!loading" class="bg-white rounded-lg shadow-md overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                N° Facture
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Élève
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date d'émission
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date d'échéance
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payé
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Solde
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th v-if="canManage" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="invoice in invoices" :key="invoice._id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ invoice.invoiceNumber }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ getStudentName(invoice.student) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(invoice.issueDate) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(invoice.dueDate) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatAmount(invoice.total) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                {{ formatAmount(invoice.amountPaid) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                {{ formatAmount(invoice.balance) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusColor(invoice.status)" class="px-2 py-1 text-xs rounded-full">
                  {{ getStatusLabel(invoice.status) }}
                </span>
              </td>
              <td v-if="canManage" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button
                  @click="viewInvoice(invoice._id)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                  title="Voir détails"
                >
                  👁️
                </button>
                <button
                  @click="editInvoice(invoice)"
                  class="text-indigo-600 hover:text-indigo-900 mr-3"
                  title="Modifier"
                >
                  ✏️
                </button>
                <button
                  @click="deleteInvoiceConfirm(invoice._id)"
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
        <div v-if="invoices.length === 0" class="text-center py-8">
          <p class="text-gray-500">Aucune facture trouvée</p>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.pages > 1" class="mt-6 flex items-center justify-between">
        <p class="text-sm text-gray-700">
          Page {{ pagination.page }} sur {{ pagination.pages }} ({{ pagination.total }} factures)
        </p>
        <div class="flex gap-2">
          <button
            @click="previousPage"
            :disabled="pagination.page === 1"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          <button
            @click="nextPage"
            :disabled="pagination.page === pagination.pages"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div class="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <h2 class="text-2xl font-bold mb-6">
            {{ showEditForm ? '✏️ Modifier la facture' : '➕ Créer une facture' }}
          </h2>
          <form @submit.prevent="showEditForm ? updateInvoice() : createInvoice()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Année académique <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.academicYear"
                  type="text"
                  required
                  placeholder="Ex: 2024-2025"
                  class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Date d'échéance <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.dueDate"
                  type="date"
                  required
                  class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Élève <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.student"
                type="text"
                required
                placeholder="ID de l'élève"
                class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p class="text-xs text-gray-500 mt-1">
                Conseil: Utilisez l'ID de l'élève (format: 507f1f77bcf86cd799439011)
              </p>
            </div>

            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Articles <span class="text-red-500">*</span>
              </label>
              <div v-for="(item, index) in formData.items" :key="index" class="mb-4 p-4 border rounded">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <input
                    v-model="item.description"
                    type="text"
                    placeholder="Description"
                    required
                    class="col-span-2 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    v-model.number="item.quantity"
                    type="number"
                    placeholder="Qté"
                    required
                    min="1"
                    class="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    v-model.number="item.unitPrice"
                    type="number"
                    placeholder="Prix unitaire"
                    required
                    min="0"
                    class="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  v-if="formData.items.length > 1"
                  type="button"
                  @click="removeItem(index)"
                  class="mt-2 text-red-600 text-sm hover:text-red-800"
                >
                  🗑️ Supprimer cet article
                </button>
              </div>
              <button
                type="button"
                @click="addItem"
                class="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                + Ajouter un article
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Remise</label>
                <input
                  v-model.number="formData.discount"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Taxe</label>
                <input
                  v-model.number="formData.tax"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                v-model="formData.notes"
                rows="3"
                class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                :disabled="loading"
              >
                {{ showEditForm ? 'Mettre à jour' : 'Créer' }}
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

const invoices = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const showAddForm = ref(false);
const showEditForm = ref(false);
const editingId = ref<string | null>(null);

const filters = ref({
  status: '',
  academicYear: '',
});

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  pages: 1,
});

const formData = ref({
  student: '',
  academicYear: '2024-2025',
  dueDate: '',
  items: [
    { description: '', quantity: 1, unitPrice: 0 },
  ],
  discount: 0,
  tax: 0,
  notes: '',
});

const canManage = computed(() => {
  return authStore.user && ['admin', 'teacher'].includes(authStore.user.role);
});

const loadInvoices = async () => {
  loading.value = true;
  error.value = null;

  try {
    const params: any = {
      page: pagination.value.page,
      limit: pagination.value.limit,
    };

    if (filters.value.status) params.status = filters.value.status;
    if (filters.value.academicYear) params.academicYear = filters.value.academicYear;

    const response = await api.getInvoices(params);
    if (response.data) {
      invoices.value = response.data.invoices;
      pagination.value = response.data.pagination;
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors du chargement des factures';
  } finally {
    loading.value = false;
  }
};

const createInvoice = async () => {
  loading.value = true;
  error.value = null;

  try {
    await api.createInvoice(formData.value);
    closeForm();
    await loadInvoices();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la création de la facture';
  } finally {
    loading.value = false;
  }
};

const updateInvoice = async () => {
  if (!editingId.value) return;

  loading.value = true;
  error.value = null;

  try {
    await api.updateInvoice(editingId.value, formData.value);
    closeForm();
    await loadInvoices();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la mise à jour de la facture';
  } finally {
    loading.value = false;
  }
};

const editInvoice = (invoice: any) => {
  editingId.value = invoice._id;
  formData.value = {
    student: invoice.student._id,
    academicYear: invoice.academicYear,
    dueDate: invoice.dueDate?.split('T')[0] || '',
    items: invoice.items,
    discount: invoice.discount || 0,
    tax: invoice.tax || 0,
    notes: invoice.notes || '',
  };
  showEditForm.value = true;
};

const deleteInvoiceConfirm = async (id: string) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) return;

  loading.value = true;
  error.value = null;

  try {
    await api.deleteInvoice(id);
    await loadInvoices();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la suppression de la facture';
  } finally {
    loading.value = false;
  }
};

const viewInvoice = (id: string) => {
  // For now, just log - could navigate to detail page
  console.log('View invoice:', id);
};

const updateOverdueInvoices = async () => {
  loading.value = true;
  error.value = null;

  try {
    await api.updateOverdueInvoices();
    await loadInvoices();
    alert('Statut des factures en retard mis à jour avec succès');
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la mise à jour';
  } finally {
    loading.value = false;
  }
};

const addItem = () => {
  formData.value.items.push({ description: '', quantity: 1, unitPrice: 0 });
};

const removeItem = (index: number) => {
  formData.value.items.splice(index, 1);
};

const closeForm = () => {
  showAddForm.value = false;
  showEditForm.value = false;
  editingId.value = null;
  formData.value = {
    student: '',
    academicYear: '2024-2025',
    dueDate: '',
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
    discount: 0,
    tax: 0,
    notes: '',
  };
};

const previousPage = () => {
  if (pagination.value.page > 1) {
    pagination.value.page--;
    loadInvoices();
  }
};

const nextPage = () => {
  if (pagination.value.page < pagination.value.pages) {
    pagination.value.page++;
    loadInvoices();
  }
};

const getStudentName = (student: any) => {
  if (!student || !student.userId) return 'N/A';
  return `${student.userId.firstName} ${student.userId.lastName}`;
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

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    issued: 'bg-blue-100 text-blue-800',
    partial: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-500',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    draft: 'Brouillon',
    issued: 'Émise',
    partial: 'Partielle',
    paid: 'Payée',
    overdue: 'En retard',
    cancelled: 'Annulée',
  };
  return labels[status] || status;
};

onMounted(() => {
  loadInvoices();
});
</script>
