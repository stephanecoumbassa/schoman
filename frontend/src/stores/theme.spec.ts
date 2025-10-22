import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useThemeStore } from './theme'

describe('Theme Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // Clear localStorage before each test
    localStorage.clear()
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it('initializes with system theme by default', () => {
    const store = useThemeStore()
    expect(store.theme).toBe('system')
  })

  it('loads theme from localStorage', () => {
    localStorage.setItem('theme', 'dark')
    const store = useThemeStore()
    expect(store.theme).toBe('dark')
  })

  it('sets theme and persists to localStorage', () => {
    const store = useThemeStore()
    store.setTheme('dark')
    expect(store.theme).toBe('dark')
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(store.isDark).toBe(true)
  })

  it('toggles theme from light to dark', () => {
    const store = useThemeStore()
    store.setTheme('light')
    expect(store.isDark).toBe(false)
    
    store.toggleTheme()
    expect(store.theme).toBe('dark')
    expect(store.isDark).toBe(true)
  })

  it('toggles theme from dark to light', () => {
    const store = useThemeStore()
    store.setTheme('dark')
    expect(store.isDark).toBe(true)
    
    store.toggleTheme()
    expect(store.theme).toBe('light')
    expect(store.isDark).toBe(false)
  })

  it('respects system preference when theme is system', () => {
    // Mock system preference as dark
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    const store = useThemeStore()
    expect(store.theme).toBe('system')
    expect(store.isDark).toBe(true)
  })

  it('adds dark class to document when dark theme is active', () => {
    const store = useThemeStore()
    store.setTheme('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('removes dark class from document when light theme is active', () => {
    const store = useThemeStore()
    store.setTheme('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
