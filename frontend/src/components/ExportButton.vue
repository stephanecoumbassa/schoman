<template>
  <div class="export-button">
    <button
      @click="toggleMenu"
      :disabled="loading"
      class="export-btn"
      type="button"
    >
      <svg v-if="!loading" class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <div v-else class="spinner"></div>
      <span>{{ label }}</span>
    </button>

    <div v-if="showMenu" class="dropdown-menu">
      <button
        @click="handleExport('pdf')"
        class="menu-item"
        type="button"
      >
        <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Exporter en PDF
      </button>
      
      <button
        @click="handleExport('excel')"
        class="menu-item"
        type="button"
      >
        <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Exporter en Excel
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  exportType: string; // 'students', 'grades', 'transactions', 'attendance', 'invoice'
  label?: string;
  params?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Exporter',
  params: () => ({})
});

const emit = defineEmits<{
  success: [];
  error: [message: string];
}>();

const showMenu = ref(false);
const loading = ref(false);

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const handleExport = async (format: 'pdf' | 'excel') => {
  showMenu.value = false;
  loading.value = true;

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    // Build URL based on export type
    let url = `http://localhost:3000/api/exports/${props.exportType}/${format}`;
    
    // Add query params if any
    const queryParams = new URLSearchParams();
    Object.entries(props.params).forEach(([key, value]) => {
      if (value) queryParams.append(key, String(value));
    });
    
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    // Get filename from response headers or use default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `export-${props.exportType}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    // Download the file
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    emit('success');
  } catch (error) {
    console.error('Export error:', error);
    emit('error', 'Échec de l\'export. Veuillez réessayer.');
  } finally {
    loading.value = false;
  }
};

// Close menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.export-button')) {
    showMenu.value = false;
  }
};

// Add/remove click listener
import { onMounted, onUnmounted } from 'vue';

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.export-button {
  position: relative;
  display: inline-block;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.export-btn:hover:not(:disabled) {
  background-color: #2563eb;
}

.export-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.icon {
  width: 20px;
  height: 20px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  min-width: 200px;
  z-index: 50;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 0.875rem;
  color: #374151;
}

.menu-item:hover {
  background-color: #f3f4f6;
}

.menu-icon {
  width: 18px;
  height: 18px;
  color: #6b7280;
}
</style>
