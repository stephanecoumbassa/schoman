import { defineStore } from 'pinia';
import api from '@/services/api';
import type { Student, StudentFormData, Pagination } from '@/types';

interface StudentState {
  students: Student[];
  currentStudent: Student | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
}

export const useStudentStore = defineStore('student', {
  state: (): StudentState => ({
    students: [],
    currentStudent: null,
    loading: false,
    error: null,
    pagination: null,
  }),

  getters: {
    activeStudents: (state) => state.students.filter(s => s.isActive),
    inactiveStudents: (state) => state.students.filter(s => !s.isActive),
    studentsByLevel: (state) => (level: string) => state.students.filter(s => s.level === level),
    totalStudents: (state) => state.students.length,
  },

  actions: {
    async fetchStudents(params?: {
      page?: number;
      limit?: number;
      search?: string;
      level?: string;
      isActive?: boolean;
    }) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.getStudents(params);
        if (response.data) {
          this.students = response.data.students;
          this.pagination = response.data.pagination;
        } else if (response.error) {
          this.error = response.error;
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch students';
        console.error('Error fetching students:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchStudentById(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.getStudent(id);
        if (response.data) {
          this.currentStudent = response.data.student;
        } else if (response.error) {
          this.error = response.error;
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch student';
        console.error('Error fetching student:', error);
      } finally {
        this.loading = false;
      }
    },

    async createStudent(data: StudentFormData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.createStudent(data);
        if (response.data) {
          this.students.push(response.data.student);
          return response.data.student;
        } else if (response.error) {
          this.error = response.error;
          throw new Error(response.error);
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to create student';
        console.error('Error creating student:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateStudent(id: string, data: Partial<StudentFormData>) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.updateStudent(id, data);
        if (response.data) {
          const index = this.students.findIndex(s => s._id === id);
          if (index !== -1) {
            this.students[index] = response.data.student;
          }
          if (this.currentStudent?._id === id) {
            this.currentStudent = response.data.student;
          }
          return response.data.student;
        } else if (response.error) {
          this.error = response.error;
          throw new Error(response.error);
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to update student';
        console.error('Error updating student:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteStudent(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.deleteStudent(id);
        if (response.error) {
          this.error = response.error;
          throw new Error(response.error);
        }
        // Remove from local state
        this.students = this.students.filter(s => s._id !== id);
        if (this.currentStudent?._id === id) {
          this.currentStudent = null;
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to delete student';
        console.error('Error deleting student:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearError() {
      this.error = null;
    },

    clearCurrentStudent() {
      this.currentStudent = null;
    },
  },
});
