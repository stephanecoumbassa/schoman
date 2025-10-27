import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import FileUpload from './FileUpload.vue';

// Mock fetch
global.fetch = vi.fn();

describe('FileUpload Component', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'mock-token');
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    localStorage.clear();
  });

  const createMockFile = (
    name: string,
    size: number,
    type: string
  ): File => {
    const file = new File(['content'], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  };

  describe('Rendering', () => {
    it('renders upload placeholder with default label', () => {
      wrapper = mount(FileUpload);
      
      expect(wrapper.text()).toContain('Click to upload or drag and drop');
    });

    it('renders custom label and hint', () => {
      wrapper = mount(FileUpload, {
        props: {
          label: 'Upload your document',
          hint: 'PDF only, max 10MB',
        },
      });
      
      expect(wrapper.text()).toContain('Upload your document');
      expect(wrapper.text()).toContain('PDF only, max 10MB');
    });

    it('renders file input with correct accept attribute', () => {
      wrapper = mount(FileUpload, {
        props: {
          accept: 'application/pdf',
        },
      });
      
      const input = wrapper.find('input[type="file"]');
      expect(input.attributes('accept')).toBe('application/pdf');
    });

    it('renders file input with multiple attribute when specified', () => {
      wrapper = mount(FileUpload, {
        props: {
          multiple: true,
        },
      });
      
      const input = wrapper.find('input[type="file"]');
      expect(input.attributes('multiple')).toBeDefined();
    });
  });

  describe('File Selection', () => {
    it('triggers file input when upload area is clicked', async () => {
      wrapper = mount(FileUpload);
      
      const uploadArea = wrapper.find('.upload-area');
      const fileInput = wrapper.find('input[type="file"]');
      
      const clickSpy = vi.spyOn(fileInput.element as HTMLInputElement, 'click');
      
      await uploadArea.trigger('click');
      
      expect(clickSpy).toHaveBeenCalled();
    });

    it('handles valid file selection', async () => {
      const mockFile = createMockFile('test.png', 1024 * 1024, 'image/png');
      
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ avatar: { path: '/uploads/avatar/test.png' } }),
      } as Response);

      wrapper = mount(FileUpload, {
        props: {
          accept: 'image/*',
          maxSize: 5,
        },
      });
      
      const fileInput = wrapper.find('input[type="file"]');
      
      // Simulate file selection
      const fileList = {
        0: mockFile,
        length: 1,
        item: (index: number) => mockFile,
      } as unknown as FileList;

      Object.defineProperty(fileInput.element, 'files', {
        value: fileList,
        writable: false,
      });

      await fileInput.trigger('change');
      
      // Wait for upload to process
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(fetch).toHaveBeenCalled();
    });
  });

  describe('File Validation', () => {
    it('shows error for oversized files', async () => {
      const mockFile = createMockFile('large.png', 10 * 1024 * 1024, 'image/png');
      
      wrapper = mount(FileUpload, {
        props: {
          accept: 'image/*',
          maxSize: 5, // 5MB max
        },
      });
      
      const fileInput = wrapper.find('input[type="file"]');
      
      const fileList = {
        0: mockFile,
        length: 1,
        item: (index: number) => mockFile,
      } as unknown as FileList;

      Object.defineProperty(fileInput.element, 'files', {
        value: fileList,
        writable: false,
      });

      await fileInput.trigger('change');
      await wrapper.vm.$nextTick();
      
      expect(wrapper.text()).toContain('File size exceeds');
    });

    it('shows error for invalid file type', async () => {
      const mockFile = createMockFile('test.pdf', 1024 * 1024, 'application/pdf');
      
      wrapper = mount(FileUpload, {
        props: {
          accept: 'image/*',
          maxSize: 5,
        },
      });
      
      const fileInput = wrapper.find('input[type="file"]');
      
      const fileList = {
        0: mockFile,
        length: 1,
        item: (index: number) => mockFile,
      } as unknown as FileList;

      Object.defineProperty(fileInput.element, 'files', {
        value: fileList,
        writable: false,
      });

      await fileInput.trigger('change');
      await wrapper.vm.$nextTick();
      
      expect(wrapper.text()).toContain('Invalid file type');
    });
  });

  describe('Drag and Drop', () => {
    it('adds dragging class on dragover', async () => {
      wrapper = mount(FileUpload);
      
      const uploadArea = wrapper.find('.upload-area');
      await uploadArea.trigger('dragover');
      
      expect(uploadArea.classes()).toContain('dragging');
    });

    it('removes dragging class on dragleave', async () => {
      wrapper = mount(FileUpload);
      
      const uploadArea = wrapper.find('.upload-area');
      await uploadArea.trigger('dragover');
      expect(uploadArea.classes()).toContain('dragging');
      
      await uploadArea.trigger('dragleave');
      expect(uploadArea.classes()).not.toContain('dragging');
    });

    it('handles file drop', async () => {
      const mockFile = createMockFile('test.png', 1024 * 1024, 'image/png');
      
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ avatar: { path: '/uploads/avatar/test.png' } }),
      } as Response);

      wrapper = mount(FileUpload, {
        props: {
          accept: 'image/*',
          maxSize: 5,
        },
      });
      
      const uploadArea = wrapper.find('.upload-area');
      
      const dropEvent = new Event('drop') as any;
      dropEvent.dataTransfer = {
        files: {
          0: mockFile,
          length: 1,
          item: (index: number) => mockFile,
        },
      };

      await uploadArea.trigger('drop', { dataTransfer: dropEvent.dataTransfer });
      
      // Should remove dragging class
      expect(uploadArea.classes()).not.toContain('dragging');
    });
  });

  describe('Upload Process', () => {
    it('shows uploading state during upload', async () => {
      const mockFile = createMockFile('test.png', 1024 * 1024, 'image/png');
      
      let resolveUpload: any;
      const uploadPromise = new Promise((resolve) => {
        resolveUpload = resolve;
      });

      vi.mocked(fetch).mockReturnValue(uploadPromise as any);

      wrapper = mount(FileUpload, {
        props: {
          accept: 'image/*',
          maxSize: 5,
        },
      });
      
      const fileInput = wrapper.find('input[type="file"]');
      
      const fileList = {
        0: mockFile,
        length: 1,
        item: (index: number) => mockFile,
      } as unknown as FileList;

      Object.defineProperty(fileInput.element, 'files', {
        value: fileList,
        writable: false,
      });

      await fileInput.trigger('change');
      await wrapper.vm.$nextTick();
      
      // Should show uploading state
      expect(wrapper.text()).toContain('Uploading');
      
      // Resolve upload
      resolveUpload({
        ok: true,
        json: async () => ({ avatar: { path: '/uploads/avatar/test.png' } }),
      });
      
      await uploadPromise;
      await wrapper.vm.$nextTick();
    });

    it('emits upload event on successful upload', async () => {
      const mockFile = createMockFile('test.png', 1024 * 1024, 'image/png');
      
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ avatar: { path: '/uploads/avatar/test.png' } }),
      } as Response);

      wrapper = mount(FileUpload, {
        props: {
          accept: 'image/*',
          maxSize: 5,
        },
      });
      
      const fileInput = wrapper.find('input[type="file"]');
      
      const fileList = {
        0: mockFile,
        length: 1,
        item: (index: number) => mockFile,
      } as unknown as FileList;

      Object.defineProperty(fileInput.element, 'files', {
        value: fileList,
        writable: false,
      });

      await fileInput.trigger('change');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      await wrapper.vm.$nextTick();
      
      const uploadEvents = wrapper.emitted('upload');
      expect(uploadEvents).toBeDefined();
    });

    it('shows error message on upload failure', async () => {
      const mockFile = createMockFile('test.png', 1024 * 1024, 'image/png');
      
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Upload failed' }),
      } as Response);

      wrapper = mount(FileUpload, {
        props: {
          accept: 'image/*',
          maxSize: 5,
        },
      });
      
      const fileInput = wrapper.find('input[type="file"]');
      
      const fileList = {
        0: mockFile,
        length: 1,
        item: (index: number) => mockFile,
      } as unknown as FileList;

      Object.defineProperty(fileInput.element, 'files', {
        value: fileList,
        writable: false,
      });

      await fileInput.trigger('change');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      await wrapper.vm.$nextTick();
      
      expect(wrapper.text()).toContain('Upload failed');
    });
  });

  describe('File Removal', () => {
    it('shows remove button after successful upload', async () => {
      const mockFile = createMockFile('test.png', 1024 * 1024, 'image/png');
      
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ avatar: { path: '/uploads/avatar/test.png' } }),
      } as Response);

      wrapper = mount(FileUpload, {
        props: {
          accept: 'image/*',
          maxSize: 5,
        },
      });
      
      const fileInput = wrapper.find('input[type="file"]');
      
      const fileList = {
        0: mockFile,
        length: 1,
        item: (index: number) => mockFile,
      } as unknown as FileList;

      Object.defineProperty(fileInput.element, 'files', {
        value: fileList,
        writable: false,
      });

      await fileInput.trigger('change');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      await wrapper.vm.$nextTick();
      
      const removeButton = wrapper.find('.remove-btn');
      expect(removeButton.exists()).toBe(true);
    });

    it('emits remove event when remove button clicked', async () => {
      const mockFile = createMockFile('test.png', 1024 * 1024, 'image/png');
      
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ avatar: { path: '/uploads/avatar/test.png' } }),
      } as Response);

      wrapper = mount(FileUpload, {
        props: {
          accept: 'image/*',
          maxSize: 5,
        },
      });
      
      const fileInput = wrapper.find('input[type="file"]');
      
      const fileList = {
        0: mockFile,
        length: 1,
        item: (index: number) => mockFile,
      } as unknown as FileList;

      Object.defineProperty(fileInput.element, 'files', {
        value: fileList,
        writable: false,
      });

      await fileInput.trigger('change');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      await wrapper.vm.$nextTick();
      
      const removeButton = wrapper.find('.remove-btn');
      await removeButton.trigger('click');
      
      const removeEvents = wrapper.emitted('remove');
      expect(removeEvents).toBeDefined();
    });

    it('clears uploaded file state after removal', async () => {
      const mockFile = createMockFile('test.png', 1024 * 1024, 'image/png');
      
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ avatar: { path: '/uploads/avatar/test.png' } }),
      } as Response);

      wrapper = mount(FileUpload, {
        props: {
          accept: 'image/*',
          maxSize: 5,
        },
      });
      
      const fileInput = wrapper.find('input[type="file"]');
      
      const fileList = {
        0: mockFile,
        length: 1,
        item: (index: number) => mockFile,
      } as unknown as FileList;

      Object.defineProperty(fileInput.element, 'files', {
        value: fileList,
        writable: false,
      });

      await fileInput.trigger('change');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      await wrapper.vm.$nextTick();
      
      const removeButton = wrapper.find('.remove-btn');
      await removeButton.trigger('click');
      await wrapper.vm.$nextTick();
      
      // Should show upload placeholder again
      expect(wrapper.text()).toContain('Click to upload or drag and drop');
    });
  });

  describe('Image vs File Display', () => {
    it('displays image preview for image files', async () => {
      const mockFile = createMockFile('test.png', 1024 * 1024, 'image/png');
      
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ avatar: { path: '/uploads/avatar/test.png' } }),
      } as Response);

      wrapper = mount(FileUpload, {
        props: {
          accept: 'image/*',
          maxSize: 5,
        },
      });
      
      const fileInput = wrapper.find('input[type="file"]');
      
      const fileList = {
        0: mockFile,
        length: 1,
        item: (index: number) => mockFile,
      } as unknown as FileList;

      Object.defineProperty(fileInput.element, 'files', {
        value: fileList,
        writable: false,
      });

      await fileInput.trigger('change');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      await wrapper.vm.$nextTick();
      
      const image = wrapper.find('.uploaded-image');
      expect(image.exists()).toBe(true);
    });

    it('displays file info for non-image files', async () => {
      const mockFile = createMockFile('document.pdf', 1024 * 1024, 'application/pdf');
      
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ file: { path: '/uploads/file/document.pdf' } }),
      } as Response);

      wrapper = mount(FileUpload, {
        props: {
          accept: 'application/pdf',
          maxSize: 5,
        },
      });
      
      const fileInput = wrapper.find('input[type="file"]');
      
      const fileList = {
        0: mockFile,
        length: 1,
        item: (index: number) => mockFile,
      } as unknown as FileList;

      Object.defineProperty(fileInput.element, 'files', {
        value: fileList,
        writable: false,
      });

      await fileInput.trigger('change');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      await wrapper.vm.$nextTick();
      
      const fileInfo = wrapper.find('.file-info');
      expect(fileInfo.exists()).toBe(true);
    });
  });
});
