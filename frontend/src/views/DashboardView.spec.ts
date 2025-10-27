import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount, flushPromises, VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from './DashboardView.vue';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/services/api';
import type { DashboardStats, User } from '@/types';

// Mock components
vi.mock('@/components/ThemeToggle.vue', () => ({
  default: { template: '<div class="theme-toggle-mock"></div>' }
}));

vi.mock('@/components/GlobalSearch.vue', () => ({
  default: { template: '<div class="global-search-mock"></div>' }
}));

// Mock API
vi.mock('@/services/api', () => ({
  api: {
    getDashboardStats: vi.fn(),
  },
}));

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/dashboard', component: { template: '<div>Dashboard</div>' } },
    { path: '/students', component: { template: '<div>Students</div>' } },
  ],
});

describe('DashboardView Component', () => {
  let wrapper: VueWrapper;
  let authStore: ReturnType<typeof useAuthStore>;

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

  const mockStats: DashboardStats = {
    totalStudents: 150,
    totalTeachers: 25,
    totalClasses: 12,
    totalParents: 100,
    recentStudents: [
      {
        _id: 'student1',
        userId: {
          _id: 'user1',
          email: 'student1@test.com',
          firstName: 'Alice',
          lastName: 'Smith',
          role: 'student',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        level: '6ème',
        enrollmentDate: '2025-01-15',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'student2',
        userId: {
          _id: 'user2',
          email: 'student2@test.com',
          firstName: 'Bob',
          lastName: 'Johnson',
          role: 'student',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        level: '5ème',
        enrollmentDate: '2025-01-20',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    authStore = useAuthStore();
    authStore.user = mockUser;
    authStore.token = 'mock-token';
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  const mountComponent = async (mockApiResponse?: any) => {
    if (mockApiResponse !== undefined) {
      vi.mocked(api.getDashboardStats).mockResolvedValue(mockApiResponse);
    }
    
    const component = mount(DashboardView, {
      global: {
        plugins: [router],
        stubs: {
          ThemeToggle: { template: '<div class="theme-toggle-mock"></div>' },
          GlobalSearch: { template: '<div class="global-search-mock"></div>' },
        },
      },
    });
    
    await flushPromises();
    await component.vm.$nextTick();
    
    return component;
  };

  describe('Loading State', () => {
    it('shows loading spinner while fetching data', async () => {
      let resolvePromise: any;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(api.getDashboardStats).mockReturnValue(promise as any);

      wrapper = mount(DashboardView, {
        global: {
          plugins: [router],
          stubs: {
            ThemeToggle: { template: '<div class="theme-toggle-mock"></div>' },
            GlobalSearch: { template: '<div class="global-search-mock"></div>' },
          },
        },
      });

      await wrapper.vm.$nextTick();

      // Should show loading spinner
      expect(wrapper.find('.animate-spin').exists()).toBe(true);

      // Resolve promise
      resolvePromise({ data: mockStats });
      await flushPromises();
      await wrapper.vm.$nextTick();

      // Should hide loading spinner
      expect(wrapper.find('.animate-spin').exists()).toBe(false);
    });

    it('hides loading state after data is fetched', async () => {
      wrapper = await mountComponent({ data: mockStats });
      
      expect(wrapper.find('.animate-spin').exists()).toBe(false);
    });
  });

  describe('Header', () => {
    it('displays welcome message with user name', async () => {
      wrapper = await mountComponent({ data: mockStats });
      
      expect(wrapper.text()).toContain('Bienvenue');
      expect(wrapper.text()).toContain('John');
      expect(wrapper.text()).toContain('Doe');
    });

    it('displays dashboard title', async () => {
      wrapper = await mountComponent({ data: mockStats });
      
      expect(wrapper.text()).toContain('Tableau de bord');
    });

    it('renders logout button', async () => {
      wrapper = await mountComponent({ data: mockStats });
      
      const logoutButton = wrapper.find('button:contains("Déconnexion")');
      expect(wrapper.text()).toContain('Déconnexion');
    });

    it('calls authStore.logout when logout button clicked', async () => {
      wrapper = await mountComponent({ data: mockStats });
      
      const logoutSpy = vi.spyOn(authStore, 'logout');
      
      const buttons = wrapper.findAll('button');
      const logoutButton = buttons.find(btn => btn.text().includes('Déconnexion'));
      
      if (logoutButton) {
        await logoutButton.trigger('click');
        expect(logoutSpy).toHaveBeenCalled();
      }
    });
  });

  describe('Statistics Display', () => {
    it('displays total students stat', async () => {
      wrapper = await mountComponent({ data: mockStats });
      
      expect(wrapper.text()).toContain('Total Élèves');
      expect(wrapper.text()).toContain('150');
    });

    it('displays total teachers stat', async () => {
      wrapper = await mountComponent({ data: mockStats });
      
      expect(wrapper.text()).toContain('Enseignants');
      expect(wrapper.text()).toContain('25');
    });

    it('displays total classes stat', async () => {
      wrapper = await mountComponent({ data: mockStats });
      
      expect(wrapper.text()).toContain('Classes');
      expect(wrapper.text()).toContain('12');
    });

    it('displays total parents stat', async () => {
      wrapper = await mountComponent({ data: mockStats });
      
      expect(wrapper.text()).toContain('Parents');
      expect(wrapper.text()).toContain('100');
    });

    it('renders all four stat cards', async () => {
      wrapper = await mountComponent({ data: mockStats });
      
      const statCards = wrapper.findAll('.bg-white, .dark\\:bg-gray-800');
      expect(statCards.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Recent Students Table', () => {
    it('displays recent students section when data exists', async () => {
      wrapper = await mountComponent({ data: mockStats });
      
      expect(wrapper.text()).toContain('Élèves récemment ajoutés');
    });

    it('displays student names correctly', async () => {
      wrapper = await mountComponent({ data: mockStats });
      
      expect(wrapper.text()).toContain('Alice');
      expect(wrapper.text()).toContain('Smith');
      expect(wrapper.text()).toContain('Bob');
      expect(wrapper.text()).toContain('Johnson');
    });

    it('displays student emails', async () => {
      wrapper = await mountComponent({ data: mockStats });
      
      expect(wrapper.text()).toContain('student1@test.com');
      expect(wrapper.text()).toContain('student2@test.com');
    });

    it('displays student levels', async () => {
      wrapper = await mountComponent({ data: mockStats });
      
      expect(wrapper.text()).toContain('6ème');
      expect(wrapper.text()).toContain('5ème');
    });

    it('formats enrollment dates correctly', async () => {
      wrapper = await mountComponent({ data: mockStats });
      
      // Check that dates are formatted (French format)
      const html = wrapper.html();
      expect(html).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('does not display recent students section when no data', async () => {
      const statsWithoutStudents = { ...mockStats, recentStudents: [] };
      wrapper = await mountComponent({ data: statsWithoutStudents });
      
      expect(wrapper.text()).not.toContain('Élèves récemment ajoutés');
    });

    it('renders correct number of student rows', async () => {
      wrapper = await mountComponent({ data: mockStats });
      
      const tableRows = wrapper.findAll('tbody tr');
      expect(tableRows.length).toBe(2);
    });
  });

  describe('API Integration', () => {
    it('calls getDashboardStats on mount', async () => {
      wrapper = await mountComponent({ data: mockStats });
      
      expect(api.getDashboardStats).toHaveBeenCalled();
    });

    it('handles API error gracefully', async () => {
      wrapper = await mountComponent({ error: 'Failed to fetch' });
      
      // Should not crash and should hide loading
      expect(wrapper.find('.animate-spin').exists()).toBe(false);
    });

    it('handles empty stats data', async () => {
      wrapper = await mountComponent({ data: null });
      
      // Should not show stats or recent students
      expect(wrapper.text()).not.toContain('Total Élèves');
      expect(wrapper.text()).not.toContain('Élèves récemment ajoutés');
    });
  });

  describe('Quick Actions Links', () => {
    it('renders quick action links', async () => {
      wrapper = await mountComponent({ data: mockStats });
      
      const links = wrapper.findAll('a[href*="/students"]');
      expect(links.length).toBeGreaterThan(0);
    });

    it('quick action links are router-links', async () => {
      wrapper = await mountComponent({ data: mockStats });
      
      const routerLinks = wrapper.findAllComponents({ name: 'RouterLink' });
      expect(routerLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Layout', () => {
    it('uses responsive grid for stats', async () => {
      wrapper = await mountComponent({ data: mockStats });
      
      const html = wrapper.html();
      expect(html).toMatch(/grid-cols-1|md:grid-cols-2|lg:grid-cols-4/);
    });

    it('applies proper container styling', async () => {
      wrapper = await mountComponent({ data: mockStats });
      
      const container = wrapper.find('.max-w-7xl');
      expect(container.exists()).toBe(true);
    });
  });

  describe('Dark Mode Support', () => {
    it('includes dark mode classes', async () => {
      wrapper = await mountComponent({ data: mockStats });
      
      const html = wrapper.html();
      expect(html).toContain('dark:bg-gray-900');
      expect(html).toContain('dark:text-white');
    });
  });
});
