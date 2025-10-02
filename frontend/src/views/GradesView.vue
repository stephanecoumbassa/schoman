<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestion des Notes</h1>
          <p class="mt-2 text-sm text-gray-600">
            Gérez les notes et consultez les bulletins
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
              Matière
            </label>
            <input
              v-model="filters.subject"
              type="text"
              placeholder="Filtrer par matière"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Semestre
            </label>
            <select
              v-model="filters.semester"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les semestres</option>
              <option value="1">Semestre 1</option>
              <option value="2">Semestre 2</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Année scolaire
            </label>
            <input
              v-model="filters.academicYear"
              type="text"
              placeholder="Ex: 2024-2025"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div class="mt-4 flex justify-end">
          <button
            @click="fetchGrades"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Filtrer
          </button>
        </div>
      </div>

      <!-- Add Grade Button (for teachers and admins) -->
      <div v-if="canManageGrades" class="mb-6">
        <button
          @click="showAddGradeForm = true"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          + Ajouter une note
        </button>
      </div>

      <!-- Add/Edit Grade Form -->
      <div v-if="showAddGradeForm" class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">
          {{ editingGrade ? 'Modifier la note' : 'Ajouter une note' }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              ID Élève *
            </label>
            <input
              v-model="gradeForm.student"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Matière *
            </label>
            <input
              v-model="gradeForm.subject"
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
              v-model="gradeForm.class"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Type d'évaluation *
            </label>
            <select
              v-model="gradeForm.evaluationType"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Contrôle">Contrôle</option>
              <option value="Devoir">Devoir</option>
              <option value="Examen">Examen</option>
              <option value="Oral">Oral</option>
              <option value="Projet">Projet</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Note *
            </label>
            <input
              v-model.number="gradeForm.grade"
              type="number"
              step="0.1"
              min="0"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Note maximale
            </label>
            <input
              v-model.number="gradeForm.maxGrade"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Coefficient
            </label>
            <input
              v-model.number="gradeForm.coefficient"
              type="number"
              step="0.1"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              v-model="gradeForm.date"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Année scolaire *
            </label>
            <input
              v-model="gradeForm.academicYear"
              type="text"
              placeholder="Ex: 2024-2025"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Semestre *
            </label>
            <select
              v-model="gradeForm.semester"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">Semestre 1</option>
              <option value="2">Semestre 2</option>
            </select>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Commentaires
            </label>
            <textarea
              v-model="gradeForm.comments"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
        </div>
        <div class="mt-4 flex gap-2 justify-end">
          <button
            @click="cancelGradeForm"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
          >
            Annuler
          </button>
          <button
            @click="saveGrade"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {{ editingGrade ? 'Modifier' : 'Créer' }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Grades Table -->
      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Élève
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Matière
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Note
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coefficient
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th v-if="canManageGrades" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="grade in grades" :key="grade._id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ getStudentName(grade) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ grade.subject }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ grade.evaluationType }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-semibold" :class="getGradeColor(grade)">
                  {{ grade.grade }}/{{ grade.maxGrade }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ grade.coefficient }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatDate(grade.date) }}</div>
              </td>
              <td v-if="canManageGrades" class="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  @click="editGrade(grade)"
                  class="text-blue-600 hover:text-blue-800 mr-3"
                >
                  Modifier
                </button>
                <button
                  @click="deleteGradeItem(grade._id)"
                  class="text-red-600 hover:text-red-800"
                >
                  Supprimer
                </button>
              </td>
            </tr>
            <tr v-if="grades.length === 0">
              <td :colspan="canManageGrades ? 7 : 6" class="px-6 py-4 text-center text-gray-500">
                Aucune note trouvée
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div class="text-sm text-gray-700">
            Page {{ pagination.page }} sur {{ pagination.pages }} ({{ pagination.total }} notes au total)
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

const authStore = useAuthStore();

const grades = ref<any[]>([]);
const loading = ref(false);
const showAddGradeForm = ref(false);
const editingGrade = ref<any>(null);

const filters = ref({
  student: '',
  subject: '',
  semester: '',
  academicYear: '',
});

const pagination = ref({
  page: 1,
  pages: 1,
  total: 0,
  limit: 10,
});

const gradeForm = ref({
  student: '',
  subject: '',
  class: '',
  evaluationType: 'Contrôle',
  grade: 0,
  maxGrade: 20,
  coefficient: 1,
  date: new Date().toISOString().split('T')[0],
  academicYear: '2024-2025',
  semester: '1',
  comments: '',
});

const canManageGrades = computed(() => {
  return authStore.user?.role === 'admin' || authStore.user?.role === 'teacher';
});

const fetchGrades = async () => {
  loading.value = true;
  const params: any = {
    page: pagination.value.page,
    limit: pagination.value.limit,
  };

  if (filters.value.student) params.student = filters.value.student;
  if (filters.value.subject) params.subject = filters.value.subject;
  if (filters.value.semester) params.semester = filters.value.semester;
  if (filters.value.academicYear) params.academicYear = filters.value.academicYear;

  const response = await api.getGrades(params);
  if (response.data) {
    grades.value = response.data.grades;
    pagination.value = response.data.pagination;
  }
  loading.value = false;
};

const getStudentName = (grade: any) => {
  if (grade.student?.userId) {
    return `${grade.student.userId.firstName} ${grade.student.userId.lastName}`;
  }
  return 'N/A';
};

const getGradeColor = (grade: any) => {
  const percentage = (grade.grade / grade.maxGrade) * 100;
  if (percentage >= 80) return 'text-green-600';
  if (percentage >= 60) return 'text-blue-600';
  if (percentage >= 40) return 'text-yellow-600';
  return 'text-red-600';
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR');
};

const saveGrade = async () => {
  if (!gradeForm.value.student || !gradeForm.value.subject || !gradeForm.value.class) {
    alert('Veuillez remplir tous les champs obligatoires');
    return;
  }

  if (editingGrade.value) {
    await api.updateGrade(editingGrade.value._id, gradeForm.value);
  } else {
    await api.createGrade(gradeForm.value);
  }

  cancelGradeForm();
  fetchGrades();
};

const editGrade = (grade: any) => {
  editingGrade.value = grade;
  gradeForm.value = {
    student: grade.student._id,
    subject: grade.subject,
    class: grade.class._id,
    evaluationType: grade.evaluationType,
    grade: grade.grade,
    maxGrade: grade.maxGrade,
    coefficient: grade.coefficient,
    date: new Date(grade.date).toISOString().split('T')[0],
    academicYear: grade.academicYear,
    semester: grade.semester.toString(),
    comments: grade.comments || '',
  };
  showAddGradeForm.value = true;
};

const cancelGradeForm = () => {
  showAddGradeForm.value = false;
  editingGrade.value = null;
  gradeForm.value = {
    student: '',
    subject: '',
    class: '',
    evaluationType: 'Contrôle',
    grade: 0,
    maxGrade: 20,
    coefficient: 1,
    date: new Date().toISOString().split('T')[0],
    academicYear: '2024-2025',
    semester: '1',
    comments: '',
  };
};

const deleteGradeItem = async (id: string) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
    await api.deleteGrade(id);
    fetchGrades();
  }
};

const previousPage = () => {
  if (pagination.value.page > 1) {
    pagination.value.page--;
    fetchGrades();
  }
};

const nextPage = () => {
  if (pagination.value.page < pagination.value.pages) {
    pagination.value.page++;
    fetchGrades();
  }
};

onMounted(() => {
  fetchGrades();
});
</script>
