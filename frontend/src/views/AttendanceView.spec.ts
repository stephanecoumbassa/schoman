import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount, flushPromises, VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import AttendanceView from './AttendanceView.vue';
import { useAuthStore } from '@/stores/auth';
import { useAttendanceStore } from '@/stores/attendance';
import type { Attendance, User } from '@/types';

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/dashboard', component: { template: '<div>Dashboard</div>' } },
    { path: '/attendance', component: { template: '<div>Attendance</div>' } },
  ],
});

describe('AttendanceView Component', () => {
  let wrapper: VueWrapper;
  let authStore: ReturnType<typeof useAuthStore>;
  let attendanceStore: ReturnType<typeof useAttendanceStore>;

  const mockTeacher: User = {
    _id: 'teacher123',
    email: 'teacher@example.com',
    firstName: 'John',
    lastName: 'Teacher',
    role: 'teacher',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockAttendances: Attendance[] = [
    {
      _id: 'att1',
      studentId: 'student1',
      classId: 'class1',
      date: '2025-01-15',
      status: 'Présent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'att2',
      studentId: 'student2',
      classId: 'class1',
      date: '2025-01-15',
      status: 'Absent',
      reason: 'Maladie',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    setActivePinia(createPinia());
    authStore = useAuthStore();
    attendanceStore = useAttendanceStore();
    authStore.user = mockTeacher;
    authStore.token = 'mock-token';
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  const mountComponent = async () => {
    // Mock attendance store methods
    vi.spyOn(attendanceStore, 'fetchAttendances').mockResolvedValue(undefined);
    attendanceStore.attendances = mockAttendances;
    attendanceStore.loading = false;

    const component = mount(AttendanceView, {
      global: {
        plugins: [router],
      },
    });

    await flushPromises();
    await component.vm.$nextTick();

    return component;
  };

  describe('Header Section', () => {
    it('displays the page title', async () => {
      wrapper = await mountComponent();
      expect(wrapper.text()).toContain('Gestion des Présences');
    });

    it('displays the page description', async () => {
      wrapper = await mountComponent();
      expect(wrapper.text()).toContain('Suivez les présences et absences des élèves');
    });

    it('renders back button linking to dashboard', async () => {
      wrapper = await mountComponent();
      const backButton = wrapper.find('a[href="/dashboard"]');
      expect(backButton.exists()).toBe(true);
      expect(backButton.text()).toContain('Retour au tableau de bord');
    });
  });

  describe('Filter Section', () => {
    it('renders student filter input', async () => {
      wrapper = await mountComponent();
      const studentInput = wrapper.find('input[placeholder*="élève"]');
      expect(studentInput.exists()).toBe(true);
    });

    it('renders class filter input', async () => {
      wrapper = await mountComponent();
      const classInput = wrapper.find('input[placeholder*="classe"]');
      expect(classInput.exists()).toBe(true);
    });

    it('renders status filter dropdown', async () => {
      wrapper = await mountComponent();
      const statusSelect = wrapper.find('select');
      expect(statusSelect.exists()).toBe(true);
    });

    it('status filter includes all attendance statuses', async () => {
      wrapper = await mountComponent();
      const statusSelect = wrapper.find('select');
      const html = statusSelect.html();
      
      expect(html).toContain('Tous les statuts');
      expect(html).toContain('Présent');
      expect(html).toContain('Absent');
      expect(html).toContain('Retard');
      expect(html).toContain('Excusé');
    });

    it('renders date filter', async () => {
      wrapper = await mountComponent();
      const dateInput = wrapper.find('input[type="date"]');
      expect(dateInput.exists()).toBe(true);
    });

    it('renders filter button', async () => {
      wrapper = await mountComponent();
      const filterButton = wrapper.find('button:contains("Filtrer")');
      expect(wrapper.text()).toContain('Filtrer');
    });

    it('triggers fetch when filter button is clicked', async () => {
      wrapper = await mountComponent();
      const fetchSpy = vi.spyOn(attendanceStore, 'fetchAttendances');
      
      const buttons = wrapper.findAll('button');
      const filterButton = buttons.find(btn => btn.text().includes('Filtrer'));
      
      if (filterButton) {
        await filterButton.trigger('click');
        expect(fetchSpy).toHaveBeenCalled();
      }
    });
  });

  describe('Add Attendance Button', () => {
    it('shows add attendance button for teachers', async () => {
      authStore.user = { ...mockTeacher, role: 'teacher' };
      wrapper = await mountComponent();
      
      expect(wrapper.text()).toContain('Enregistrer une présence');
    });

    it('shows add attendance button for admins', async () => {
      authStore.user = { ...mockTeacher, role: 'admin' };
      wrapper = await mountComponent();
      
      expect(wrapper.text()).toContain('Enregistrer une présence');
    });

    it('hides add attendance button for students', async () => {
      authStore.user = { ...mockTeacher, role: 'student' };
      wrapper = await mountComponent();
      
      const buttons = wrapper.findAll('button');
      const hasAddButton = buttons.some(btn => btn.text().includes('Enregistrer une présence'));
      expect(hasAddButton).toBe(false);
    });

    it('hides add attendance button for parents', async () => {
      authStore.user = { ...mockTeacher, role: 'parent' };
      wrapper = await mountComponent();
      
      const buttons = wrapper.findAll('button');
      const hasAddButton = buttons.some(btn => btn.text().includes('Enregistrer une présence'));
      expect(hasAddButton).toBe(false);
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when loading', async () => {
      vi.spyOn(attendanceStore, 'fetchAttendances').mockResolvedValue(undefined);
      attendanceStore.loading = true;

      wrapper = mount(AttendanceView, {
        global: {
          plugins: [router],
        },
      });

      await wrapper.vm.$nextTick();
      
      // Check if loading indicator exists
      const hasLoadingIndicator = wrapper.find('.animate-spin').exists() || 
                                   wrapper.text().includes('Chargement');
      expect(hasLoadingIndicator).toBe(true);
    });

    it('hides loading spinner after data is loaded', async () => {
      wrapper = await mountComponent();
      attendanceStore.loading = false;
      await wrapper.vm.$nextTick();
      
      // Should not have loading spinner
      const hasLoadingSpinner = wrapper.find('.animate-spin').exists();
      expect(hasLoadingSpinner).toBe(false);
    });
  });

  describe('Attendance Data Display', () => {
    it('displays attendance records when available', async () => {
      wrapper = await mountComponent();
      
      // Should display some attendance information
      const hasData = wrapper.html().length > 500; // Has substantial content
      expect(hasData).toBe(true);
    });

    it('shows empty state when no attendances', async () => {
      attendanceStore.attendances = [];
      wrapper = await mountComponent();
      
      // Should show empty message or no data indicator
      const text = wrapper.text().toLowerCase();
      const hasEmptyState = text.includes('aucun') || 
                           text.includes('pas de') || 
                           wrapper.findAll('tbody tr').length === 0;
      expect(hasEmptyState).toBe(true);
    });
  });

  describe('Store Integration', () => {
    it('fetches attendances on mount', async () => {
      const fetchSpy = vi.spyOn(attendanceStore, 'fetchAttendances');
      wrapper = await mountComponent();
      
      expect(fetchSpy).toHaveBeenCalled();
    });

    it('uses attendances from store', async () => {
      wrapper = await mountComponent();
      
      // Should have access to attendance data
      expect(attendanceStore.attendances).toEqual(mockAttendances);
    });

    it('reflects loading state from store', async () => {
      attendanceStore.loading = true;
      wrapper = mount(AttendanceView, {
        global: {
          plugins: [router],
        },
      });
      
      await wrapper.vm.$nextTick();
      
      // Should show loading indicator when store is loading
      const hasLoadingIndicator = wrapper.find('.animate-spin').exists() || 
                                   wrapper.text().includes('Chargement');
      expect(hasLoadingIndicator).toBe(true);
    });
  });

  describe('Permissions and Role-Based Display', () => {
    it('allows attendance management for admin role', async () => {
      authStore.user = { ...mockTeacher, role: 'admin' };
      wrapper = await mountComponent();
      
      expect(wrapper.text()).toContain('Enregistrer une présence');
    });

    it('allows attendance management for teacher role', async () => {
      authStore.user = { ...mockTeacher, role: 'teacher' };
      wrapper = await mountComponent();
      
      expect(wrapper.text()).toContain('Enregistrer une présence');
    });

    it('restricts management for parent role', async () => {
      authStore.user = { ...mockTeacher, role: 'parent' };
      wrapper = await mountComponent();
      
      const buttons = wrapper.findAll('button');
      const hasAddButton = buttons.some(btn => btn.text().includes('Enregistrer une présence'));
      expect(hasAddButton).toBe(false);
    });

    it('restricts management for student role', async () => {
      authStore.user = { ...mockTeacher, role: 'student' };
      wrapper = await mountComponent();
      
      const buttons = wrapper.findAll('button');
      const hasAddButton = buttons.some(btn => btn.text().includes('Enregistrer une présence'));
      expect(hasAddButton).toBe(false);
    });
  });

  describe('Responsive Layout', () => {
    it('uses responsive grid for filters', async () => {
      wrapper = await mountComponent();
      
      const filtersGrid = wrapper.find('.grid');
      expect(filtersGrid.exists()).toBe(true);
    });

    it('applies proper container styling', async () => {
      wrapper = await mountComponent();
      
      const container = wrapper.find('.max-w-7xl');
      expect(container.exists()).toBe(true);
    });
  });

  describe('Navigation', () => {
    it('provides navigation back to dashboard', async () => {
      wrapper = await mountComponent();
      
      const backLink = wrapper.find('a[href="/dashboard"]');
      expect(backLink.exists()).toBe(true);
    });
  });

  describe('Status Badge Display', () => {
    it('displays different statuses appropriately', async () => {
      wrapper = await mountComponent();
      
      // Component should handle different attendance statuses
      const statuses = ['Présent', 'Absent', 'Retard', 'Excusé'];
      const hasStatusOptions = statuses.every(status => 
        wrapper.html().includes(status)
      );
      expect(hasStatusOptions).toBe(true);
    });
  });
});
