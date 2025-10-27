import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useInvoiceStore } from './invoice';
import api from '@/services/api';
import type { Invoice, InvoiceFormData, Pagination } from '@/types';

// Mock the API service
vi.mock('@/services/api', () => ({
  default: {
    getInvoices: vi.fn(),
    getInvoice: vi.fn(),
    createInvoice: vi.fn(),
    updateInvoice: vi.fn(),
    deleteInvoice: vi.fn(),
  },
}));

describe('Invoice Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  const mockInvoice1: Invoice = {
    _id: 'invoice1',
    invoiceNumber: 'INV-2024-001',
    student: {
      _id: 'student1',
      userId: {
        firstName: 'John',
        lastName: 'Student',
      },
      matricule: 'STU001',
    },
    items: [
      { description: 'Tuition Fee', quantity: 1, unitPrice: 1000, amount: 1000 },
    ],
    subtotal: 1000,
    taxRate: 0,
    taxAmount: 0,
    totalAmount: 1000,
    issueDate: '2024-09-01',
    dueDate: '2024-09-30',
    status: 'sent',
    payments: [],
    paidAmount: 0,
    balanceAmount: 1000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockInvoice2: Invoice = {
    _id: 'invoice2',
    invoiceNumber: 'INV-2024-002',
    student: {
      _id: 'student2',
      userId: {
        firstName: 'Jane',
        lastName: 'Student',
      },
      matricule: 'STU002',
    },
    items: [
      { description: 'Registration Fee', quantity: 1, unitPrice: 500, amount: 500 },
    ],
    subtotal: 500,
    taxRate: 0,
    taxAmount: 0,
    totalAmount: 500,
    issueDate: '2024-09-01',
    dueDate: '2024-09-15',
    status: 'paid',
    payments: [
      { amount: 500, date: '2024-09-10', method: 'cash', reference: 'PAY001' },
    ],
    paidAmount: 500,
    balanceAmount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockOverdueInvoice: Invoice = {
    _id: 'invoice3',
    invoiceNumber: 'INV-2024-003',
    student: {
      _id: 'student3',
      userId: {
        firstName: 'Bob',
        lastName: 'Student',
      },
      matricule: 'STU003',
    },
    items: [
      { description: 'Library Fee', quantity: 1, unitPrice: 100, amount: 100 },
    ],
    subtotal: 100,
    taxRate: 0,
    taxAmount: 0,
    totalAmount: 100,
    issueDate: '2024-08-01',
    dueDate: '2024-08-15',
    status: 'overdue',
    payments: [],
    paidAmount: 0,
    balanceAmount: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockPagination: Pagination = {
    currentPage: 1,
    totalPages: 1,
    totalItems: 3,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  };

  describe('Initial State', () => {
    it('should have empty invoices array', () => {
      const store = useInvoiceStore();
      expect(store.invoices).toEqual([]);
    });

    it('should have null currentInvoice', () => {
      const store = useInvoiceStore();
      expect(store.currentInvoice).toBeNull();
    });

    it('should not be loading', () => {
      const store = useInvoiceStore();
      expect(store.loading).toBe(false);
    });

    it('should have no error', () => {
      const store = useInvoiceStore();
      expect(store.error).toBeNull();
    });
  });

  describe('Getters', () => {
    beforeEach(() => {
      const store = useInvoiceStore();
      store.invoices = [mockInvoice1, mockInvoice2, mockOverdueInvoice];
    });

    it('should filter paid invoices', () => {
      const store = useInvoiceStore();
      expect(store.paidInvoices).toHaveLength(1);
      expect(store.paidInvoices[0]).toEqual(mockInvoice2);
    });

    it('should filter unpaid invoices', () => {
      const store = useInvoiceStore();
      expect(store.unpaidInvoices).toHaveLength(2);
      expect(store.unpaidInvoices[0]._id).toBe(mockInvoice1._id);
      expect(store.unpaidInvoices[1]._id).toBe(mockOverdueInvoice._id);
    });

    it('should filter overdue invoices', () => {
      const store = useInvoiceStore();
      expect(store.overdueInvoices).toHaveLength(1);
      expect(store.overdueInvoices[0]).toEqual(mockOverdueInvoice);
    });

    it('should count total invoices', () => {
      const store = useInvoiceStore();
      expect(store.totalInvoices).toBe(3);
    });

    it('should calculate total amount', () => {
      const store = useInvoiceStore();
      expect(store.totalAmount).toBe(1600); // 1000 + 500 + 100
    });

    it('should calculate total paid', () => {
      const store = useInvoiceStore();
      expect(store.totalPaid).toBe(500);
    });

    it('should calculate total balance', () => {
      const store = useInvoiceStore();
      expect(store.totalBalance).toBe(1100); // 1000 + 0 + 100
    });
  });

  describe('Fetch Invoices', () => {
    it('should fetch invoices successfully', async () => {
      const store = useInvoiceStore();
      vi.mocked(api.getInvoices).mockResolvedValue({
        data: {
          invoices: [mockInvoice1, mockInvoice2],
          pagination: mockPagination,
        },
      });

      await store.fetchInvoices();

      expect(store.loading).toBe(false);
      expect(store.invoices).toHaveLength(2);
      expect(store.invoices[0]._id).toBe(mockInvoice1._id);
      expect(store.pagination).toEqual(mockPagination);
      expect(store.error).toBeNull();
    });

    it('should handle fetch invoices error', async () => {
      const store = useInvoiceStore();
      const errorMessage = 'Network error';
      vi.mocked(api.getInvoices).mockResolvedValue({
        error: errorMessage,
      });

      await store.fetchInvoices();

      expect(store.loading).toBe(false);
      expect(store.invoices).toHaveLength(0);
      expect(store.error).toBe(errorMessage);
    });

    it('should fetch invoices with filters', async () => {
      const store = useInvoiceStore();
      const params = { status: 'paid', page: 1 };
      vi.mocked(api.getInvoices).mockResolvedValue({
        data: {
          invoices: [mockInvoice2],
          pagination: mockPagination,
        },
      });

      await store.fetchInvoices(params);

      expect(api.getInvoices).toHaveBeenCalledWith(params);
      expect(store.invoices).toHaveLength(1);
    });
  });

  describe('Fetch Invoice By ID', () => {
    it('should fetch invoice by id successfully', async () => {
      const store = useInvoiceStore();
      vi.mocked(api.getInvoice).mockResolvedValue({
        data: { invoice: mockInvoice1 },
      });

      await store.fetchInvoiceById('invoice1');

      expect(store.loading).toBe(false);
      expect(store.currentInvoice).toEqual(mockInvoice1);
      expect(store.error).toBeNull();
    });

    it('should handle fetch invoice by id error', async () => {
      const store = useInvoiceStore();
      const errorMessage = 'Invoice not found';
      vi.mocked(api.getInvoice).mockResolvedValue({
        error: errorMessage,
      });

      await store.fetchInvoiceById('invalid-id');

      expect(store.loading).toBe(false);
      expect(store.currentInvoice).toBeNull();
      expect(store.error).toBe(errorMessage);
    });
  });

  describe('Create Invoice', () => {
    it('should create invoice successfully', async () => {
      const store = useInvoiceStore();
      const newInvoiceData: InvoiceFormData = {
        student: 'student1',
        items: [
          { description: 'New Fee', quantity: 1, unitPrice: 200, amount: 200 },
        ],
        taxRate: 0,
        issueDate: '2024-10-01',
        dueDate: '2024-10-31',
        status: 'draft',
      };

      const createdInvoice: Invoice = {
        _id: 'invoice4',
        invoiceNumber: 'INV-2024-004',
        student: {
          _id: 'student1',
          userId: {
            firstName: 'John',
            lastName: 'Student',
          },
          matricule: 'STU001',
        },
        items: newInvoiceData.items,
        subtotal: 200,
        taxRate: 0,
        taxAmount: 0,
        totalAmount: 200,
        issueDate: newInvoiceData.issueDate,
        dueDate: newInvoiceData.dueDate,
        status: 'draft',
        payments: [],
        paidAmount: 0,
        balanceAmount: 200,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(api.createInvoice).mockResolvedValue({
        data: { invoice: createdInvoice },
      });

      const result = await store.createInvoice(newInvoiceData);

      expect(store.loading).toBe(false);
      expect(store.invoices).toHaveLength(1);
      expect(store.invoices[0]._id).toBe(createdInvoice._id);
      expect(result).toEqual(createdInvoice);
      expect(store.error).toBeNull();
    });

    it('should handle create invoice error', async () => {
      const store = useInvoiceStore();
      const errorMessage = 'Validation failed';
      vi.mocked(api.createInvoice).mockResolvedValue({
        error: errorMessage,
      });

      const invalidData: InvoiceFormData = {
        student: '',
        items: [],
        taxRate: 0,
        issueDate: '',
        dueDate: '',
        status: 'draft',
      };

      await expect(store.createInvoice(invalidData)).rejects.toThrow();
      expect(store.error).toBe(errorMessage);
    });
  });

  describe('Update Invoice', () => {
    it('should update invoice successfully', async () => {
      const store = useInvoiceStore();
      store.invoices = [mockInvoice1, mockInvoice2];
      
      const updatedInvoice = { ...mockInvoice1, status: 'paid' as const };
      vi.mocked(api.updateInvoice).mockResolvedValue({
        data: { invoice: updatedInvoice },
      });

      await store.updateInvoice('invoice1', { status: 'paid' });

      expect(store.loading).toBe(false);
      expect(store.invoices[0].status).toBe('paid');
      expect(store.error).toBeNull();
    });

    it('should update currentInvoice if it matches', async () => {
      const store = useInvoiceStore();
      store.currentInvoice = mockInvoice1;
      
      const updatedInvoice = { ...mockInvoice1, status: 'paid' as const };
      vi.mocked(api.updateInvoice).mockResolvedValue({
        data: { invoice: updatedInvoice },
      });

      await store.updateInvoice('invoice1', { status: 'paid' });

      expect(store.currentInvoice?.status).toBe('paid');
    });

    it('should handle update invoice error', async () => {
      const store = useInvoiceStore();
      const errorMessage = 'Update failed';
      vi.mocked(api.updateInvoice).mockResolvedValue({
        error: errorMessage,
      });

      await expect(store.updateInvoice('invoice1', { status: 'paid' })).rejects.toThrow();
      expect(store.error).toBe(errorMessage);
    });
  });

  describe('Delete Invoice', () => {
    it('should delete invoice successfully', async () => {
      const store = useInvoiceStore();
      store.invoices = [mockInvoice1, mockInvoice2];
      
      vi.mocked(api.deleteInvoice).mockResolvedValue({
        data: { message: 'Invoice deleted' },
      });

      await store.deleteInvoice('invoice1');

      expect(store.loading).toBe(false);
      expect(store.invoices).toHaveLength(1);
      expect(store.invoices[0]._id).toBe(mockInvoice2._id);
      expect(store.error).toBeNull();
    });

    it('should clear currentInvoice if deleted', async () => {
      const store = useInvoiceStore();
      store.currentInvoice = mockInvoice1;
      store.invoices = [mockInvoice1];
      
      vi.mocked(api.deleteInvoice).mockResolvedValue({
        data: { message: 'Invoice deleted' },
      });

      await store.deleteInvoice('invoice1');

      expect(store.currentInvoice).toBeNull();
    });

    it('should handle delete invoice error', async () => {
      const store = useInvoiceStore();
      const errorMessage = 'Delete failed';
      vi.mocked(api.deleteInvoice).mockResolvedValue({
        error: errorMessage,
      });

      await expect(store.deleteInvoice('invoice1')).rejects.toThrow();
      expect(store.error).toBe(errorMessage);
    });
  });

  describe('Utility Actions', () => {
    it('should clear error', () => {
      const store = useInvoiceStore();
      store.error = 'Some error';
      
      store.clearError();
      
      expect(store.error).toBeNull();
    });

    it('should clear current invoice', () => {
      const store = useInvoiceStore();
      store.currentInvoice = mockInvoice1;
      
      store.clearCurrentInvoice();
      
      expect(store.currentInvoice).toBeNull();
    });
  });
});
