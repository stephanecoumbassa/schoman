<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface ButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'default',
  size: 'default',
})

const buttonClass = computed(() => {
  const base = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50'
  
  const variants = {
    default: 'bg-green-600 text-white hover:bg-green-700',
    outline: 'border border-green-600 text-green-600 hover:bg-green-50',
    ghost: 'hover:bg-green-50 text-green-600',
  }
  
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3 text-sm',
    lg: 'h-11 px-8',
  }
  
  return cn(base, variants[props.variant], sizes[props.size])
})
</script>

<template>
  <button :class="buttonClass">
    <slot />
  </button>
</template>
