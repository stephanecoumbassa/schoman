import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatCard from './StatCard.vue'

describe('StatCard Component', () => {
  it('renders label and value', () => {
    const wrapper = mount(StatCard, {
      props: {
        label: 'Total Students',
        value: 150
      }
    })

    expect(wrapper.text()).toContain('Total Students')
    expect(wrapper.text()).toContain('150')
  })

  it('formats numeric values with locale', () => {
    const wrapper = mount(StatCard, {
      props: {
        label: 'Revenue',
        value: 1234567
      }
    })

    // French locale formatting should add spaces
    expect(wrapper.text()).toMatch(/1\s234\s567/)
  })

  it('renders string values as-is', () => {
    const wrapper = mount(StatCard, {
      props: {
        label: 'Status',
        value: 'Active'
      }
    })

    expect(wrapper.text()).toContain('Active')
  })

  it('renders prefix and suffix', () => {
    const wrapper = mount(StatCard, {
      props: {
        label: 'Revenue',
        value: 1000,
        prefix: '$',
        suffix: ' USD'
      }
    })

    const valueText = wrapper.find('.stat-value').text()
    expect(valueText).toContain('$')
    expect(valueText).toContain('USD')
  })

  it('renders positive change correctly', () => {
    const wrapper = mount(StatCard, {
      props: {
        label: 'Sales',
        value: 100,
        change: 15
      }
    })

    const changeElement = wrapper.find('.stat-change')
    expect(changeElement.text()).toContain('↑')
    expect(changeElement.text()).toContain('15%')
    expect(changeElement.classes()).toContain('positive')
  })

  it('renders negative change correctly', () => {
    const wrapper = mount(StatCard, {
      props: {
        label: 'Sales',
        value: 100,
        change: -10
      }
    })

    const changeElement = wrapper.find('.stat-change')
    expect(changeElement.text()).toContain('↓')
    expect(changeElement.text()).toContain('10%')
    expect(changeElement.classes()).toContain('negative')
  })

  it('renders custom change text', () => {
    const wrapper = mount(StatCard, {
      props: {
        label: 'Sales',
        value: 100,
        change: 5,
        changeText: 'vs last week'
      }
    })

    expect(wrapper.text()).toContain('vs last week')
  })

  it('applies variant classes correctly', () => {
    const variants = ['primary', 'success', 'warning', 'danger', 'info'] as const
    
    variants.forEach(variant => {
      const wrapper = mount(StatCard, {
        props: {
          label: 'Test',
          value: 100,
          variant
        }
      })
      
      expect(wrapper.find('.stat-card').classes()).toContain(variant)
    })
  })

  it('renders icon slot', () => {
    const wrapper = mount(StatCard, {
      props: {
        label: 'Test',
        value: 100
      },
      slots: {
        icon: '<span class="test-icon">📊</span>'
      }
    })

    expect(wrapper.find('.test-icon').exists()).toBe(true)
    expect(wrapper.text()).toContain('📊')
  })

  it('renders default icon when slot not provided', () => {
    const wrapper = mount(StatCard, {
      props: {
        label: 'Test',
        value: 100
      }
    })

    expect(wrapper.find('.stat-icon svg').exists()).toBe(true)
  })
})
