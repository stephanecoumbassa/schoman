import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import ExportButton from './ExportButton.vue';

// Mock fetch
global.fetch = vi.fn();

// Mock URL methods
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('ExportButton Component', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'mock-token');
    
    // Mock document methods
    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('renders export button with default label', () => {
      wrapper = mount(ExportButton, {
        props: {
          exportType: 'students',
        },
      });
      
      expect(wrapper.text()).toContain('Exporter');
    });

    it('renders export button with custom label', () => {
      wrapper = mount(ExportButton, {
        props: {
          exportType: 'students',
          label: 'Télécharger',
        },
      });
      
      expect(wrapper.text()).toContain('Télécharger');
    });

    it('renders export icon', () => {
      wrapper = mount(ExportButton, {
        props: {
          exportType: 'students',
        },
      });
      
      const icon = wrapper.find('.icon');
      expect(icon.exists()).toBe(true);
    });

    it('does not show dropdown menu initially', () => {
      wrapper = mount(ExportButton, {
        props: {
          exportType: 'students',
        },
      });
      
      const menu = wrapper.find('.dropdown-menu');
      expect(menu.exists()).toBe(false);
    });
  });

  describe('Menu Toggle', () => {
    it('shows dropdown menu when button is clicked', async () => {
      wrapper = mount(ExportButton, {
        props: {
          exportType: 'students',
        },
      });
      
      const button = wrapper.find('.export-btn');
      await button.trigger('click');
      
      const menu = wrapper.find('.dropdown-menu');
      expect(menu.exists()).toBe(true);
    });

    it('hides dropdown menu when button is clicked again', async () => {
      wrapper = mount(ExportButton, {
        props: {
          exportType: 'students',
        },
      });
      
      const button = wrapper.find('.export-btn');
      
      // Open menu
      await button.trigger('click');
      expect(wrapper.find('.dropdown-menu').exists()).toBe(true);
      
      // Close menu
      await button.trigger('click');
      expect(wrapper.find('.dropdown-menu').exists()).toBe(false);
    });

    it('displays PDF and Excel export options in menu', async () => {
      wrapper = mount(ExportButton, {
        props: {
          exportType: 'students',
        },
      });
      
      const button = wrapper.find('.export-btn');
      await button.trigger('click');
      
      expect(wrapper.text()).toContain('Exporter en PDF');
      expect(wrapper.text()).toContain('Exporter en Excel');
    });
  });

  describe('PDF Export', () => {
    it('calls correct API endpoint for PDF export', async () => {
      const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
      
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        blob: async () => mockBlob,
        headers: new Headers(),
      } as Response);

      wrapper = mount(ExportButton, {
        props: {
          exportType: 'students',
        },
      });
      
      const button = wrapper.find('.export-btn');
      await button.trigger('click');
      
      const pdfButton = wrapper.findAll('.menu-item')[0];
      await pdfButton.trigger('click');
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/exports/students/pdf'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      );
    });

    it('includes query parameters in PDF export URL', async () => {
      const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
      
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        blob: async () => mockBlob,
        headers: new Headers(),
      } as Response);

      wrapper = mount(ExportButton, {
        props: {
          exportType: 'students',
          params: {
            level: '6ème',
            year: '2025',
          },
        },
      });
      
      const button = wrapper.find('.export-btn');
      await button.trigger('click');
      
      const pdfButton = wrapper.findAll('.menu-item')[0];
      await pdfButton.trigger('click');
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('level=6%C3%A8me'),
        expect.anything()
      );
    });

    it('emits success event on successful PDF export', async () => {
      const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
      
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        blob: async () => mockBlob,
        headers: new Headers(),
      } as Response);

      wrapper = mount(ExportButton, {
        props: {
          exportType: 'students',
        },
      });
      
      const button = wrapper.find('.export-btn');
      await button.trigger('click');
      
      const pdfButton = wrapper.findAll('.menu-item')[0];
      await pdfButton.trigger('click');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      await wrapper.vm.$nextTick();
      
      const successEvents = wrapper.emitted('success');
      expect(successEvents).toBeDefined();
    });
  });

  describe('Excel Export', () => {
    it('calls correct API endpoint for Excel export', async () => {
      const mockBlob = new Blob(['excel content'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        blob: async () => mockBlob,
        headers: new Headers(),
      } as Response);

      wrapper = mount(ExportButton, {
        props: {
          exportType: 'grades',
        },
      });
      
      const button = wrapper.find('.export-btn');
      await button.trigger('click');
      
      const excelButton = wrapper.findAll('.menu-item')[1];
      await excelButton.trigger('click');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/exports/grades/excel'),
        expect.anything()
      );
    });

    it('emits success event on successful Excel export', async () => {
      const mockBlob = new Blob(['excel content'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        blob: async () => mockBlob,
        headers: new Headers(),
      } as Response);

      wrapper = mount(ExportButton, {
        props: {
          exportType: 'transactions',
        },
      });
      
      const button = wrapper.find('.export-btn');
      await button.trigger('click');
      
      const excelButton = wrapper.findAll('.menu-item')[1];
      await excelButton.trigger('click');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      await wrapper.vm.$nextTick();
      
      const successEvents = wrapper.emitted('success');
      expect(successEvents).toBeDefined();
    });
  });

  describe('Loading State', () => {
    it('disables button during export', async () => {
      const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
      
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        blob: async () => mockBlob,
        headers: new Headers(),
      } as Response);

      wrapper = mount(ExportButton, {
        props: {
          exportType: 'students',
        },
      });
      
      const button = wrapper.find('.export-btn');
      await button.trigger('click');
      
      const pdfButton = wrapper.findAll('.menu-item')[0];
      const clickPromise = pdfButton.trigger('click');
      
      await wrapper.vm.$nextTick();
      
      // Should disable button during export
      expect(wrapper.find('.export-btn').attributes('disabled')).toBeDefined();
      
      await clickPromise;
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('hides loading spinner after export completes', async () => {
      const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
      
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        blob: async () => mockBlob,
        headers: new Headers(),
      } as Response);

      wrapper = mount(ExportButton, {
        props: {
          exportType: 'students',
        },
      });
      
      const button = wrapper.find('.export-btn');
      await button.trigger('click');
      
      const pdfButton = wrapper.findAll('.menu-item')[0];
      await pdfButton.trigger('click');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      await wrapper.vm.$nextTick();
      
      expect(wrapper.find('.spinner').exists()).toBe(false);
      expect(wrapper.find('.icon').exists()).toBe(true);
    });

    it('closes menu after export starts', async () => {
      const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
      
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        blob: async () => mockBlob,
        headers: new Headers(),
      } as Response);

      wrapper = mount(ExportButton, {
        props: {
          exportType: 'students',
        },
      });
      
      const button = wrapper.find('.export-btn');
      await button.trigger('click');
      
      expect(wrapper.find('.dropdown-menu').exists()).toBe(true);
      
      const pdfButton = wrapper.findAll('.menu-item')[0];
      await pdfButton.trigger('click');
      
      await wrapper.vm.$nextTick();
      
      expect(wrapper.find('.dropdown-menu').exists()).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('emits error event on export failure', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        blob: async () => new Blob(),
        headers: new Headers(),
      } as Response);

      wrapper = mount(ExportButton, {
        props: {
          exportType: 'students',
        },
      });
      
      const button = wrapper.find('.export-btn');
      await button.trigger('click');
      
      const pdfButton = wrapper.findAll('.menu-item')[0];
      await pdfButton.trigger('click');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      await wrapper.vm.$nextTick();
      
      const errorEvents = wrapper.emitted('error');
      expect(errorEvents).toBeDefined();
      if (errorEvents && errorEvents.length > 0) {
        // Error event emits array with message as first parameter
        expect(errorEvents[0][0]).toContain('Échec de l\'export');
      }
    });

    it('handles missing authentication token', async () => {
      localStorage.removeItem('token');

      wrapper = mount(ExportButton, {
        props: {
          exportType: 'students',
        },
      });
      
      const button = wrapper.find('.export-btn');
      await button.trigger('click');
      
      const pdfButton = wrapper.findAll('.menu-item')[0];
      await pdfButton.trigger('click');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      await wrapper.vm.$nextTick();
      
      const errorEvents = wrapper.emitted('error');
      expect(errorEvents).toBeDefined();
    });

    it('hides loading state after error', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        blob: async () => new Blob(),
        headers: new Headers(),
      } as Response);

      wrapper = mount(ExportButton, {
        props: {
          exportType: 'students',
        },
      });
      
      const button = wrapper.find('.export-btn');
      await button.trigger('click');
      
      const pdfButton = wrapper.findAll('.menu-item')[0];
      await pdfButton.trigger('click');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      await wrapper.vm.$nextTick();
      
      expect(wrapper.find('.spinner').exists()).toBe(false);
    });
  });

  describe('Filename Handling', () => {
    it('handles export with Content-Disposition header', async () => {
      const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
      const headers = new Headers();
      headers.set('Content-Disposition', 'attachment; filename="students-2025.pdf"');
      
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        blob: async () => mockBlob,
        headers,
      } as Response);

      wrapper = mount(ExportButton, {
        props: {
          exportType: 'students',
        },
      });
      
      const button = wrapper.find('.export-btn');
      await button.trigger('click');
      
      const pdfButton = wrapper.findAll('.menu-item')[0];
      await pdfButton.trigger('click');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check that fetch was called - download happens in component
      expect(fetch).toHaveBeenCalled();
    });

    it('handles export without Content-Disposition header', async () => {
      const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
      
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        blob: async () => mockBlob,
        headers: new Headers(),
      } as Response);

      wrapper = mount(ExportButton, {
        props: {
          exportType: 'grades',
        },
      });
      
      const button = wrapper.find('.export-btn');
      await button.trigger('click');
      
      const pdfButton = wrapper.findAll('.menu-item')[0];
      await pdfButton.trigger('click');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check that fetch was called - download happens in component
      expect(fetch).toHaveBeenCalled();
    });
  });
});
