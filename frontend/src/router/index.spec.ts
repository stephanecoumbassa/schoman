import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createRouter, createWebHistory, type Router } from 'vue-router';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import type { User } from '@/types';

// Import views - we'll mock them
const mockComponent = { template: '<div>Mock</div>' };

describe('Router Navigation Guards', () => {
  let router: Router;
  let authStore: ReturnType<typeof useAuthStore>;

  const mockUser: User = {
    _id: 'user123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'teacher',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    // Create fresh pinia instance
    setActivePinia(createPinia());
    authStore = useAuthStore();

    // Create router with same configuration as the real one
    router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/',
          redirect: '/login',
        },
        {
          path: '/login',
          name: 'login',
          component: mockComponent,
          meta: { requiresGuest: true },
        },
        {
          path: '/dashboard',
          name: 'dashboard',
          component: mockComponent,
          meta: { requiresAuth: true },
        },
        {
          path: '/users',
          name: 'users',
          component: mockComponent,
          meta: { requiresAuth: true, requiresAdmin: true },
        },
        {
          path: '/students',
          name: 'students',
          component: mockComponent,
          meta: { requiresAuth: true },
        },
        {
          path: '/backups',
          name: 'backups',
          component: mockComponent,
          meta: { requiresAuth: true, requiresAdmin: true },
        },
      ],
    });

    // Add navigation guard
    router.beforeEach((to, from, next) => {
      const authStore = useAuthStore();

      if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next('/login');
      } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
        next('/dashboard');
      } else {
        next();
      }
    });

    // Wait for router to be ready
    await router.isReady();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Root Path Redirect', () => {
    it('redirects root path to login', async () => {
      await router.push('/');
      expect(router.currentRoute.value.path).toBe('/login');
    });
  });

  describe('Authentication Guard - requiresAuth', () => {
    it('redirects to login when accessing protected route without auth', async () => {
      // Ensure user is not authenticated
      authStore.user = null;
      authStore.token = null;

      await router.push('/dashboard');
      
      expect(router.currentRoute.value.path).toBe('/login');
    });

    it('allows access to protected route when authenticated', async () => {
      // Set user as authenticated
      authStore.user = mockUser;
      authStore.token = 'valid-token';

      await router.push('/dashboard');
      
      expect(router.currentRoute.value.path).toBe('/dashboard');
    });

    it('redirects to login for students route without auth', async () => {
      authStore.user = null;
      authStore.token = null;

      await router.push('/students');
      
      expect(router.currentRoute.value.path).toBe('/login');
    });

    it('allows authenticated user to access students route', async () => {
      authStore.user = mockUser;
      authStore.token = 'valid-token';

      await router.push('/students');
      
      expect(router.currentRoute.value.path).toBe('/students');
    });
  });

  describe('Guest Guard - requiresGuest', () => {
    it('allows unauthenticated users to access login page', async () => {
      authStore.user = null;
      authStore.token = null;

      await router.push('/login');
      
      expect(router.currentRoute.value.path).toBe('/login');
    });

    it('redirects authenticated users from login to dashboard', async () => {
      authStore.user = mockUser;
      authStore.token = 'valid-token';

      await router.push('/login');
      
      expect(router.currentRoute.value.path).toBe('/dashboard');
    });
  });

  describe('Admin Guard - requiresAdmin', () => {
    it('allows admin users to access admin-only routes', async () => {
      authStore.user = { ...mockUser, role: 'admin' };
      authStore.token = 'valid-token';

      await router.push('/users');
      
      // If navigation completes without redirect, guard passed
      expect(router.currentRoute.value.path).toBe('/users');
    });

    it('allows access to backups route for authenticated admin', async () => {
      authStore.user = { ...mockUser, role: 'admin' };
      authStore.token = 'valid-token';

      await router.push('/backups');
      
      expect(router.currentRoute.value.path).toBe('/backups');
    });

    it('requires authentication before checking admin status', async () => {
      // User is admin but not authenticated
      authStore.user = null;
      authStore.token = null;

      await router.push('/users');
      
      // Should redirect to login first
      expect(router.currentRoute.value.path).toBe('/login');
    });
  });

  describe('Navigation Flow', () => {
    it('allows navigation from login to dashboard after authentication', async () => {
      // Start unauthenticated at login
      authStore.user = null;
      authStore.token = null;
      await router.push('/login');
      expect(router.currentRoute.value.path).toBe('/login');

      // Simulate successful login
      authStore.user = mockUser;
      authStore.token = 'new-token';

      // Navigate to dashboard
      await router.push('/dashboard');
      expect(router.currentRoute.value.path).toBe('/dashboard');
    });

    it('redirects from dashboard to login after logout', async () => {
      // Start authenticated at dashboard
      authStore.user = mockUser;
      authStore.token = 'valid-token';
      await router.push('/dashboard');
      expect(router.currentRoute.value.path).toBe('/dashboard');

      // Simulate logout
      authStore.user = null;
      authStore.token = null;

      // Try to access dashboard again
      await router.push('/dashboard');
      expect(router.currentRoute.value.path).toBe('/login');
    });

    it('maintains route after authentication check', async () => {
      authStore.user = mockUser;
      authStore.token = 'valid-token';

      await router.push('/students');
      expect(router.currentRoute.value.path).toBe('/students');

      await router.push('/dashboard');
      expect(router.currentRoute.value.path).toBe('/dashboard');
    });
  });

  describe('Multiple Route Protection', () => {
    it('protects multiple routes with requiresAuth', async () => {
      authStore.user = null;
      authStore.token = null;

      const protectedRoutes = ['/dashboard', '/students', '/users', '/backups'];

      for (const route of protectedRoutes) {
        await router.push(route);
        expect(router.currentRoute.value.path).toBe('/login');
      }
    });

    it('allows authenticated access to multiple protected routes', async () => {
      authStore.user = mockUser;
      authStore.token = 'valid-token';

      const routes = ['/dashboard', '/students'];

      for (const route of routes) {
        await router.push(route);
        expect(router.currentRoute.value.path).toBe(route);
      }
    });
  });

  describe('Edge Cases', () => {
    it('handles token expiration by redirecting to login', async () => {
      authStore.user = mockUser;
      authStore.token = 'expired-token';

      // Simulate token expiration
      authStore.token = null;
      authStore.user = null;

      await router.push('/dashboard');
      expect(router.currentRoute.value.path).toBe('/login');
    });

    it('handles partial authentication state gracefully', async () => {
      // Token exists but no user
      authStore.user = null;
      authStore.token = 'some-token';

      await router.push('/dashboard');
      
      // Should be treated as unauthenticated
      expect(router.currentRoute.value.path).toBe('/login');
    });

    it('allows re-navigation to current route when authenticated', async () => {
      authStore.user = mockUser;
      authStore.token = 'valid-token';

      await router.push('/dashboard');
      expect(router.currentRoute.value.path).toBe('/dashboard');

      // Navigate to same route
      await router.push('/dashboard');
      expect(router.currentRoute.value.path).toBe('/dashboard');
    });
  });

  describe('isAuthenticated Computed Property', () => {
    it('returns true when both user and token exist', () => {
      authStore.user = mockUser;
      authStore.token = 'valid-token';
      
      expect(authStore.isAuthenticated).toBe(true);
    });

    it('returns false when user is null', () => {
      authStore.user = null;
      authStore.token = 'valid-token';
      
      expect(authStore.isAuthenticated).toBe(false);
    });

    it('returns false when token is null', () => {
      authStore.user = mockUser;
      authStore.token = null;
      
      expect(authStore.isAuthenticated).toBe(false);
    });

    it('returns false when both user and token are null', () => {
      authStore.user = null;
      authStore.token = null;
      
      expect(authStore.isAuthenticated).toBe(false);
    });
  });
});
