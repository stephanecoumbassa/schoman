import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuth } from './useAuth';
import { useAuthStore } from '@/stores/auth';

// Mock vue-router
const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock the API
vi.mock('@/services/api', () => ({
  api: {
    login: vi.fn(),
    register: vi.fn(),
    getProfile: vi.fn(),
  },
}));

describe('useAuth Composable', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    localStorage.clear();
  });

  const mockUser = {
    _id: 'user1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'admin' as const,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  describe('Computed Properties', () => {
    it('should return authentication status', () => {
      const { isAuthenticated } = useAuth();
      const authStore = useAuthStore();
      
      expect(isAuthenticated.value).toBe(false);
      
      authStore.token = 'test-token';
      expect(isAuthenticated.value).toBe(true);
    });

    it('should return user data', () => {
      const { user } = useAuth();
      const authStore = useAuthStore();
      
      expect(user.value).toBeNull();
      
      authStore.user = mockUser;
      expect(user.value).toEqual(mockUser);
    });

    it('should return user role', () => {
      const { userRole } = useAuth();
      const authStore = useAuthStore();
      
      expect(userRole.value).toBeNull();
      
      authStore.user = mockUser;
      expect(userRole.value).toBe('admin');
    });

    it('should check if user is admin', () => {
      const { isAdmin } = useAuth();
      const authStore = useAuthStore();
      
      authStore.user = mockUser;
      expect(isAdmin.value).toBe(true);
      
      authStore.user = { ...mockUser, role: 'teacher' };
      expect(isAdmin.value).toBe(false);
    });

    it('should check if user is teacher', () => {
      const { isTeacher } = useAuth();
      const authStore = useAuthStore();
      
      authStore.user = { ...mockUser, role: 'teacher' };
      expect(isTeacher.value).toBe(true);
      
      authStore.user = mockUser;
      expect(isTeacher.value).toBe(false);
    });

    it('should check if user is student', () => {
      const { isStudent } = useAuth();
      const authStore = useAuthStore();
      
      authStore.user = { ...mockUser, role: 'student' };
      expect(isStudent.value).toBe(true);
      
      authStore.user = mockUser;
      expect(isStudent.value).toBe(false);
    });

    it('should check if user is parent', () => {
      const { isParent } = useAuth();
      const authStore = useAuthStore();
      
      authStore.user = { ...mockUser, role: 'parent' };
      expect(isParent.value).toBe(true);
      
      authStore.user = mockUser;
      expect(isParent.value).toBe(false);
    });
  });

  describe('hasRole Method', () => {
    it('should check single role', () => {
      const { hasRole } = useAuth();
      const authStore = useAuthStore();
      
      authStore.user = mockUser;
      expect(hasRole('admin')).toBe(true);
      expect(hasRole('teacher')).toBe(false);
    });

    it('should check multiple roles', () => {
      const { hasRole } = useAuth();
      const authStore = useAuthStore();
      
      authStore.user = mockUser;
      expect(hasRole(['admin', 'teacher'])).toBe(true);
      expect(hasRole(['student', 'parent'])).toBe(false);
    });

    it('should return false when no user', () => {
      const { hasRole } = useAuth();
      expect(hasRole('admin')).toBe(false);
    });
  });

  describe('Login Method', () => {
    it('should login and redirect on success', async () => {
      const { login } = useAuth();
      const authStore = useAuthStore();
      
      // Mock successful login
      vi.spyOn(authStore, 'login').mockResolvedValue(true);
      
      const success = await login('test@example.com', 'password');
      
      expect(success).toBe(true);
      expect(authStore.login).toHaveBeenCalledWith('test@example.com', 'password');
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });

    it('should not redirect on login failure', async () => {
      const { login } = useAuth();
      const authStore = useAuthStore();
      
      // Mock failed login
      vi.spyOn(authStore, 'login').mockResolvedValue(false);
      
      const success = await login('test@example.com', 'wrong-password');
      
      expect(success).toBe(false);
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Register Method', () => {
    it('should register and redirect on success', async () => {
      const { register } = useAuth();
      const authStore = useAuthStore();
      
      const userData = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'student' as const,
      };
      
      // Mock successful registration
      vi.spyOn(authStore, 'register').mockResolvedValue(true);
      
      const success = await register(userData);
      
      expect(success).toBe(true);
      expect(authStore.register).toHaveBeenCalledWith(userData);
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });

    it('should not redirect on registration failure', async () => {
      const { register } = useAuth();
      const authStore = useAuthStore();
      
      // Mock failed registration
      vi.spyOn(authStore, 'register').mockResolvedValue(false);
      
      const success = await register({});
      
      expect(success).toBe(false);
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Logout Method', () => {
    it('should logout and redirect to login', () => {
      const { logout } = useAuth();
      const authStore = useAuthStore();
      
      const logoutSpy = vi.spyOn(authStore, 'logout');
      
      logout();
      
      expect(logoutSpy).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  describe('Fetch Profile Method', () => {
    it('should fetch user profile', async () => {
      const { fetchProfile } = useAuth();
      const authStore = useAuthStore();
      
      const fetchProfileSpy = vi.spyOn(authStore, 'fetchProfile').mockResolvedValue();
      
      await fetchProfile();
      
      expect(fetchProfileSpy).toHaveBeenCalled();
    });
  });

  describe('Require Auth Method', () => {
    it('should return true when authenticated', () => {
      const { requireAuth } = useAuth();
      const authStore = useAuthStore();
      
      authStore.token = 'test-token';
      
      expect(requireAuth()).toBe(true);
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should redirect to login when not authenticated', () => {
      const { requireAuth } = useAuth();
      
      expect(requireAuth()).toBe(false);
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  describe('Require Role Method', () => {
    it('should return true when user has required role', () => {
      const { requireRole } = useAuth();
      const authStore = useAuthStore();
      
      authStore.token = 'test-token';
      authStore.user = mockUser;
      
      expect(requireRole('admin')).toBe(true);
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should redirect to unauthorized when user lacks role', () => {
      const { requireRole } = useAuth();
      const authStore = useAuthStore();
      
      authStore.token = 'test-token';
      authStore.user = mockUser;
      
      expect(requireRole('teacher')).toBe(false);
      expect(mockPush).toHaveBeenCalledWith('/unauthorized');
    });

    it('should redirect to login when not authenticated', () => {
      const { requireRole } = useAuth();
      
      expect(requireRole('admin')).toBe(false);
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('should work with multiple roles', () => {
      const { requireRole } = useAuth();
      const authStore = useAuthStore();
      
      authStore.token = 'test-token';
      authStore.user = mockUser;
      
      expect(requireRole(['admin', 'teacher'])).toBe(true);
      expect(requireRole(['student', 'parent'])).toBe(false);
    });
  });
});
