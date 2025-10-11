<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Rapports Personnalisés</h1>
      <p class="text-gray-600 mt-1">
        Créez et générez des rapports personnalisés pour vos données
      </p>
    </div>

    <!-- Stats Cards -->
    <div v-if="stats" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="text-sm text-gray-600">Total Rapports</div>
        <div class="text-2xl font-bold text-gray-900">
          {{ stats.totalReports }}
        </div>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="text-sm text-gray-600">Rapports Planifiés</div>
        <div class="text-2xl font-bold text-blue-600">
          {{ stats.scheduledReports }}
        </div>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="text-sm text-gray-600">Par Type</div>
        <div class="text-sm text-gray-700 mt-1">
          <div v-for="(count, type) in stats.byType" :key="type">
            {{ type }}: {{ count }}
          </div>
        </div>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="text-sm text-gray-600">Par Format</div>
        <div class="text-sm text-gray-700 mt-1">
          <div v-for="(count, format) in stats.byFormat" :key="format">
            {{ format.toUpperCase() }}: {{ count }}
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="flex flex-wrap gap-4">
        <button
          @click="showCreateModal = true"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nouveau Rapport
        </button>

        <button
          @click="showTemplatesModal = true"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Modèles de Rapports
        </button>

        <button
          @click="loadReports"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualiser
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            v-model="filters.type"
            @change="loadReports"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les types</option>
            <option value="students">Élèves</option>
            <option value="grades">Notes</option>
            <option value="attendance">Présences</option>
            <option value="finances">Finances</option>
            <option value="custom">Personnalisé</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Planifiés</label>
          <select
            v-model="filters.scheduled"
            @change="loadReports"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous</option>
            <option value="true">Planifiés uniquement</option>
            <option value="false">Non planifiés</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Reports List -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nom
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Format
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Planifié
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dernière exécution
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="report in reports" :key="report._id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ report.name }}</div>
              <div class="text-sm text-gray-500">{{ report.description }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                {{ report.type }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ String(report.format).toUpperCase() }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                v-if="report.scheduled"
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"
              >
                Oui
              </span>
              <span v-else class="text-sm text-gray-400">Non</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ report.lastRun ? formatDate(report.lastRun) : 'Jamais' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="generateReport(report._id!)"
                class="text-blue-600 hover:text-blue-900 mr-3"
                title="Générer"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
              <button
                @click="editReport(report)"
                class="text-yellow-600 hover:text-yellow-900 mr-3"
                title="Modifier"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="confirmDelete(report)"
                class="text-red-600 hover:text-red-900"
                title="Supprimer"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </td>
          </tr>
          <tr v-if="reports.length === 0">
            <td colspan="6" class="px-6 py-10 text-center text-gray-500">
              Aucun rapport trouvé
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click.self="closeCreateModal"
    >
      <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            {{ editingReport ? 'Modifier le Rapport' : 'Nouveau Rapport' }}
          </h3>
          <button @click="closeCreateModal" class="text-gray-400 hover:text-gray-500">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveReport" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nom du rapport *</label>
            <input
              v-model="formData.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              v-model="formData.description"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                v-model="formData.type"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="students">Élèves</option>
                <option value="grades">Notes</option>
                <option value="attendance">Présences</option>
                <option value="finances">Finances</option>
                <option value="custom">Personnalisé</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Format *</label>
              <select
                v-model="formData.format"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Champs à inclure *</label>
            <div class="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto">
              <label v-for="field in availableFields" :key="field.value" class="flex items-center mb-2">
                <input
                  type="checkbox"
                  :value="field.value"
                  v-model="formData.fields"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">{{ field.label }}</span>
              </label>
            </div>
          </div>

          <div class="flex items-center">
            <input
              type="checkbox"
              v-model="formData.scheduled"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label class="ml-2 text-sm font-medium text-gray-700">Rapport planifié</label>
          </div>

          <div v-if="formData.scheduled">
            <label class="block text-sm font-medium text-gray-700 mb-1">Expression Cron</label>
            <input
              v-model="formData.scheduleExpression"
              type="text"
              placeholder="0 0 * * * (tous les jours à minuit)"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="closeCreateModal"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="loading || formData.fields.length === 0"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ editingReport ? 'Mettre à jour' : 'Créer' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Templates Modal -->
    <div
      v-if="showTemplatesModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click.self="showTemplatesModal = false"
    >
      <div class="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">Modèles de Rapports</h3>
          <button @click="showTemplatesModal = false" class="text-gray-400 hover:text-gray-500">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-3">
          <div
            v-for="template in templates"
            :key="template.name"
            class="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 cursor-pointer"
            @click="useTemplate(template)"
          >
            <div class="font-medium text-gray-900">{{ template.name }}</div>
            <div class="text-sm text-gray-600 mt-1">
              Type: {{ template.type }} | Champs: {{ template.fields.join(', ') }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import reportService, { type Report, type ReportTemplate, type ReportStats } from '@/services/reportService';

const reports = ref<Report[]>([]);
const stats = ref<ReportStats | null>(null);
const templates = ref<ReportTemplate[]>([]);
const loading = ref(false);
const showCreateModal = ref(false);
const showTemplatesModal = ref(false);
const editingReport = ref<Report | null>(null);

const filters = ref({
  type: '',
  scheduled: '',
});

const formData = ref<{
  name: string;
  description: string;
  type: Report['type'];
  fields: string[];
  filters: any[];
  format: Report['format'];
  scheduled: boolean;
  scheduleExpression: string;
}>({
  name: '',
  description: '',
  type: 'students',
  fields: [],
  filters: [],
  format: 'pdf',
  scheduled: false,
  scheduleExpression: '0 0 * * *',
});

const availableFields = ref([
  { label: 'Prénom', value: 'firstName' },
  { label: 'Nom', value: 'lastName' },
  { label: 'Numéro', value: 'studentNumber' },
  { label: 'Email', value: 'email' },
  { label: 'Téléphone', value: 'phone' },
  { label: 'Classe', value: 'class' },
  { label: 'Niveau', value: 'level' },
  { label: 'Note', value: 'grade' },
  { label: 'Matière', value: 'subject' },
  { label: 'Date', value: 'date' },
  { label: 'Statut', value: 'status' },
  { label: 'Montant', value: 'amount' },
]);

async function loadReports() {
  try {
    loading.value = true;
    const params: any = {};
    if (filters.value.type) params.type = filters.value.type;
    if (filters.value.scheduled) params.scheduled = filters.value.scheduled === 'true';
    
    reports.value = await reportService.getReports(params);
  } catch (error) {
    console.error('Error loading reports:', error);
    alert('Erreur lors du chargement des rapports');
  } finally {
    loading.value = false;
  }
}

async function loadStats() {
  try {
    stats.value = await reportService.getStats();
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

async function loadTemplates() {
  try {
    templates.value = await reportService.getTemplates();
  } catch (error) {
    console.error('Error loading templates:', error);
  }
}

async function saveReport() {
  try {
    loading.value = true;
    
    const reportData = {
      ...formData.value,
      filters: formData.value.filters || [],
    };

    if (editingReport.value) {
      await reportService.updateReport(editingReport.value._id!, reportData);
    } else {
      await reportService.createReport(reportData);
    }

    closeCreateModal();
    await loadReports();
    await loadStats();
  } catch (error: any) {
    console.error('Error saving report:', error);
    alert(error.response?.data?.message || 'Erreur lors de la sauvegarde du rapport');
  } finally {
    loading.value = false;
  }
}

function editReport(report: Report) {
  editingReport.value = report;
  formData.value = {
    name: report.name,
    description: report.description || '',
    type: report.type,
    fields: [...report.fields],
    filters: report.filters || [],
    format: report.format,
    scheduled: report.scheduled || false,
    scheduleExpression: report.scheduleExpression || '0 0 * * *',
  };
  showCreateModal.value = true;
}

async function generateReport(id: string) {
  try {
    loading.value = true;
    await reportService.generateReport(id);
    await loadReports();
    await loadStats();
  } catch (error: any) {
    console.error('Error generating report:', error);
    alert(error.response?.data?.message || 'Erreur lors de la génération du rapport');
  } finally {
    loading.value = false;
  }
}

async function confirmDelete(report: Report) {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer le rapport "${report.name}" ?`)) {
    return;
  }

  try {
    loading.value = true;
    await reportService.deleteReport(report._id!);
    await loadReports();
    await loadStats();
  } catch (error: any) {
    console.error('Error deleting report:', error);
    alert(error.response?.data?.message || 'Erreur lors de la suppression du rapport');
  } finally {
    loading.value = false;
  }
}

function useTemplate(template: ReportTemplate) {
  formData.value = {
    name: template.name,
    description: '',
    type: template.type as Report['type'],
    fields: [...template.fields],
    filters: template.filters || [],
    format: 'pdf',
    scheduled: false,
    scheduleExpression: '0 0 * * *',
  };
  showTemplatesModal.value = false;
  showCreateModal.value = true;
}

function closeCreateModal() {
  showCreateModal.value = false;
  editingReport.value = null;
  formData.value = {
    name: '',
    description: '',
    type: 'students',
    fields: [],
    filters: [],
    format: 'pdf',
    scheduled: false,
    scheduleExpression: '0 0 * * *',
  };
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

onMounted(() => {
  loadReports();
  loadStats();
  loadTemplates();
});
</script>
