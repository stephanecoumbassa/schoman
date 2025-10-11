import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import LanguageSelector from './LanguageSelector.vue'

describe('LanguageSelector Component', () => {
  let i18n: ReturnType<typeof createI18n>

  beforeEach(() => {
    // Create a fresh i18n instance for each test
    i18n = createI18n({
      legacy: false,
      locale: 'fr',
      fallbackLocale: 'fr',
      messages: {
        fr: { common: { language: 'Langue' } },
        en: { common: { language: 'Language' } },
        ar: { common: { language: 'اللغة' } }
      }
    })
  })

  it('renders language selector', () => {
    const wrapper = mount(LanguageSelector, {
      global: {
        plugins: [i18n]
      }
    })

    expect(wrapper.find('select').exists()).toBe(true)
  })

  it('shows all language options', () => {
    const wrapper = mount(LanguageSelector, {
      global: {
        plugins: [i18n]
      }
    })

    const options = wrapper.findAll('option')
    expect(options).toHaveLength(3)
    expect(options[0]?.text()).toContain('Français')
    expect(options[1]?.text()).toContain('English')
    expect(options[2]?.text()).toContain('العربية')
  })

  it('starts with French locale', () => {
    const wrapper = mount(LanguageSelector, {
      global: {
        plugins: [i18n]
      }
    })

    const select = wrapper.find('select')
    expect(select.element.value).toBe('fr')
  })

  it('changes locale when option is selected', async () => {
    const wrapper = mount(LanguageSelector, {
      global: {
        plugins: [i18n]
      }
    })

    const select = wrapper.find('select')
    await select.setValue('en')

    expect(i18n.global.locale.value).toBe('en')
  })

  it('saves locale to localStorage', async () => {
    const wrapper = mount(LanguageSelector, {
      global: {
        plugins: [i18n]
      }
    })

    const select = wrapper.find('select')
    await select.setValue('en')

    expect(localStorage.getItem('locale')).toBe('en')
  })
})
