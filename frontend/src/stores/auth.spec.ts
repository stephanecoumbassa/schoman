import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from './auth';
import { api } from '../services/api';
import type { User } from '@/types';

// Mock the API module
vi.mock('../services/api', () => ({
  api: {
    login: vi.fn(),
    register: vi.fn(),
    getProfile: vi.fn(),
  },
}));

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  const mockUser: User = {
    _id: 'user123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'teacher',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockToken = 'mock-jwt-token-123';

  describe('Initialization', () => {
    it('initializes with null user and token when localStorage is empty', () => {
      const store = useAuthStore();
      expect(store.user).toBeNull();
      expect(store.token).toBeNull();
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
      expect(store.isAuthenticated).toBe(false);
      expect(store.userRole).toBeNull();
    });

    it('initializes with token from localStorage if present', () => {
      localStorage.setItem('token', mockToken);
      const store = useAuthStore();
      expect(store.token).toBe(mockToken);
      expect(store.isAuthenticated).toBe(true);
    });
  });

  describe('Computed Properties', () => {
    it('isAuthenticated returns true when token exists', () => {
      const store = useAuthStore();
      store.token = mockToken;
      expect(store.isAuthenticated).toBe(true);
    });

    it('isAuthenticated returns false when token is null', () => {
      const store = useAuthStore();
      store.token = null;
      expect(store.isAuthenticated).toBe(false);
    });

    it('userRole returns user role when user exists', () => {
      const store = useAuthStore();
      store.user = mockUser;
      expect(store.userRole).toBe('teacher');
    });

    it('userRole returns null when user is null', () => {
      const store = useAuthStore();
      store.user = null;
      expect(store.userRole).toBeNull();
    });
  });

  describe('Login', () => {
    it('successfully logs in and stores token and user', async () => {
      const store = useAuthStore();
      vi.mocked(api.login).mockResolvedValue({
        data: { token: mockToken, user: mockUser },
        error: null,
      });

      const result = await store.login('test@example.com', 'password123');

      expect(result).toBe(true);
      expect(store.token).toBe(mockToken);
      expect(store.user).toEqual(mockUser);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
      expect(localStorage.getItem('token')).toBe(mockToken);
      expect(api.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('handles login error correctly', async () => {
      const store = useAuthStore();
      const errorMessage = 'Invalid credentials';
      vi.mocked(api.login).mockResolvedValue({
        data: null,
        error: errorMessage,
      });

      const result = await store.login('test@example.com', 'wrongpassword');

      expect(result).toBe(false);
      expect(store.token).toBeNull();
      expect(store.user).toBeNull();
      expect(store.loading).toBe(false);
      expect(store.error).toBe(errorMessage);
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('sets loading state during login', async () => {
      const store = useAuthStore();
      let loadingDuringCall = false;

      vi.mocked(api.login).mockImplementation(async () => {
        loadingDuringCall = store.loading;
        return {
          data: { token: mockToken, user: mockUser },
          error: null,
        };
      });

      await store.login('test@example.com', 'password123');

      expect(loadingDuringCall).toBe(true);
      expect(store.loading).toBe(false);
    });
  });

  describe('Register', () => {
    it('successfully registers and stores token and user', async () => {
      const store = useAuthStore();
      const userData = {
        email: 'newuser@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        password: 'password123',
        role: 'student' as const,
      };

      vi.mocked(api.register).mockResolvedValue({
        data: { token: mockToken, user: mockUser },
        error: null,
      });

      const result = await store.register(userData);

      expect(result).toBe(true);
      expect(store.token).toBe(mockToken);
      expect(store.user).toEqual(mockUser);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
      expect(localStorage.getItem('token')).toBe(mockToken);
      expect(api.register).toHaveBeenCalledWith(userData);
    });

    it('handles registration error correctly', async () => {
      const store = useAuthStore();
      const errorMessage = 'Email already exists';
      const userData = {
        email: 'existing@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        password: 'password123',
        role: 'student' as const,
      };

      vi.mocked(api.register).mockResolvedValue({
        data: null,
        error: errorMessage,
      });

      const result = await store.register(userData);

      expect(result).toBe(false);
      expect(store.token).toBeNull();
      expect(store.user).toBeNull();
      expect(store.loading).toBe(false);
      expect(store.error).toBe(errorMessage);
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('sets loading state during registration', async () => {
      const store = useAuthStore();
      let loadingDuringCall = false;

      vi.mocked(api.register).mockImplementation(async () => {
        loadingDuringCall = store.loading;
        return {
          data: { token: mockToken, user: mockUser },
          error: null,
        };
      });

      const userData = {
        email: 'newuser@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        password: 'password123',
        role: 'student' as const,
      };

      await store.register(userData);

      expect(loadingDuringCall).toBe(true);
      expect(store.loading).toBe(false);
    });
  });

  describe('Fetch Profile', () => {
    it('fetches and sets user profile when token exists', async () => {
      const store = useAuthStore();
      store.token = mockToken;

      vi.mocked(api.getProfile).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      await store.fetchProfile();

      expect(store.user).toEqual(mockUser);
      expect(api.getProfile).toHaveBeenCalled();
    });

    it('does not fetch profile when token is null', async () => {
      const store = useAuthStore();
      store.token = null;

      await store.fetchProfile();

      expect(api.getProfile).not.toHaveBeenCalled();
      expect(store.user).toBeNull();
    });

    it('logs out user on profile fetch error', async () => {
      const store = useAuthStore();
      store.token = mockToken;
      store.user = mockUser;
      localStorage.setItem('token', mockToken);

      vi.mocked(api.getProfile).mockResolvedValue({
        data: null,
        error: 'Unauthorized',
      });

      await store.fetchProfile();

      expect(store.token).toBeNull();
      expect(store.user).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('Logout', () => {
    it('clears token, user, and localStorage', () => {
      const store = useAuthStore();
      store.token = mockToken;
      store.user = mockUser;
      localStorage.setItem('token', mockToken);

      store.logout();

      expect(store.token).toBeNull();
      expect(store.user).toBeNull();
      expect(store.isAuthenticated).toBe(false);
      expect(store.userRole).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('logout works even when already logged out', () => {
      const store = useAuthStore();
      store.token = null;
      store.user = null;

      expect(() => store.logout()).not.toThrow();
      expect(store.token).toBeNull();
      expect(store.user).toBeNull();
    });
  });
});
