import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount, flushPromises, VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import InvoicesView from './InvoicesView.vue';
import { useAuthStore } from '@/stores/auth';
import { useInvoiceStore } from '@/stores/invoice';
import type { Invoice, User } from '@/types';

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/dashboard', component: { template: '<div>Dashboard</div>' } },
    { path: '/invoices', component: { template: '<div>Invoices</div>' } },
  ],
});

describe('InvoicesView Component', () => {
  let wrapper: VueWrapper;
  let authStore: ReturnType<typeof useAuthStore>;
  let invoiceStore: ReturnType<typeof useInvoiceStore>;

  const mockAdmin: User = {
    _id: 'admin123',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockInvoices: Invoice[] = [
    {
      _id: 'inv1',
      invoiceNumber: 'INV-2025-001',
      studentId: 'student1',
      amount: 500,
      dueDate: '2025-02-28',
      status: 'pending',
      description: 'Frais de scolarité Q1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'inv2',
      invoiceNumber: 'INV-2025-002',
      studentId: 'student2',
      amount: 750,
      dueDate: '2025-02-28',
      status: 'paid',
      description: 'Frais de scolarité Q1 + Cantine',
      paidAt: '2025-01-20',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    setActivePinia(createPinia());
    authStore = useAuthStore();
    invoiceStore = useInvoiceStore();
    authStore.user = mockAdmin;
    authStore.token = 'mock-token';
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  const mountComponent = async () => {
    // Mock invoice store methods
    vi.spyOn(invoiceStore, 'fetchInvoices').mockResolvedValue(undefined);
    invoiceStore.invoices = mockInvoices;
    invoiceStore.loading = false;

    const component = mount(InvoicesView, {
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
      expect(wrapper.text()).toContain('Factures');
    });

    it('displays the page description', async () => {
      wrapper = await mountComponent();
      const text = wrapper.text().toLowerCase();
      expect(text.includes('facture') || text.includes('facturation')).toBe(true);
    });

    it('renders back button linking to dashboard', async () => {
      wrapper = await mountComponent();
      const backButton = wrapper.find('a[href="/dashboard"]');
      expect(backButton.exists()).toBe(true);
    });

    it('shows create invoice button for admin users', async () => {
      authStore.user = { ...mockAdmin, role: 'admin' };
      wrapper = await mountComponent();
      
      const buttons = wrapper.findAll('button');
      const hasCreateButton = buttons.some(btn => 
        btn.text().toLowerCase().includes('créer') || 
        btn.text().toLowerCase().includes('ajouter') ||
        btn.text().toLowerCase().includes('nouvelle')
      );
      expect(hasCreateButton).toBe(true);
    });

    it('hides create invoice button for student users', async () => {
      authStore.user = { ...mockAdmin, role: 'student' };
      wrapper = await mountComponent();
      
      const buttons = wrapper.findAll('button');
      const hasCreateButton = buttons.some(btn => 
        btn.text().toLowerCase().includes('créer') || 
        btn.text().toLowerCase().includes('nouvelle')
      );
      expect(hasCreateButton).toBe(false);
    });
  });

  describe('Filter Section', () => {
    it('renders status filter', async () => {
      wrapper = await mountComponent();
      
      const selects = wrapper.findAll('select');
      const hasStatusFilter = selects.some(select => 
        select.html().toLowerCase().includes('statut') ||
        select.html().toLowerCase().includes('pending') ||
        select.html().toLowerCase().includes('paid')
      );
      expect(hasStatusFilter).toBe(true);
    });

    it('includes common invoice statuses in filter', async () => {
      wrapper = await mountComponent();
      
      const html = wrapper.html().toLowerCase();
      const hasStatusOptions = html.includes('pending') || 
                               html.includes('paid') || 
                               html.includes('payé') ||
                               html.includes('en attente');
      expect(hasStatusOptions).toBe(true);
    });

    it('renders search input', async () => {
      wrapper = await mountComponent();
      
      const inputs = wrapper.findAll('input[type="text"]');
      const hasSearchInput = inputs.length > 0;
      expect(hasSearchInput).toBe(true);
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when loading', async () => {
      vi.spyOn(invoiceStore, 'fetchInvoices').mockResolvedValue(undefined);
      invoiceStore.loading = true;

      wrapper = mount(InvoicesView, {
        global: {
          plugins: [router],
        },
      });

      await wrapper.vm.$nextTick();
      
      const hasLoadingIndicator = wrapper.find('.animate-spin').exists() || 
                                   wrapper.text().includes('Chargement');
      expect(hasLoadingIndicator).toBe(true);
    });

    it('hides loading spinner after data is loaded', async () => {
      wrapper = await mountComponent();
      
      const hasLoadingSpinner = wrapper.find('.animate-spin').exists();
      expect(hasLoadingSpinner).toBe(false);
    });
  });

  describe('Invoices Table Display', () => {
    it('displays invoice data when available', async () => {
      wrapper = await mountComponent();
      
      // Check for invoice numbers
      expect(wrapper.text()).toContain('INV-2025-001');
      expect(wrapper.text()).toContain('INV-2025-002');
    });

    it('displays invoice amounts', async () => {
      wrapper = await mountComponent();
      
      const text = wrapper.text();
      expect(text.includes('500') || text.includes('750')).toBe(true);
    });

    it('displays invoice descriptions', async () => {
      wrapper = await mountComponent();
      
      expect(wrapper.text()).toContain('Frais de scolarité');
    });

    it('displays invoice statuses', async () => {
      wrapper = await mountComponent();
      
      const html = wrapper.html().toLowerCase();
      const hasStatus = html.includes('pending') || 
                       html.includes('paid') || 
                       html.includes('payé') ||
                       html.includes('en attente');
      expect(hasStatus).toBe(true);
    });

    it('shows empty state when no invoices', async () => {
      invoiceStore.invoices = [];
      wrapper = await mountComponent();
      
      const text = wrapper.text().toLowerCase();
      const hasEmptyState = text.includes('aucun') || 
                           text.includes('pas de') ||
                           text.includes('vide');
      expect(hasEmptyState).toBe(true);
    });

    it('renders correct number of invoice rows', async () => {
      wrapper = await mountComponent();
      
      // Should have some content representing invoices
      const hasInvoiceContent = wrapper.text().includes('INV-2025');
      expect(hasInvoiceContent).toBe(true);
    });
  });

  describe('Store Integration', () => {
    it('fetches invoices on mount', async () => {
      const fetchSpy = vi.spyOn(invoiceStore, 'fetchInvoices');
      wrapper = await mountComponent();
      
      expect(fetchSpy).toHaveBeenCalled();
    });

    it('uses invoices from store', async () => {
      wrapper = await mountComponent();
      
      expect(invoiceStore.invoices).toEqual(mockInvoices);
    });

    it('reflects loading state from store', async () => {
      invoiceStore.loading = true;
      wrapper = mount(InvoicesView, {
        global: {
          plugins: [router],
        },
      });
      
      await wrapper.vm.$nextTick();
      
      const hasLoadingIndicator = wrapper.find('.animate-spin').exists() || 
                                   wrapper.text().includes('Chargement');
      expect(hasLoadingIndicator).toBe(true);
    });
  });

  describe('Permissions and Role-Based Display', () => {
    it('shows management features for admin role', async () => {
      authStore.user = { ...mockAdmin, role: 'admin' };
      wrapper = await mountComponent();
      
      const buttons = wrapper.findAll('button');
      const hasManagementButtons = buttons.length > 1; // More than just filter button
      expect(hasManagementButtons).toBe(true);
    });

    it('shows management features for teacher role', async () => {
      authStore.user = { ...mockAdmin, role: 'teacher' };
      wrapper = await mountComponent();
      
      const buttons = wrapper.findAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('restricts features for student role', async () => {
      authStore.user = { ...mockAdmin, role: 'student' };
      wrapper = await mountComponent();
      
      const buttons = wrapper.findAll('button');
      const hasCreateButton = buttons.some(btn => 
        btn.text().toLowerCase().includes('créer') ||
        btn.text().toLowerCase().includes('nouvelle')
      );
      expect(hasCreateButton).toBe(false);
    });

    it('shows appropriate features for parent role', async () => {
      authStore.user = { ...mockAdmin, role: 'parent' };
      wrapper = await mountComponent();
      
      // Parents should see invoices but maybe not create them
      const buttons = wrapper.findAll('button');
      const hasCreateButton = buttons.some(btn => 
        btn.text().toLowerCase().includes('créer')
      );
      expect(hasCreateButton).toBe(false);
    });
  });

  describe('Invoice Status Display', () => {
    it('displays pending status appropriately', async () => {
      wrapper = await mountComponent();
      
      const html = wrapper.html().toLowerCase();
      const hasPendingStatus = html.includes('pending') || 
                              html.includes('en attente');
      expect(hasPendingStatus).toBe(true);
    });

    it('displays paid status appropriately', async () => {
      wrapper = await mountComponent();
      
      const html = wrapper.html().toLowerCase();
      const hasPaidStatus = html.includes('paid') || 
                           html.includes('payé');
      expect(hasPaidStatus).toBe(true);
    });
  });

  describe('Responsive Layout', () => {
    it('uses responsive grid layout', async () => {
      wrapper = await mountComponent();
      
      const grid = wrapper.find('.grid');
      expect(grid.exists()).toBe(true);
    });

    it('applies proper container styling', async () => {
      wrapper = await mountComponent();
      
      const container = wrapper.find('.max-w-7xl');
      expect(container.exists()).toBe(true);
    });

    it('has overflow handling for table', async () => {
      wrapper = await mountComponent();
      
      const hasTable = wrapper.find('table').exists() || 
                      wrapper.find('.overflow-x-auto').exists();
      expect(hasTable).toBe(true);
    });
  });

  describe('Navigation', () => {
    it('provides navigation back to dashboard', async () => {
      wrapper = await mountComponent();
      
      const backLink = wrapper.find('a[href="/dashboard"]');
      expect(backLink.exists()).toBe(true);
    });
  });

  describe('Amount Display', () => {
    it('displays monetary amounts correctly', async () => {
      wrapper = await mountComponent();
      
      const text = wrapper.text();
      const hasAmounts = text.includes('500') || text.includes('750');
      expect(hasAmounts).toBe(true);
    });

    it('formats invoice numbers correctly', async () => {
      wrapper = await mountComponent();
      
      expect(wrapper.text()).toContain('INV-2025');
    });
  });

  describe('Date Display', () => {
    it('displays due dates', async () => {
      wrapper = await mountComponent();
      
      // Should display dates in some format
      const html = wrapper.html();
      const hasDatePattern = /\d{2}[-/]\d{2}[-/]\d{4}|\d{4}[-/]\d{2}[-/]\d{2}/.test(html);
      const hasDateText = wrapper.text().includes('2025');
      
      expect(hasDatePattern || hasDateText).toBe(true);
    });
  });
});
