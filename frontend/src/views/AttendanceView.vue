<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestion des Présences</h1>
          <p class="mt-2 text-sm text-gray-600">
            Suivez les présences et absences des élèves
          </p>
        </div>
        <router-link
          to="/dashboard"
          class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
        >
          ← Retour au tableau de bord
        </router-link>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Élève
            </label>
            <input
              v-model="filters.student"
              type="text"
              placeholder="ID de l'élève"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Classe
            </label>
            <input
              v-model="filters.class"
              type="text"
              placeholder="ID de la classe"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              v-model="filters.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les statuts</option>
              <option value="Présent">Présent</option>
              <option value="Absent">Absent</option>
              <option value="Retard">Retard</option>
              <option value="Excusé">Excusé</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Date de début
            </label>
            <input
              v-model="filters.startDate"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div class="mt-4 flex justify-end">
          <button
            @click="fetchAttendances"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Filtrer
          </button>
        </div>
      </div>

      <!-- Add Attendance Button (for teachers and admins) -->
      <div v-if="canManageAttendance" class="mb-6">
        <button
          @click="showAddAttendanceForm = true"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          + Enregistrer une présence
        </button>
      </div>

      <!-- Add/Edit Attendance Form -->
      <div v-if="showAddAttendanceForm" class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">
          {{ editingAttendance ? 'Modifier la présence' : 'Enregistrer une présence' }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              ID Élève *
            </label>
            <input
              v-model="attendanceForm.student"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              ID Classe *
            </label>
            <input
              v-model="attendanceForm.class"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              v-model="attendanceForm.date"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Statut *
            </label>
            <select
              v-model="attendanceForm.status"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Présent">Présent</option>
              <option value="Absent">Absent</option>
              <option value="Retard">Retard</option>
              <option value="Excusé">Excusé</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Heure d'arrivée
            </label>
            <input
              v-model="attendanceForm.timeIn"
              type="time"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Heure de départ
            </label>
            <input
              v-model="attendanceForm.timeOut"
              type="time"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Raison
            </label>
            <input
              v-model="attendanceForm.reason"
              type="text"
              placeholder="Raison de l'absence"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Commentaires
            </label>
            <textarea
              v-model="attendanceForm.comments"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
        </div>
        <div class="mt-4 flex gap-2 justify-end">
          <button
            @click="cancelAttendanceForm"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
          >
            Annuler
          </button>
          <button
            @click="saveAttendance"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {{ editingAttendance ? 'Modifier' : 'Enregistrer' }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Attendance Table -->
      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Élève
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Classe
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Horaires
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Raison
              </th>
              <th v-if="canManageAttendance" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="attendance in attendances" :key="attendance._id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ getStudentName(attendance) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ getClassName(attendance) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatDate(attendance.date) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusBadgeClass(attendance.status)" class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ attendance.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ attendance.timeIn || '-' }} - {{ attendance.timeOut || '-' }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">{{ attendance.reason || '-' }}</div>
              </td>
              <td v-if="canManageAttendance" class="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  @click="editAttendance(attendance)"
                  class="text-blue-600 hover:text-blue-800 mr-3"
                >
                  Modifier
                </button>
                <button
                  @click="deleteAttendanceItem(attendance._id)"
                  class="text-red-600 hover:text-red-800"
                >
                  Supprimer
                </button>
              </td>
            </tr>
            <tr v-if="attendances.length === 0">
              <td :colspan="canManageAttendance ? 7 : 6" class="px-6 py-4 text-center text-gray-500">
                Aucune présence enregistrée
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div class="text-sm text-gray-700">
            Page {{ pagination.page }} sur {{ pagination.pages }} ({{ pagination.total }} enregistrements au total)
          </div>
          <div class="flex gap-2">
            <button
              @click="previousPage"
              :disabled="pagination.page === 1"
              :class="[
                'px-3 py-1 rounded',
                pagination.page === 1
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700',
              ]"
            >
              Précédent
            </button>
            <button
              @click="nextPage"
              :disabled="pagination.page >= pagination.pages"
              :class="[
                'px-3 py-1 rounded',
                pagination.page >= pagination.pages
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700',
              ]"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { api } from '../services/api';
import type { Attendance } from '@/types';

