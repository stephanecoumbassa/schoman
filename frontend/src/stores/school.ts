import { defineStore } from 'pinia';
import schoolService, { type School, type SchoolStats } from '@/services/schoolService';

interface SchoolState {
  schools: School[];
  currentSchool: School | null;
  selectedSchoolId: string | null;
  loading: boolean;
  error: string | null;
}

export const useSchoolStore = defineStore('school', {
  state: (): SchoolState => ({
    schools: [],
    currentSchool: null,
    selectedSchoolId: localStorage.getItem('selectedSchoolId') || null,
    loading: false,
    error: null,
  }),

  getters: {
    activeSchools: (state) => state.schools.filter(s => s.isActive),
    
    selectedSchool: (state) => {
      if (!state.selectedSchoolId) return null;
      return state.schools.find(s => s._id === state.selectedSchoolId) || null;
    },

    hasMultipleSchools: (state) => state.schools.length > 1,
  },

  actions: {
    async fetchSchools(params?: { isActive?: boolean; search?: string }) {
      this.loading = true;
      this.error = null;
      try {
        this.schools = await schoolService.getAll(params);
        
        // If no school is selected but we have schools, select the first one
        if (!this.selectedSchoolId && this.schools.length > 0) {
          this.selectSchool(this.schools[0]._id);
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch schools';
        console.error('Error fetching schools:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchSchoolById(id: string) {
      this.loading = true;
      this.error = null;
      try {
        this.currentSchool = await schoolService.getById(id);
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch school';
        console.error('Error fetching school:', error);
      } finally {
        this.loading = false;
      }
    },

    async createSchool(data: Partial<School>) {
      this.loading = true;
      this.error = null;
      try {
        const newSchool = await schoolService.create(data);
        this.schools.push(newSchool);
        return newSchool;
      } catch (error: any) {
        this.error = error.message || 'Failed to create school';
        console.error('Error creating school:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateSchool(id: string, data: Partial<School>) {
      this.loading = true;
      this.error = null;
      try {
        const updatedSchool = await schoolService.update(id, data);
        const index = this.schools.findIndex(s => s._id === id);
        if (index !== -1) {
          this.schools[index] = updatedSchool;
        }
        if (this.currentSchool?._id === id) {
          this.currentSchool = updatedSchool;
        }
        return updatedSchool;
      } catch (error: any) {
        this.error = error.message || 'Failed to update school';
        console.error('Error updating school:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteSchool(id: string) {
      this.loading = true;
      this.error = null;
      try {
        await schoolService.delete(id);
        // Remove from local state
        this.schools = this.schools.filter(s => s._id !== id);
        if (this.currentSchool?._id === id) {
          this.currentSchool = null;
        }
        if (this.selectedSchoolId === id) {
          this.selectedSchoolId = null;
          localStorage.removeItem('selectedSchoolId');
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to delete school';
        console.error('Error deleting school:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getSchoolStats(id: string): Promise<SchoolStats | null> {
      try {
        return await schoolService.getStats(id);
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch school statistics';
        console.error('Error fetching school stats:', error);
        return null;
      }
    },

    selectSchool(schoolId: string) {
      this.selectedSchoolId = schoolId;
      localStorage.setItem('selectedSchoolId', schoolId);
    },

    clearSelectedSchool() {
      this.selectedSchoolId = null;
      localStorage.removeItem('selectedSchoolId');
    },

    clearError() {
      this.error = null;
    },
  },
});
