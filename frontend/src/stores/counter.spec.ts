import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCounterStore } from './counter'

describe('Counter Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with zero count', () => {
    const counter = useCounterStore()
    expect(counter.count).toBe(0)
  })

  it('computes double count correctly', () => {
    const counter = useCounterStore()
    expect(counter.doubleCount).toBe(0)
    
    counter.count = 5
    expect(counter.doubleCount).toBe(10)
  })

  it('increments count', () => {
    const counter = useCounterStore()
    expect(counter.count).toBe(0)
    
    counter.increment()
    expect(counter.count).toBe(1)
    
    counter.increment()
    expect(counter.count).toBe(2)
  })

  it('updates doubleCount when incrementing', () => {
    const counter = useCounterStore()
    counter.increment()
    expect(counter.doubleCount).toBe(2)
    
    counter.increment()
    expect(counter.doubleCount).toBe(4)
  })
})
