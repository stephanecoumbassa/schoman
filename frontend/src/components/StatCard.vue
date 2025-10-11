<template>
  <div class="stat-card" :class="variant">
    <div class="stat-icon">
      <slot name="icon">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </slot>
    </div>
    <div class="stat-content">
      <p class="stat-label">{{ label }}</p>
      <p class="stat-value">{{ formattedValue }}</p>
      <p v-if="change !== undefined" class="stat-change" :class="changeClass">
        <span v-if="change > 0">↑</span>
        <span v-else-if="change < 0">↓</span>
        {{ Math.abs(change) }}% {{ changeText }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  label: string;
  value: number | string;
  change?: number;
  changeText?: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  prefix?: string;
  suffix?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  changeText: 'vs mois dernier',
  prefix: '',
  suffix: ''
});

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return `${props.prefix}${props.value.toLocaleString('fr-FR')}${props.suffix}`;
  }
  return `${props.prefix}${props.value}${props.suffix}`;
});

const changeClass = computed(() => {
  if (props.change === undefined) return '';
  return props.change >= 0 ? 'positive' : 'negative';
});
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.stat-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  flex-shrink: 0;
}

.stat-card.primary .stat-icon {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.stat-card.success .stat-icon {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.stat-card.warning .stat-icon {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.stat-card.danger .stat-icon {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.stat-card.info .stat-icon {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: bold;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  line-height: 1;
}

.stat-change {
  font-size: 0.75rem;
  font-weight: 500;
  margin: 0;
}

.stat-change.positive {
  color: #10b981;
}

.stat-change.negative {
  color: #ef4444;
}
</style>
