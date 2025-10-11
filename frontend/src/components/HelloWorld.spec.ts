import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HelloWorld from './HelloWorld.vue'

describe('HelloWorld Component', () => {
  it('renders props.msg correctly', () => {
    const msg = 'Hello Vitest!'
    const wrapper = mount(HelloWorld, {
      props: { msg }
    })

    expect(wrapper.text()).toContain(msg)
  })

  it('renders the greeting heading', () => {
    const wrapper = mount(HelloWorld, {
      props: { msg: 'Test' }
    })

    const heading = wrapper.find('h1')
    expect(heading.exists()).toBe(true)
    expect(heading.text()).toBe('Test')
  })

  it('contains Vite and Vue 3 links', () => {
    const wrapper = mount(HelloWorld, {
      props: { msg: 'Test' }
    })

    const links = wrapper.findAll('a')
    expect(links.length).toBeGreaterThanOrEqual(2)
    
    const viteLink = links.find(link => link.attributes('href')?.includes('vite.dev'))
    const vueLink = links.find(link => link.attributes('href')?.includes('vuejs.org'))
    
    expect(viteLink).toBeDefined()
    expect(vueLink).toBeDefined()
  })

  it('applies green class to h1', () => {
    const wrapper = mount(HelloWorld, {
      props: { msg: 'Test' }
    })

    const heading = wrapper.find('h1')
    expect(heading.classes()).toContain('green')
  })

  it('renders with default greetings div', () => {
    const wrapper = mount(HelloWorld, {
      props: { msg: 'Test' }
    })

    const greetingsDiv = wrapper.find('.greetings')
    expect(greetingsDiv.exists()).toBe(true)
  })
})
