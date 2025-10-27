import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount, VueWrapper, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import SchoolSelector from './SchoolSelector.vue';
import { useSchoolStore } from '@/stores/school';

describe('SchoolSelector Component', () => {
  let wrapper: VueWrapper;
  let schoolStore: ReturnType<typeof useSchoolStore>;

  const mockSchools = [
    {
      _id: 'school1',
      name: 'École Primaire Test',
      code: 'EPT',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'school2',
      name: 'Collège Test',
      code: 'CT',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'school3',
      name: 'Lycée Test',
      code: 'LT',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    setActivePinia(createPinia());
    schoolStore = useSchoolStore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  describe('Rendering with Multiple Schools', () => {
    it('renders when there are multiple active schools', async () => {
      vi.spyOn(schoolStore, 'fetchSchools').mockResolvedValue();
      schoolStore.schools = mockSchools;

      wrapper = mount(SchoolSelector);
      await flushPromises();
      
      expect(wrapper.find('.school-selector').exists()).toBe(true);
    });

    it('renders school selector label', async () => {
      vi.spyOn(schoolStore, 'fetchSchools').mockResolvedValue();
      schoolStore.schools = mockSchools;

      wrapper = mount(SchoolSelector);
      await flushPromises();
      
      expect(wrapper.text()).toContain('École :');
    });

    it('renders dropdown with all active schools', async () => {
      vi.spyOn(schoolStore, 'fetchSchools').mockResolvedValue();
      schoolStore.schools = mockSchools;

      wrapper = mount(SchoolSelector);
      await flushPromises();
      
      const select = wrapper.find('select');
      const options = select.findAll('option');
      
      // Plus 1 for the disabled default option
      expect(options.length).toBe(mockSchools.length + 1);
    });

    it('displays school names and codes in options', async () => {
      vi.spyOn(schoolStore, 'fetchSchools').mockResolvedValue();
      schoolStore.schools = mockSchools;

      wrapper = mount(SchoolSelector);
      await flushPromises();
      
      expect(wrapper.html()).toContain('École Primaire Test (EPT)');
      expect(wrapper.html()).toContain('Collège Test (CT)');
      expect(wrapper.html()).toContain('Lycée Test (LT)');
    });

    it('renders placeholder option', async () => {
      vi.spyOn(schoolStore, 'fetchSchools').mockResolvedValue();
      schoolStore.schools = mockSchools;

      wrapper = mount(SchoolSelector);
      await flushPromises();
      
      const select = wrapper.find('select');
      const firstOption = select.findAll('option')[0];
      
      expect(firstOption.text()).toBe('Sélectionner une école');
      expect(firstOption.attributes('disabled')).toBeDefined();
    });
  });

  describe('Rendering with Single School', () => {
    it('does not render when there is only one school', async () => {
      vi.spyOn(schoolStore, 'fetchSchools').mockResolvedValue();
      schoolStore.schools = [mockSchools[0]];

      wrapper = mount(SchoolSelector);
      await flushPromises();
      
      expect(wrapper.find('.school-selector').exists()).toBe(false);
    });

    it('does not render when there are no schools', async () => {
      vi.spyOn(schoolStore, 'fetchSchools').mockResolvedValue();
      schoolStore.schools = [];

      wrapper = mount(SchoolSelector);
      await flushPromises();
      
      expect(wrapper.find('.school-selector').exists()).toBe(false);
    });
  });

  describe('School Selection', () => {
    it('pre-selects school if one is already selected in store', async () => {
      vi.spyOn(schoolStore, 'fetchSchools').mockResolvedValue();
      schoolStore.schools = mockSchools;
      schoolStore.selectedSchoolId = 'school2';

      wrapper = mount(SchoolSelector);
      await flushPromises();
      await wrapper.vm.$nextTick();
      
      const select = wrapper.find('select');
      expect((select.element as HTMLSelectElement).value).toBe('school2');
    });

    it('calls selectSchool when a school is selected', async () => {
      vi.spyOn(schoolStore, 'fetchSchools').mockResolvedValue();
      const selectSchoolSpy = vi.spyOn(schoolStore, 'selectSchool');
      schoolStore.schools = mockSchools;

      wrapper = mount(SchoolSelector);
      await flushPromises();
      
      const select = wrapper.find('select');
      await select.setValue('school1');
      
      expect(selectSchoolSpy).toHaveBeenCalledWith('school1');
    });

    it('dispatches school-changed event when selection changes', async () => {
      vi.spyOn(schoolStore, 'fetchSchools').mockResolvedValue();
      schoolStore.schools = mockSchools;

      const eventSpy = vi.fn();
      window.addEventListener('school-changed', eventSpy);

      wrapper = mount(SchoolSelector);
      await flushPromises();
      
      const select = wrapper.find('select');
      await select.setValue('school1');
      
      expect(eventSpy).toHaveBeenCalled();
      
      window.removeEventListener('school-changed', eventSpy);
    });

    it('includes schoolId in dispatched event detail', async () => {
      vi.spyOn(schoolStore, 'fetchSchools').mockResolvedValue();
      schoolStore.schools = mockSchools;

      let eventDetail: any;
      const eventListener = (e: Event) => {
        eventDetail = (e as CustomEvent).detail;
      };
      window.addEventListener('school-changed', eventListener);

      wrapper = mount(SchoolSelector);
      await flushPromises();
      
      const select = wrapper.find('select');
      await select.setValue('school2');
      
      expect(eventDetail).toEqual({ schoolId: 'school2' });
      
      window.removeEventListener('school-changed', eventListener);
    });
  });

  describe('Store Integration', () => {
    it('fetches schools on mount', async () => {
      const fetchSchoolsSpy = vi.spyOn(schoolStore, 'fetchSchools').mockResolvedValue();
      schoolStore.schools = mockSchools;

      wrapper = mount(SchoolSelector);
      await flushPromises();
      
      expect(fetchSchoolsSpy).toHaveBeenCalledWith({ isActive: true });
    });

    it('syncs with store when selectedSchoolId changes', async () => {
      vi.spyOn(schoolStore, 'fetchSchools').mockResolvedValue();
      schoolStore.schools = mockSchools;
      schoolStore.selectedSchoolId = 'school1';

      wrapper = mount(SchoolSelector);
      await flushPromises();
      await wrapper.vm.$nextTick();
      
      // Change in store should update component
      schoolStore.selectedSchoolId = 'school2';
      await wrapper.vm.$nextTick();
      
      const select = wrapper.find('select');
      expect((select.element as HTMLSelectElement).value).toBe('school2');
    });

    it('uses activeSchools from store', async () => {
      vi.spyOn(schoolStore, 'fetchSchools').mockResolvedValue();
      const inactiveSchool = {
        ...mockSchools[0],
        _id: 'inactive',
        name: 'Inactive School',
        code: 'IS',
        isActive: false,
      };
      schoolStore.schools = [...mockSchools, inactiveSchool];

      wrapper = mount(SchoolSelector);
      await flushPromises();
      
      // Should only show active schools
      const select = wrapper.find('select');
      const options = select.findAll('option');
      
      // Check that inactive school is not in the list
      expect(wrapper.html()).not.toContain('Inactive School');
      
      // Should have 3 active schools + 1 placeholder
      expect(options.length).toBe(mockSchools.length + 1);
    });
  });

  describe('Styling', () => {
    it('applies correct CSS classes to container', async () => {
      vi.spyOn(schoolStore, 'fetchSchools').mockResolvedValue();
      schoolStore.schools = mockSchools;

      wrapper = mount(SchoolSelector);
      await flushPromises();
      
      const container = wrapper.find('.school-selector');
      expect(container.classes()).toContain('school-selector');
    });

    it('applies correct CSS classes to dropdown', async () => {
      vi.spyOn(schoolStore, 'fetchSchools').mockResolvedValue();
      schoolStore.schools = mockSchools;

      wrapper = mount(SchoolSelector);
      await flushPromises();
      
      const select = wrapper.find('.selector-dropdown');
      expect(select.exists()).toBe(true);
      expect(select.classes()).toContain('selector-dropdown');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty school list gracefully', async () => {
      vi.spyOn(schoolStore, 'fetchSchools').mockResolvedValue();
      schoolStore.schools = [];

      wrapper = mount(SchoolSelector);
      await flushPromises();
      
      // Should not render at all
      expect(wrapper.find('.school-selector').exists()).toBe(false);
    });

    it('does not call selectSchool when empty value is selected', async () => {
      vi.spyOn(schoolStore, 'fetchSchools').mockResolvedValue();
      const selectSchoolSpy = vi.spyOn(schoolStore, 'selectSchool');
      schoolStore.schools = mockSchools;

      wrapper = mount(SchoolSelector);
      await flushPromises();
      
      const select = wrapper.find('select');
      // Try to select empty option
      await select.setValue('');
      
      // Should not call selectSchool for empty value
      expect(selectSchoolSpy).not.toHaveBeenCalled();
    });
  });
});
