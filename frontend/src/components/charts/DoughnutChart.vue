<template>
  <div class="chart-container">
    <Doughnut :data="chartData" :options="chartOptions" />
    <div v-if="showCenterText" class="center-text">
      <div class="center-value">{{ centerValue }}</div>
      <div class="center-label">{{ centerLabel }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import type { ChartOptions } from 'chart.js';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  labels: string[];
  data: number[];
  title?: string;
  height?: number;
  colors?: string[];
  showCenterText?: boolean;
  centerValue?: string;
  centerLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  height: 300,
  showCenterText: false,
  centerValue: '',
  centerLabel: ''
});

const defaultColors = [
  'rgba(59, 130, 246, 0.8)',
  'rgba(16, 185, 129, 0.8)',
  'rgba(245, 158, 11, 0.8)',
  'rgba(239, 68, 68, 0.8)',
  'rgba(139, 92, 246, 0.8)',
  'rgba(236, 72, 153, 0.8)',
  'rgba(6, 182, 212, 0.8)',
  'rgba(251, 146, 60, 0.8)',
];

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [{
    data: props.data,
    backgroundColor: props.colors || defaultColors.slice(0, props.data.length),
    borderColor: '#fff',
    borderWidth: 2,
    hoverOffset: 4
  }]
}));

const chartOptions = computed<ChartOptions<'doughnut'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 15,
        font: {
          size: 12,
          family: "'Inter', sans-serif"
        }
      }
    },
    title: {
      display: !!props.title,
      text: props.title,
      font: {
        size: 16,
        weight: 'bold',
        family: "'Inter', sans-serif"
      },
      padding: {
        bottom: 20
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        size: 13,
        family: "'Inter', sans-serif"
      },
      bodyFont: {
        size: 12,
        family: "'Inter', sans-serif"
      },
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      displayColors: true,
      callbacks: {
        label: function(context) {
          const label = context.label || '';
          const value = context.parsed;
          const total = (context.dataset.data as number[]).reduce((a: number, b: number) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${label}: ${value} (${percentage}%)`;
        }
      }
    }
  }
}));
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: v-bind('`${height}px`');
  display: flex;
  align-items: center;
  justify-content: center;
}

.center-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}

.center-value {
  font-size: 32px;
  font-weight: bold;
  color: #1f2937;
  line-height: 1;
}

.center-label {
  font-size: 14px;
  color: #6b7280;
  margin-top: 8px;
}
</style>
