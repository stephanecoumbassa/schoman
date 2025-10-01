import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));
  const isAuthenticated = computed(() => !!token.value);

  async function login(email: string, password: string) {
    const response = await api.post<{ token: string; user: User }>('/auth/login', {
      email,
      password,
    });

    if (response.error) {
      throw new Error(response.error);
    }

    if (response.data) {
      token.value = response.data.token;
      user.value = response.data.user;
      localStorage.setItem('token', response.data.token);
    }
  }

  async function register(userData: any) {
    const response = await api.post<{ token: string; user: User }>('/auth/register', userData);

    if (response.error) {
      throw new Error(response.error);
    }

    if (response.data) {
      token.value = response.data.token;
      user.value = response.data.user;
      localStorage.setItem('token', response.data.token);
    }
  }

  async function fetchProfile() {
    const response = await api.get<{ user: User }>('/auth/profile');

    if (response.error) {
      logout();
      throw new Error(response.error);
    }

    if (response.data) {
      user.value = response.data.user;
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
  }

  return { user, token, isAuthenticated, login, register, fetchProfile, logout };
});
