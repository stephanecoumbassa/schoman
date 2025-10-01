import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { api } from '../services/api';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const user = ref<any>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value);
  const userRole = computed(() => user.value?.role || null);

  async function login(email: string, password: string) {
    loading.value = true;
    error.value = null;

    const response = await api.login(email, password);

    if (response.error) {
      error.value = response.error;
      loading.value = false;
      return false;
    }

    if (response.data) {
      token.value = response.data.token;
      user.value = response.data.user;
      localStorage.setItem('token', response.data.token);
    }

    loading.value = false;
    return true;
  }

  async function register(userData: any) {
    loading.value = true;
    error.value = null;

    const response = await api.register(userData);

    if (response.error) {
      error.value = response.error;
      loading.value = false;
      return false;
    }

    if (response.data) {
      token.value = response.data.token;
      user.value = response.data.user;
      localStorage.setItem('token', response.data.token);
    }

    loading.value = false;
    return true;
  }

  async function fetchProfile() {
    if (!token.value) return;

    const response = await api.getProfile();

    if (response.data) {
      user.value = response.data.user;
    } else if (response.error) {
      logout();
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
  }

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    userRole,
    login,
    register,
    fetchProfile,
    logout,
  };
});
