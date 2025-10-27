import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount, flushPromises, VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import StudentsView from './StudentsView.vue';
import { useAuthStore } from '@/stores/auth';
import { useStudentStore } from '@/stores/student';
import type { Student, User } from '@/types';

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/dashboard', component: { template: '<div>Dashboard</div>' } },
    { path: '/students', component: { template: '<div>Students</div>' } },
  ],
});

describe('StudentsView Component', () => {
  let wrapper: VueWrapper;
  let authStore: ReturnType<typeof useAuthStore>;
  let studentStore: ReturnType<typeof useStudentStore>;

  const mockUser: User = {
    _id: 'user123',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockStudents: Student[] = [
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
      studentNumber: 'STU001',
      level: 'CP',
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
      studentNumber: 'STU002',
      level: 'CE1',
      enrollmentDate: '2025-01-20',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    setActivePinia(createPinia());
    authStore = useAuthStore();
    studentStore = useStudentStore();
    authStore.user = mockUser;
    authStore.token = 'mock-token';
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  const mountComponent = async () => {
    // Mock student store methods
    vi.spyOn(studentStore, 'fetchStudents').mockResolvedValue(undefined);
    studentStore.students = mockStudents;
    studentStore.loading = false;

    const component = mount(StudentsView, {
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
      expect(wrapper.text()).toContain('Gestion des élèves');
    });

    it('displays the page description', async () => {
      wrapper = await mountComponent();
      expect(wrapper.text()).toContain('Liste complète des élèves inscrits');
    });

    it('renders back button linking to dashboard', async () => {
      wrapper = await mountComponent();
      const backButton = wrapper.find('a[href="/dashboard"]');
      expect(backButton.exists()).toBe(true);
      expect(backButton.text()).toContain('Retour');
    });

    it('shows add student button for admin users', async () => {
      wrapper = await mountComponent();
      const addButton = wrapper.find('button:contains("Ajouter un élève")');
      expect(wrapper.text()).toContain('Ajouter un élève');
    });

    it('hides add student button for non-admin users', async () => {
      authStore.user = { ...mockUser, role: 'student' };
      wrapper = await mountComponent();
      const buttons = wrapper.findAll('button');
      const hasAddButton = buttons.some(btn => btn.text().includes('Ajouter un élève'));
      expect(hasAddButton).toBe(false);
    });
  });

  describe('Search and Filters', () => {
    it('renders search input', async () => {
      wrapper = await mountComponent();
      const searchInput = wrapper.find('input[placeholder*="Nom"]');
      expect(searchInput.exists()).toBe(true);
    });

    it('renders level filter dropdown', async () => {
      wrapper = await mountComponent();
      const levelSelect = wrapper.findAll('select').find(s => 
        s.html().includes('Tous les niveaux')
      );
      expect(levelSelect).toBeDefined();
    });

    it('level filter includes all grade options', async () => {
      wrapper = await mountComponent();
      const levelSelect = wrapper.findAll('select')[0];
      const html = levelSelect.html();
      expect(html).toContain('Maternelle');
      expect(html).toContain('CP');
      expect(html).toContain('CE1');
      expect(html).toContain('CE2');
      expect(html).toContain('CM1');
      expect(html).toContain('CM2');
    });

    it('renders status filter dropdown', async () => {
      wrapper = await mountComponent();
      const statusSelect = wrapper.findAll('select').find(s => 
        s.html().includes('Actifs')
      );
      expect(statusSelect).toBeDefined();
    });

    it('status filter includes correct options', async () => {
      wrapper = await mountComponent();
      const selects = wrapper.findAll('select');
      const statusSelect = selects[selects.length - 1];
      const html = statusSelect.html();
      expect(html).toContain('Tous');
      expect(html).toContain('Actifs');
      expect(html).toContain('Inactifs');
    });

    it('triggers search on filter change', async () => {
      wrapper = await mountComponent();
      const fetchSpy = vi.spyOn(studentStore, 'fetchStudents');
      
      const levelSelect = wrapper.findAll('select')[0];
      await levelSelect.setValue('CP');
      
      expect(fetchSpy).toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when loading', async () => {
      vi.spyOn(studentStore, 'fetchStudents').mockResolvedValue(undefined);
      studentStore.loading = true;

      wrapper = mount(StudentsView, {
        global: {
          plugins: [router],
        },
      });

      await wrapper.vm.$nextTick();
      expect(wrapper.find('.animate-spin').exists()).toBe(true);
    });

    it('hides loading spinner after data is loaded', async () => {
      wrapper = await mountComponent();
      expect(wrapper.find('.animate-spin').exists()).toBe(false);
    });

    it('shows students table when not loading', async () => {
      wrapper = await mountComponent();
      const table = wrapper.find('table');
      expect(table.exists()).toBe(true);
    });
  });

  describe('Students Table', () => {
    it('displays table headers', async () => {
      wrapper = await mountComponent();
      const headers = wrapper.findAll('th');
      const headerTexts = headers.map(h => h.text());
      
      expect(headerTexts).toContain('N° Élève');
      expect(headerTexts).toContain('Nom complet');
      expect(headerTexts).toContain('Email');
      expect(headerTexts).toContain('Niveau');
      expect(headerTexts).toContain('Statut');
    });

    it('displays student data correctly', async () => {
      wrapper = await mountComponent();
      
      expect(wrapper.text()).toContain('STU001');
      expect(wrapper.text()).toContain('Alice');
      expect(wrapper.text()).toContain('Smith');
      expect(wrapper.text()).toContain('student1@test.com');
      expect(wrapper.text()).toContain('CP');
    });

    it('displays all students from store', async () => {
      wrapper = await mountComponent();
      
      const tableRows = wrapper.findAll('tbody tr');
      expect(tableRows.length).toBe(mockStudents.length);
    });

    it('shows empty state when no students', async () => {
      studentStore.students = [];
      wrapper = await mountComponent();
      
      expect(wrapper.text()).toContain('Aucun élève trouvé');
    });

    it('displays student status badges', async () => {
      wrapper = await mountComponent();
      
      // Check for status indicators
      const html = wrapper.html();
      expect(html).toContain('Actif');
    });

    it('renders student rows with correct student numbers', async () => {
      wrapper = await mountComponent();
      
      expect(wrapper.text()).toContain('STU001');
      expect(wrapper.text()).toContain('STU002');
    });

    it('displays student levels correctly', async () => {
      wrapper = await mountComponent();
      
      expect(wrapper.text()).toContain('CP');
      expect(wrapper.text()).toContain('CE1');
    });
  });

  describe('Store Integration', () => {
    it('fetches students on mount', async () => {
      const fetchSpy = vi.spyOn(studentStore, 'fetchStudents');
      wrapper = await mountComponent();
      
      expect(fetchSpy).toHaveBeenCalled();
    });

    it('uses students from store', async () => {
      wrapper = await mountComponent();
      
      expect(wrapper.text()).toContain('Alice Smith');
      expect(wrapper.text()).toContain('Bob Johnson');
    });

    it('reflects loading state from store', async () => {
      studentStore.loading = true;
      wrapper = mount(StudentsView, {
        global: {
          plugins: [router],
        },
      });
      
      await wrapper.vm.$nextTick();
      expect(wrapper.find('.animate-spin').exists()).toBe(true);
    });
  });

  describe('Permissions and Role-Based Display', () => {
    it('shows management buttons for admin role', async () => {
      authStore.user = { ...mockUser, role: 'admin' };
      wrapper = await mountComponent();
      
      expect(wrapper.text()).toContain('Ajouter un élève');
    });

    it('shows management buttons for teacher role', async () => {
      authStore.user = { ...mockUser, role: 'teacher' };
      wrapper = await mountComponent();
      
      expect(wrapper.text()).toContain('Ajouter un élève');
    });

    it('hides add button for parent role', async () => {
      authStore.user = { ...mockUser, role: 'parent' };
      wrapper = await mountComponent();
      
      const buttons = wrapper.findAll('button');
      const hasAddButton = buttons.some(btn => btn.text().includes('Ajouter un élève'));
      expect(hasAddButton).toBe(false);
    });
  });

  describe('Responsive Layout', () => {
    it('uses responsive grid for filters', async () => {
      wrapper = await mountComponent();
      
      const filtersGrid = wrapper.find('.grid');
      expect(filtersGrid.exists()).toBe(true);
      expect(filtersGrid.html()).toContain('md:grid-cols-3');
    });

    it('applies proper container styling', async () => {
      wrapper = await mountComponent();
      
      const container = wrapper.find('.max-w-7xl');
      expect(container.exists()).toBe(true);
    });

    it('has overflow handling for table', async () => {
      wrapper = await mountComponent();
      
      const overflow = wrapper.find('.overflow-x-auto');
      expect(overflow.exists()).toBe(true);
    });
  });

  describe('Navigation', () => {
    it('provides navigation back to dashboard', async () => {
      wrapper = await mountComponent();
      
      const backLink = wrapper.find('a[href="/dashboard"]');
      expect(backLink.exists()).toBe(true);
    });
  });
});
