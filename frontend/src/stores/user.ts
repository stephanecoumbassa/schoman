import { defineStore } from 'pinia';
import api from '@/services/api';
import type { User, Pagination } from '@/types';

interface UserState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    users: [],
    currentUser: null,
    loading: false,
    error: null,
    pagination: null,
  }),

  getters: {
    activeUsers: (state) => state.users.filter(u => u.isActive),
    inactiveUsers: (state) => state.users.filter(u => !u.isActive),
    usersByRole: (state) => (role: string) => state.users.filter(u => u.role === role),
    totalUsers: (state) => state.users.length,
  },

  actions: {
    async fetchUsers(params?: {
      page?: number;
      limit?: number;
      search?: string;
      role?: string;
      isActive?: boolean;
    }) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.getUsers(params);
        if (response.data) {
          this.users = response.data.users;
          this.pagination = response.data.pagination;
        } else if (response.error) {
          this.error = response.error;
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch users';
        console.error('Error fetching users:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchUserById(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.getUser(id);
        if (response.data) {
          this.currentUser = response.data.user;
        } else if (response.error) {
          this.error = response.error;
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch user';
        console.error('Error fetching user:', error);
      } finally {
        this.loading = false;
      }
    },

    async createUser(data: Partial<User> & { password: string }) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.createUser(data);
        if (response.data) {
          this.users.push(response.data.user);
          return response.data.user;
        } else if (response.error) {
          this.error = response.error;
          throw new Error(response.error);
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to create user';
        console.error('Error creating user:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateUser(id: string, data: Partial<User>) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.updateUser(id, data);
        if (response.data) {
          const index = this.users.findIndex(u => u._id === id);
          if (index !== -1) {
            this.users[index] = response.data.user;
          }
          if (this.currentUser?._id === id) {
            this.currentUser = response.data.user;
          }
          return response.data.user;
        } else if (response.error) {
          this.error = response.error;
          throw new Error(response.error);
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to update user';
        console.error('Error updating user:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateUserPassword(id: string, password: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.updateUserPassword(id, password);
        if (response.error) {
          this.error = response.error;
          throw new Error(response.error);
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to update password';
        console.error('Error updating password:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteUser(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.deleteUser(id);
        if (response.error) {
          this.error = response.error;
          throw new Error(response.error);
        }
        // Remove from local state
        this.users = this.users.filter(u => u._id !== id);
        if (this.currentUser?._id === id) {
          this.currentUser = null;
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to delete user';
        console.error('Error deleting user:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearError() {
      this.error = null;
    },

    clearCurrentUser() {
      this.currentUser = null;
    },
  },
});
