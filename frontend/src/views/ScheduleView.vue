<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Emploi du Temps</h1>
          <p class="mt-2 text-sm text-gray-600">
            Gérez les horaires des cours
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
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Classe</label>
            <select
              v-model="filters.class"
              @change="fetchSchedules"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Toutes les classes</option>
              <option v-for="cls in classes" :key="cls._id" :value="cls._id">
                {{ cls.name }} - {{ cls.level }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Jour de la semaine</label>
            <select
              v-model="filters.dayOfWeek"
              @change="fetchSchedules"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les jours</option>
              <option value="Lundi">Lundi</option>
              <option value="Mardi">Mardi</option>
              <option value="Mercredi">Mercredi</option>
              <option value="Jeudi">Jeudi</option>
              <option value="Vendredi">Vendredi</option>
              <option value="Samedi">Samedi</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Année scolaire</label>
            <select
              v-model="filters.academicYear"
              @change="fetchSchedules"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="2024-2025">2024-2025</option>
              <option value="2023-2024">2023-2024</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Schedule Display -->
      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <div v-if="groupedSchedules.length === 0" class="text-center py-12">
          <p class="text-gray-500">Aucun emploi du temps trouvé</p>
        </div>

        <!-- Grouped by Day -->
        <div v-else>
          <div v-for="dayGroup in groupedSchedules" :key="dayGroup.day" class="border-b border-gray-200 last:border-b-0">
            <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">{{ dayGroup.day }}</h3>
            </div>
            <div class="divide-y divide-gray-200">
              <div
                v-for="schedule in dayGroup.schedules"
                :key="schedule._id"
                class="px-6 py-4 hover:bg-gray-50 transition"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <div
                      v-if="schedule.subject && schedule.subject.color"
                      class="w-4 h-4 rounded-full"
                      :style="{ backgroundColor: schedule.subject.color }"
                    ></div>
                    <div>
                      <div class="flex items-center space-x-3">
                        <span class="text-sm font-semibold text-gray-900">
                          {{ schedule.startTime }} - {{ schedule.endTime }}
                        </span>
                        <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {{ schedule.subject ? schedule.subject.name : 'N/A' }}
                        </span>
                      </div>
                      <div class="mt-1 text-sm text-gray-600">
                        <span v-if="schedule.class">{{ schedule.class.name }}</span>
                        <span v-if="schedule.teacher" class="ml-3">
                          👨‍🏫 {{ schedule.teacher.firstName }} {{ schedule.teacher.lastName }}
                        </span>
                        <span v-if="schedule.room" class="ml-3">
                          📍 {{ schedule.room }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span
                      :class="[
                        'px-2 py-1 text-xs font-semibold rounded-full',
                        schedule.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      ]"
                    >
                      {{ schedule.isActive ? 'Actif' : 'Inactif' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '../services/api';

interface Subject {
  _id: string;
  name: string;
  code: string;
  color?: string;
}

interface Teacher {
  _id: string;
  firstName: string;
  lastName: string;
}

interface Class {
  _id: string;
  name: string;
  level: string;
}

interface Schedule {
  _id: string;
  class?: Class;
  subject?: Subject;
  teacher?: Teacher;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room?: string;
  academicYear: string;
  isRecurring: boolean;
  isActive: boolean;
}

const schedules = ref<Schedule[]>([]);
const classes = ref<Class[]>([]);
const loading = ref(false);
const filters = ref({
  class: '',
  dayOfWeek: '',
  academicYear: '2024-2025',
});

const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const groupedSchedules = computed(() => {
  const grouped = daysOfWeek.map(day => ({
    day,
    schedules: schedules.value
      .filter(s => s.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  })).filter(group => group.schedules.length > 0);

  return grouped;
});

const fetchClasses = async () => {
  try {
    const response = await api.request<{ classes: Class[] }>(
      '/classes?academicYear=2024-2025&limit=100'
    );
    if (response.data) {
      classes.value = response.data.classes;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des classes:', error);
  }
};

const fetchSchedules = async () => {
  loading.value = true;
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', '100');
    queryParams.append('academicYear', filters.value.academicYear);
    
    if (filters.value.class) queryParams.append('class', filters.value.class);
    if (filters.value.dayOfWeek) queryParams.append('dayOfWeek', filters.value.dayOfWeek);

    const response = await api.request<{ schedules: Schedule[] }>(
      `/schedules?${queryParams}`
    );
    
    if (response.data) {
      schedules.value = response.data.schedules;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des emplois du temps:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchClasses();
  fetchSchedules();
});
</script>
