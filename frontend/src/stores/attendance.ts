import { defineStore } from 'pinia';
import api from '@/services/api';
import type { Attendance, AttendanceFormData, AttendanceStats, Pagination } from '@/types';

interface AttendanceState {
  attendances: Attendance[];
  currentAttendance: Attendance | null;
  stats: AttendanceStats | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
}

export const useAttendanceStore = defineStore('attendance', {
  state: (): AttendanceState => ({
    attendances: [],
    currentAttendance: null,
    stats: null,
    loading: false,
    error: null,
    pagination: null,
  }),

  getters: {
    presentAttendances: (state) => state.attendances.filter(a => a.status === 'present'),
    absentAttendances: (state) => state.attendances.filter(a => a.status === 'absent'),
    lateAttendances: (state) => state.attendances.filter(a => a.status === 'late'),
    excusedAttendances: (state) => state.attendances.filter(a => a.status === 'excused'),
    totalAttendances: (state) => state.attendances.length,
    attendanceRate: (state) => {
      if (state.attendances.length === 0) return 0;
      const present = state.attendances.filter(a => a.status === 'present').length;
      return (present / state.attendances.length) * 100;
    },
  },

  actions: {
    async fetchAttendances(params?: {
      page?: number;
      limit?: number;
      student?: string;
      class?: string;
      date?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    }) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.getAttendances(params);
        if (response.data) {
          this.attendances = response.data.attendances;
          this.pagination = response.data.pagination;
        } else if (response.error) {
          this.error = response.error;
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch attendances';
        console.error('Error fetching attendances:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchAttendanceById(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.getAttendance(id);
        if (response.data) {
          this.currentAttendance = response.data.attendance;
        } else if (response.error) {
          this.error = response.error;
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch attendance';
        console.error('Error fetching attendance:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchStudentAttendanceStats(studentId: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.getStudentAttendanceStats(studentId);
        if (response.data) {
          this.stats = response.data as AttendanceStats;
        } else if (response.error) {
          this.error = response.error;
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch attendance stats';
        console.error('Error fetching attendance stats:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchClassAttendanceForDate(classId: string, date: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.getClassAttendanceForDate(classId, date);
        if (response.data) {
          this.attendances = response.data.attendances;
        } else if (response.error) {
          this.error = response.error;
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch class attendance';
        console.error('Error fetching class attendance:', error);
      } finally {
        this.loading = false;
      }
    },

    async createAttendance(data: AttendanceFormData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.createAttendance(data);
        if (response.data) {
          this.attendances.push(response.data.attendance);
          return response.data.attendance;
        } else if (response.error) {
          this.error = response.error;
          throw new Error(response.error);
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to create attendance';
        console.error('Error creating attendance:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateAttendance(id: string, data: Partial<AttendanceFormData>) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.updateAttendance(id, data);
        if (response.data) {
          const index = this.attendances.findIndex(a => a._id === id);
          if (index !== -1) {
            this.attendances[index] = response.data.attendance;
          }
          if (this.currentAttendance?._id === id) {
            this.currentAttendance = response.data.attendance;
          }
          return response.data.attendance;
        } else if (response.error) {
          this.error = response.error;
          throw new Error(response.error);
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to update attendance';
        console.error('Error updating attendance:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteAttendance(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.deleteAttendance(id);
        if (response.error) {
          this.error = response.error;
          throw new Error(response.error);
        }
        // Remove from local state
        this.attendances = this.attendances.filter(a => a._id !== id);
        if (this.currentAttendance?._id === id) {
          this.currentAttendance = null;
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to delete attendance';
        console.error('Error deleting attendance:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearError() {
      this.error = null;
    },

    clearCurrentAttendance() {
      this.currentAttendance = null;
    },

    clearStats() {
      this.stats = null;
    },
  },
});
