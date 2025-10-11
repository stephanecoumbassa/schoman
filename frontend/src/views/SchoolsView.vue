<template>
  <div class="schools-view">
    <div class="header">
      <h1 class="title">Gestion des Établissements</h1>
      <button @click="showCreateModal = true" class="btn-primary">
        ➕ Nouvel Établissement
      </button>
    </div>

    <!-- Search and Filter -->
    <div class="filters">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Rechercher par nom, code ou ville..."
        class="search-input"
        @input="handleSearch"
      />
      <div class="filter-group">
        <label>
          <input
            type="checkbox"
            v-model="showInactive"
            @change="handleSearch"
          />
          Afficher inactifs
        </label>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Chargement...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="schoolStore.clearError()" class="btn-small">✕</button>
    </div>

    <!-- Schools Grid -->
    <div v-if="!loading" class="schools-grid">
      <div
        v-for="school in filteredSchools"
        :key="school._id"
        class="school-card"
        :class="{ inactive: !school.isActive }"
      >
        <div class="card-header">
          <div class="school-info">
            <h3 class="school-name">{{ school.name }}</h3>
            <span class="school-code">{{ school.code }}</span>
          </div>
          <span class="status-badge" :class="{ active: school.isActive }">
            {{ school.isActive ? 'Actif' : 'Inactif' }}
          </span>
        </div>

        <div class="card-body">
          <div class="info-row">
            <span class="label">📍 Adresse:</span>
            <span>{{ school.address }}, {{ school.city }}</span>
          </div>
          <div class="info-row">
            <span class="label">🌍 Pays:</span>
            <span>{{ school.country }}</span>
          </div>
          <div class="info-row">
            <span class="label">📞 Téléphone:</span>
            <span>{{ school.phone }}</span>
          </div>
          <div class="info-row">
            <span class="label">📧 Email:</span>
            <span>{{ school.email }}</span>
          </div>
          <div v-if="school.director" class="info-row">
            <span class="label">👤 Directeur:</span>
            <span>{{ school.director }}</span>
          </div>
        </div>

        <div class="card-footer">
          <button @click="viewStats(school._id)" class="btn-secondary btn-small">
            📊 Statistiques
          </button>
          <button @click="editSchool(school)" class="btn-secondary btn-small">
            ✏️ Modifier
          </button>
          <button
            @click="confirmDelete(school)"
            class="btn-danger btn-small"
            v-if="school.isActive"
          >
            🗑️ Supprimer
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && filteredSchools.length === 0" class="empty-state">
      <p>Aucun établissement trouvé</p>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ showEditModal ? 'Modifier l\'établissement' : 'Nouvel établissement' }}</h2>
          <button @click="closeModals" class="btn-close">✕</button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Nom *</label>
              <input v-model="formData.name" type="text" required class="form-input" />
            </div>

            <div class="form-group">
              <label>Code *</label>
              <input
                v-model="formData.code"
                type="text"
                required
                :disabled="showEditModal"
                class="form-input"
                placeholder="Ex: SCH001"
              />
            </div>

            <div class="form-group full-width">
              <label>Adresse *</label>
              <input v-model="formData.address" type="text" required class="form-input" />
            </div>

            <div class="form-group">
              <label>Ville *</label>
              <input v-model="formData.city" type="text" required class="form-input" />
            </div>

            <div class="form-group">
              <label>Pays *</label>
              <input v-model="formData.country" type="text" required class="form-input" />
            </div>

            <div class="form-group">
              <label>Téléphone *</label>
              <input v-model="formData.phone" type="tel" required class="form-input" />
            </div>

            <div class="form-group">
              <label>Email *</label>
              <input v-model="formData.email" type="email" required class="form-input" />
            </div>

            <div class="form-group">
              <label>Site Web</label>
              <input v-model="formData.website" type="url" class="form-input" />
            </div>

            <div class="form-group">
              <label>Directeur</label>
              <input v-model="formData.director" type="text" class="form-input" />
            </div>

            <div class="form-group">
              <label>Devise</label>
              <select v-model="formData.settings.currency" class="form-input">
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
                <option value="XAF">XAF (FCFA)</option>
                <option value="MAD">MAD (DH)</option>
              </select>
            </div>

            <div class="form-group">
              <label>Langue</label>
              <select v-model="formData.settings.language" class="form-input">
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeModals" class="btn-secondary">
              Annuler
            </button>
            <button type="submit" class="btn-primary" :disabled="saving">
              {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Stats Modal -->
    <div v-if="showStatsModal && currentStats" class="modal-overlay" @click.self="showStatsModal = false">
      <div class="modal stats-modal">
        <div class="modal-header">
          <h2>Statistiques - {{ currentStats.school.name }}</h2>
          <button @click="showStatsModal = false" class="btn-close">✕</button>
        </div>

        <div class="modal-body">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">👥</div>
              <div class="stat-value">{{ currentStats.statistics.totalStudents }}</div>
              <div class="stat-label">Élèves</div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">👨‍🏫</div>
              <div class="stat-value">{{ currentStats.statistics.totalTeachers }}</div>
              <div class="stat-label">Enseignants</div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">🏫</div>
              <div class="stat-value">{{ currentStats.statistics.totalClasses }}</div>
              <div class="stat-label">Classes</div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">💰</div>
              <div class="stat-value">
                {{ formatCurrency(currentStats.statistics.totalRevenue) }}
              </div>
              <div class="stat-label">Revenus totaux</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useSchoolStore } from '@/stores/school';
