import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

/**
 * Composable for authentication management
 * Provides convenient access to auth state and methods
 */
export function useAuth() {
  const authStore = useAuthStore();
  const router = useRouter();

  // Computed properties
  const isAuthenticated = computed(() => authStore.isAuthenticated);
  const user = computed(() => authStore.user);
  const userRole = computed(() => authStore.userRole);
  const loading = computed(() => authStore.loading);
  const error = computed(() => authStore.error);

  // Check if user has specific role
  const hasRole = (role: string | string[]) => {
    if (!authStore.user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(authStore.user.role);
    }
    return authStore.user.role === role;
  };

  // Check if user is admin
  const isAdmin = computed(() => hasRole('admin'));

  // Check if user is teacher
  const isTeacher = computed(() => hasRole('teacher'));

  // Check if user is student
  const isStudent = computed(() => hasRole('student'));

  // Check if user is parent
  const isParent = computed(() => hasRole('parent'));

  // Login method
  const login = async (email: string, password: string) => {
    const success = await authStore.login(email, password);
    if (success) {
      // Redirect to dashboard after successful login
      router.push('/dashboard');
    }
    return success;
  };

  // Register method
  const register = async (userData: any) => {
    const success = await authStore.register(userData);
    if (success) {
      // Redirect to dashboard after successful registration
      router.push('/dashboard');
    }
    return success;
  };

  // Logout method
  const logout = () => {
    authStore.logout();
    router.push('/login');
  };

  // Fetch user profile
  const fetchProfile = async () => {
    await authStore.fetchProfile();
  };

  // Require authentication
  const requireAuth = () => {
    if (!isAuthenticated.value) {
      router.push('/login');
      return false;
    }
    return true;
  };

  // Require specific role
  const requireRole = (role: string | string[]) => {
    if (!requireAuth()) return false;
    
    if (!hasRole(role)) {
      router.push('/unauthorized');
      return false;
    }
    return true;
  };

  return {
    // State
    isAuthenticated,
    user,
    userRole,
    loading,
    error,
    
    // Computed
    isAdmin,
    isTeacher,
    isStudent,
    isParent,
    
    // Methods
    login,
    register,
    logout,
    fetchProfile,
    hasRole,
    requireAuth,
    requireRole,
  };
}
