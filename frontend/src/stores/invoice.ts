import { defineStore } from 'pinia';
import api from '@/services/api';
import type { Invoice, InvoiceFormData, Pagination, QueryParams } from '@/types';

interface InvoiceState {
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
}

export const useInvoiceStore = defineStore('invoice', {
  state: (): InvoiceState => ({
    invoices: [],
    currentInvoice: null,
    loading: false,
    error: null,
    pagination: null,
  }),

  getters: {
    paidInvoices: (state) => state.invoices.filter(i => i.status === 'paid'),
    unpaidInvoices: (state) => state.invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled'),
    overdueInvoices: (state) => state.invoices.filter(i => i.status === 'overdue'),
    draftInvoices: (state) => state.invoices.filter(i => i.status === 'draft'),
    totalInvoices: (state) => state.invoices.length,
    totalAmount: (state) => state.invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    totalPaid: (state) => state.invoices.reduce((sum, inv) => sum + inv.paidAmount, 0),
    totalBalance: (state) => state.invoices.reduce((sum, inv) => sum + inv.balanceAmount, 0),
  },

  actions: {
    async fetchInvoices(params?: QueryParams) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.getInvoices(params);
        if (response.data) {
          this.invoices = response.data.invoices;
          this.pagination = response.data.pagination;
        } else if (response.error) {
          this.error = response.error;
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch invoices';
        console.error('Error fetching invoices:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchInvoiceById(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.getInvoice(id);
        if (response.data) {
          this.currentInvoice = response.data.invoice;
        } else if (response.error) {
          this.error = response.error;
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch invoice';
        console.error('Error fetching invoice:', error);
      } finally {
        this.loading = false;
      }
    },

    async createInvoice(data: InvoiceFormData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.createInvoice(data);
        if (response.data) {
          this.invoices.push(response.data.invoice);
          return response.data.invoice;
        } else if (response.error) {
          this.error = response.error;
          throw new Error(response.error);
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to create invoice';
        console.error('Error creating invoice:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateInvoice(id: string, data: Partial<InvoiceFormData>) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.updateInvoice(id, data);
        if (response.data) {
          const index = this.invoices.findIndex(i => i._id === id);
          if (index !== -1) {
            this.invoices[index] = response.data.invoice;
          }
          if (this.currentInvoice?._id === id) {
            this.currentInvoice = response.data.invoice;
          }
          return response.data.invoice;
        } else if (response.error) {
          this.error = response.error;
          throw new Error(response.error);
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to update invoice';
        console.error('Error updating invoice:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteInvoice(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.deleteInvoice(id);
        if (response.error) {
          this.error = response.error;
          throw new Error(response.error);
        }
        // Remove from local state
        this.invoices = this.invoices.filter(i => i._id !== id);
        if (this.currentInvoice?._id === id) {
          this.currentInvoice = null;
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to delete invoice';
        console.error('Error deleting invoice:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearError() {
      this.error = null;
    },

    clearCurrentInvoice() {
      this.currentInvoice = null;
    },
  },
});