const authStore = useAuthStore();

const attendances = ref<Attendance[]>([]);
const loading = ref(false);
const showAddAttendanceForm = ref(false);
const editingAttendance = ref<Attendance | null>(null);

const filters = ref({
  student: '',
  class: '',
  status: '',
  startDate: '',
});

const pagination = ref({
  page: 1,
  pages: 1,
  total: 0,
  limit: 10,
});

const attendanceForm = ref<{
  student: string;
  class: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  timeIn: string;
  timeOut: string;
  reason: string;
  comments: string;
}>({
  student: '',
  class: '',
  date: new Date().toISOString().split('T')[0] || '',
  status: 'present',
  timeIn: '',
  timeOut: '',
  reason: '',
  comments: '',
});

const canManageAttendance = computed(() => {
  return authStore.user?.role === 'admin' || authStore.user?.role === 'teacher';
});

const fetchAttendances = async () => {
  loading.value = true;
  const params: {
    page: number;
    limit: number;
    student?: string;
    class?: string;
    status?: string;
    startDate?: string;
  } = {
    page: pagination.value.page,
    limit: pagination.value.limit,
  };

  if (filters.value.student) params.student = filters.value.student;
  if (filters.value.class) params.class = filters.value.class;
  if (filters.value.status) params.status = filters.value.status;
  if (filters.value.startDate) params.startDate = filters.value.startDate;

  const response = await api.getAttendances(params);
  if (response.data) {
    attendances.value = response.data.attendances;
    pagination.value = response.data.pagination;
  }
  loading.value = false;
};

const getStudentName = (attendance: Attendance) => {
  if (typeof attendance.student !== 'string' && attendance.student?.userId) {
    const userId = attendance.student.userId;
    if (typeof userId !== 'string') {
      return `${userId.firstName} ${userId.lastName}`;
    }
  }
  return 'N/A';
};

const getClassName = (attendance: Attendance) => {
  if (typeof attendance.class !== 'string' && attendance.class) {
    return `${attendance.class.name} - ${attendance.class.level}`;
  }
  return 'N/A';
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'Présent':
      return 'bg-green-100 text-green-800';
    case 'Absent':
      return 'bg-red-100 text-red-800';
    case 'Retard':
      return 'bg-yellow-100 text-yellow-800';
    case 'Excusé':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR');
};

const saveAttendance = async () => {
  if (!attendanceForm.value.student || !attendanceForm.value.class) {
    alert('Veuillez remplir tous les champs obligatoires');
    return;
  }

  if (editingAttendance.value) {
    await api.updateAttendance(editingAttendance.value._id, attendanceForm.value);
  } else {
    await api.createAttendance(attendanceForm.value);
  }

  cancelAttendanceForm();
  fetchAttendances();
};

const editAttendance = (attendance: Attendance) => {
  editingAttendance.value = attendance;
  attendanceForm.value = {
    student: typeof attendance.student !== 'string' ? attendance.student._id : attendance.student,
    class: typeof attendance.class !== 'string' ? attendance.class._id : attendance.class,
    date: new Date(attendance.date).toISOString().split('T')[0] || '',
    status: attendance.status,
    timeIn: attendance.timeIn || '',
    timeOut: attendance.timeOut || '',
    reason: attendance.reason || '',
    comments: attendance.comments || '',
  };
  showAddAttendanceForm.value = true;
};

const cancelAttendanceForm = () => {
  showAddAttendanceForm.value = false;
  editingAttendance.value = null;
  attendanceForm.value = {
    student: '',
    class: '',
    date: new Date().toISOString().split('T')[0] || '',
    status: 'present',
    timeIn: '',
    timeOut: '',
    reason: '',
    comments: '',
  };
};

const deleteAttendanceItem = async (id: string) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement ?')) {
    await api.deleteAttendance(id);
    fetchAttendances();
  }
};

const previousPage = () => {
  if (pagination.value.page > 1) {
    pagination.value.page--;
    fetchAttendances();
  }
};

const nextPage = () => {
  if (pagination.value.page < pagination.value.pages) {
    pagination.value.page++;
    fetchAttendances();
  }
};

onMounted(() => {
  fetchAttendances();
});
</script>
