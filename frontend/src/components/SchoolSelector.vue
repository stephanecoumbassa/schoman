<template>
  <div class="school-selector" v-if="hasMultipleSchools">
    <label class="selector-label">École :</label>
    <select 
      v-model="selectedSchoolId" 
      @change="handleSchoolChange"
      class="selector-dropdown"
    >
      <option value="" disabled>Sélectionner une école</option>
      <option 
        v-for="school in activeSchools" 
        :key="school._id" 
        :value="school._id"
      >
        {{ school.name }} ({{ school.code }})
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useSchoolStore } from '@/stores/school';
import { storeToRefs } from 'pinia';

const schoolStore = useSchoolStore();
const { activeSchools, selectedSchool, hasMultipleSchools } = storeToRefs(schoolStore);

const selectedSchoolId = ref(schoolStore.selectedSchoolId || '');

onMounted(async () => {
  await schoolStore.fetchSchools({ isActive: true });
  if (schoolStore.selectedSchoolId) {
    selectedSchoolId.value = schoolStore.selectedSchoolId;
  }
});

// Watch for changes in the store's selected school
watch(() => schoolStore.selectedSchoolId, (newValue) => {
  if (newValue) {
    selectedSchoolId.value = newValue;
  }
});

const handleSchoolChange = () => {
  if (selectedSchoolId.value) {
    schoolStore.selectSchool(selectedSchoolId.value);
    // Emit event for parent components to react
    window.dispatchEvent(new CustomEvent('school-changed', { 
      detail: { schoolId: selectedSchoolId.value } 
    }));
  }
};
</script>

<style scoped>
.school-selector {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.selector-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.selector-dropdown {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 200px;
}

.selector-dropdown:hover {
  border-color: #9ca3af;
}

.selector-dropdown:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.selector-dropdown option {
  padding: 0.5rem;
}
</style>
