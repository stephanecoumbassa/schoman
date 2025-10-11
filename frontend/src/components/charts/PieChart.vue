<template>
  <div class="chart-container">
    <Pie :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Pie } from 'vue-chartjs';
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
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  height: 300
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

const chartOptions = computed<ChartOptions<'pie'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'right',
      labels: {
        usePointStyle: true,
        padding: 15,
        font: {
          size: 12,
          family: "'Inter', sans-serif"
        },
        generateLabels: (chart) => {
          const data = chart.data;
          if (data.labels && data.datasets.length) {
            const dataset = data.datasets[0];
            if (!dataset) return [];
            
            const total = (dataset.data as number[]).reduce((a, b) => a + b, 0);
            
            return data.labels.map((label, i) => {
              const value = (dataset.data as number[])[i];
              const percentage = value ? ((value / total) * 100).toFixed(1) : '0.0';
              
              return {
                text: `${label}: ${percentage}%`,
                fillStyle: dataset.backgroundColor ? (dataset.backgroundColor as string[])[i] : '#000',
                hidden: false,
                index: i
              };
            });
          }
          return [];
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
</style>
