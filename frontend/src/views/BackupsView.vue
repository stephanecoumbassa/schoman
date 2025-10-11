<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Backup & Restore</h1>
      <p class="text-gray-600 mt-1">
        Gérez les sauvegardes de la base de données
      </p>
    </div>

    <!-- Status Cards -->
    <div v-if="status" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="text-sm text-gray-600">Total Backups</div>
        <div class="text-2xl font-bold text-gray-900">
          {{ status.stats.totalBackups }}
        </div>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="text-sm text-gray-600">Taille Totale</div>
        <div class="text-2xl font-bold text-blue-600">
          {{ status.stats.totalSizeFormatted }}
        </div>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="text-sm text-gray-600">Backups Planifiés</div>
        <div class="text-2xl font-bold" :class="status.scheduled.isRunning ? 'text-green-600' : 'text-gray-400'">
          {{ status.scheduled.isRunning ? 'Actifs' : 'Inactifs' }}
        </div>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="text-sm text-gray-600">Dernier Backup</div>
        <div class="text-sm font-medium text-gray-900">
          {{ status.stats.latestBackup ? formatDate(status.stats.latestBackup.timestamp) : 'Aucun' }}
        </div>
      </div>
    </div>

    <!-- Actions Card -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h2>
      
      <div class="flex flex-wrap gap-4">
        <button
          @click="createBackup"
          :disabled="loading"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Créer un Backup Manuel
        </button>

        <button
          v-if="status && !status.scheduled.isRunning"
          @click="startScheduled"
          :disabled="loading"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Démarrer Backups Planifiés
        </button>

        <button
          v-if="status && status.scheduled.isRunning"
          @click="stopScheduled"
          :disabled="loading"
          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          </svg>
          Arrêter Backups Planifiés
        </button>

        <button
          @click="refreshList"
          :disabled="loading"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Rafraîchir
        </button>
      </div>

      <!-- Schedule Info -->
      <div v-if="status && status.scheduled.isRunning" class="mt-4 p-3 bg-blue-50 rounded-md">
        <p class="text-sm text-blue-800">
          📅 Planification : {{ status.scheduled.schedule }} (Format cron)
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && backups.length === 0" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-600">Chargement...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
      {{ error }}
    </div>

    <!-- Backups List -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Liste des Backups</h2>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fichier
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Heure
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Taille
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="backup in backups" :key="backup.filename" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                {{ backup.filename }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(backup.timestamp) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 py-1 text-xs font-semibold rounded"
                  :class="backup.type === 'manual' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'"
                >
                  {{ formatType(backup.type) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ formatBytes(backup.size) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 py-1 text-xs font-semibold rounded"
                  :class="backup.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                >
                  {{ backup.status === 'success' ? 'Succès' : 'Échoué' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button
                  @click="confirmRestore(backup)"
                  class="text-green-600 hover:text-green-900"
                >
                  Restaurer
                </button>
                <button
                  @click="confirmDelete(backup)"
                  class="text-red-600 hover:text-red-900"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="backups.length === 0 && !loading" class="text-center py-12">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
        <p class="mt-2 text-sm text-gray-500">Aucun backup disponible</p>
        <p class="text-xs text-gray-400 mt-1">Créez votre premier backup pour commencer</p>
      </div>
    </div>

    <!-- Restore Confirmation Modal -->
    <div
      v-if="restoreBackup"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click.self="restoreBackup = null"
    >
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-30"></div>
        <div class="relative bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">⚠️ Confirmer la Restauration</h3>
          <p class="text-sm text-gray-600 mb-4">
            Êtes-vous sûr de vouloir restaurer ce backup ? Cette action remplacera toutes les données actuelles de la base de données.
          </p>
          <p class="text-sm font-mono text-gray-900 bg-gray-100 p-2 rounded mb-4">
            {{ restoreBackup.filename }}
          </p>
          <p class="text-xs text-red-600 mb-4">
            ⚠️ Cette action est irréversible !
          </p>

          <div class="flex justify-end space-x-3">
            <button
              @click="restoreBackup = null"
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Annuler
            </button>
            <button
              @click="performRestore"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Restaurer
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="deleteBackup"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click.self="deleteBackup = null"
    >
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-30"></div>
        <div class="relative bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Confirmer la Suppression</h3>
          <p class="text-sm text-gray-600 mb-4">
            Êtes-vous sûr de vouloir supprimer ce backup ?
          </p>
          <p class="text-sm font-mono text-gray-900 bg-gray-100 p-2 rounded mb-4">
            {{ deleteBackup.filename }}
          </p>

          <div class="flex justify-end space-x-3">
            <button
              @click="deleteBackup = null"
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Annuler
            </button>
            <button
              @click="performDelete"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import backupService, { type BackupInfo, type BackupStatus } from '../services/backupService';

const backups = ref<BackupInfo[]>([]);
const status = ref<BackupStatus | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const restoreBackup = ref<BackupInfo | null>(null);
const deleteBackup = ref<BackupInfo | null>(null);

const loadBackups = async () => {
  loading.value = true;
  error.value = null;

  try {
    const data = await backupService.listBackups();
    if (data) {
      backups.value = data.backups;
    }
  } catch (err: any) {
    error.value = err.message || 'Erreur lors du chargement des backups';
    console.error('Error loading backups:', err);
  } finally {
    loading.value = false;
  }
};

const loadStatus = async () => {
  try {
    const data = await backupService.getStatus();
    if (data) {
      status.value = data;
    }
  } catch (err) {
    console.error('Error loading status:', err);
  }
};

const createBackup = async () => {
  if (!confirm('Créer un nouveau backup ? Cela peut prendre quelques minutes.')) {
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    await backupService.createBackup();
    alert('Backup créé avec succès !');
    await refreshList();
  } catch (err: any) {
    error.value = err.message || 'Erreur lors de la création du backup';
    alert('Erreur: ' + error.value);
  } finally {
    loading.value = false;
  }
};

const startScheduled = async () => {
  if (!confirm('Démarrer les backups automatiques planifiés ?')) {
    return;
  }

  try {
    await backupService.startScheduledBackups();
    alert('Backups planifiés démarrés avec succès !');
    await loadStatus();
  } catch (err: any) {
    alert('Erreur: ' + (err.message || 'Impossible de démarrer les backups planifiés'));
  }
};

const stopScheduled = async () => {
  if (!confirm('Arrêter les backups automatiques planifiés ?')) {
    return;
  }

  try {
    await backupService.stopScheduledBackups();
    alert('Backups planifiés arrêtés avec succès !');
    await loadStatus();
  } catch (err: any) {
    alert('Erreur: ' + (err.message || 'Impossible d\'arrêter les backups planifiés'));
  }
};

const confirmRestore = (backup: BackupInfo) => {
  restoreBackup.value = backup;
};

const performRestore = async () => {
  if (!restoreBackup.value) return;

  loading.value = true;
  const filename = restoreBackup.value.filename;
  restoreBackup.value = null;

  try {
    await backupService.restoreBackup(filename);
    alert('Base de données restaurée avec succès ! L\'application va recharger.');
    window.location.reload();
  } catch (err: any) {
    error.value = err.message || 'Erreur lors de la restauration';
    alert('Erreur: ' + error.value);
  } finally {
    loading.value = false;
  }
};

const confirmDelete = (backup: BackupInfo) => {
  deleteBackup.value = backup;
};

const performDelete = async () => {
  if (!deleteBackup.value) return;

  const filename = deleteBackup.value.filename;
  deleteBackup.value = null;
  loading.value = true;

  try {
    await backupService.deleteBackup(filename);
    alert('Backup supprimé avec succès !');
    await refreshList();
  } catch (err: any) {
    error.value = err.message || 'Erreur lors de la suppression';
    alert('Erreur: ' + error.value);
  } finally {
    loading.value = false;
  }
};

const refreshList = async () => {
  await Promise.all([loadBackups(), loadStatus()]);
};

const formatDate = (dateString: string): string => {
  return backupService.formatDate(dateString);
};

const formatType = (type: string): string => {
  return backupService.formatType(type);
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

onMounted(() => {
  refreshList();
});
</script>