import type { School, SchoolStats } from '@/services/schoolService';
import { storeToRefs } from 'pinia';

const schoolStore = useSchoolStore();
const { schools, loading, error } = storeToRefs(schoolStore);

const searchQuery = ref('');
const showInactive = ref(false);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showStatsModal = ref(false);
const saving = ref(false);
const currentStats = ref<SchoolStats | null>(null);

const formData = ref({
  name: '',
  code: '',
  address: '',
  city: '',
  country: '',
  phone: '',
  email: '',
  website: '',
  director: '',
  settings: {
    currency: 'EUR',
    language: 'fr',
    timezone: 'Europe/Paris',
    dateFormat: 'DD/MM/YYYY',
  },
});

const editingSchoolId = ref<string | null>(null);

const filteredSchools = computed(() => {
  let result = schools.value;

  if (!showInactive.value) {
    result = result.filter(s => s.isActive);
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      s =>
        s.name.toLowerCase().includes(query) ||
        s.code.toLowerCase().includes(query) ||
        s.city.toLowerCase().includes(query)
    );
  }

  return result;
});

onMounted(async () => {
  await schoolStore.fetchSchools();
});

const handleSearch = () => {
  // Search is handled by computed property
};

const editSchool = (school: School) => {
  editingSchoolId.value = school._id;
  formData.value = {
    name: school.name,
    code: school.code,
    address: school.address,
    city: school.city,
    country: school.country,
    phone: school.phone,
    email: school.email,
    website: school.website || '',
    director: school.director || '',
    settings: { ...school.settings },
  };
  showEditModal.value = true;
};

const confirmDelete = async (school: School) => {
  if (confirm(`Êtes-vous sûr de vouloir désactiver l'établissement "${school.name}" ?`)) {
    try {
      await schoolStore.deleteSchool(school._id);
    } catch (error) {
      console.error('Error deleting school:', error);
    }
  }
};

const viewStats = async (schoolId: string) => {
  const stats = await schoolStore.getSchoolStats(schoolId);
  if (stats) {
    currentStats.value = stats;
    showStatsModal.value = true;
  }
};

const handleSubmit = async () => {
  saving.value = true;
  try {
    if (showEditModal.value && editingSchoolId.value) {
      await schoolStore.updateSchool(editingSchoolId.value, formData.value);
    } else {
      await schoolStore.createSchool(formData.value);
    }
    closeModals();
    await schoolStore.fetchSchools();
  } catch (error) {
    console.error('Error saving school:', error);
  } finally {
    saving.value = false;
  }
};

const closeModals = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  editingSchoolId.value = null;
  resetForm();
};

const resetForm = () => {
  formData.value = {
    name: '',
    code: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    director: '',
    settings: {
      currency: 'EUR',
      language: 'fr',
      timezone: 'Europe/Paris',
      dateFormat: 'DD/MM/YYYY',
    },
  };
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};
</script>

<style scoped>
.schools-view {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.filter-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.loading {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  background: #fee2e2;
  color: #991b1b;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.schools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.school-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.2s;
}

.school-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.school-card.inactive {
  opacity: 0.6;
}

.card-header {
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: start;
}

.school-info {
  flex: 1;
}

.school-name {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.school-code {
  font-size: 0.875rem;
  opacity: 0.9;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
}

.status-badge.active {
  background: rgba(16, 185, 129, 0.2);
}

.card-body {
  padding: 1.5rem;
}

.info-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

.info-row .label {
  font-weight: 600;
  color: #6b7280;
  min-width: 120px;
}

.card-footer {
  padding: 1rem 1.5rem;
  background: #f9fafb;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

/* Buttons */
.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background: #d1d5db;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 0.75rem;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.stats-modal {
  max-width: 600px;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: bold;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
}

.btn-close:hover {
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  text-align: center;
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.9;
}
</style>
