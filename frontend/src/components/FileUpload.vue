<template>
  <div class="file-upload">
    <div 
      class="upload-area"
      :class="{ 'dragging': isDragging }"
      @click="triggerFileInput"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        :multiple="multiple"
        @change="handleFileSelect"
        class="hidden"
      />
      
      <div v-if="!uploading && !uploadedFile" class="upload-placeholder">
        <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p class="upload-text">{{ label }}</p>
        <p class="upload-hint">{{ hint }}</p>
      </div>

      <div v-if="uploading" class="uploading">
        <div class="spinner"></div>
        <p>Uploading...</p>
      </div>

      <div v-if="uploadedFile && !uploading" class="uploaded-file">
        <img v-if="isImage" :src="uploadedFile" :alt="fileName" class="uploaded-image" />
        <div v-else class="file-info">
          <svg class="file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>{{ fileName }}</span>
        </div>
        <button @click.stop="removeFile" class="remove-btn" type="button">
          <svg class="remove-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <p v-if="error" class="error-message">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  label?: string;
  hint?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  uploadType?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Click to upload or drag and drop',
  hint: 'PNG, JPG, GIF up to 5MB',
  accept: 'image/*',
  multiple: false,
  maxSize: 5,
  uploadType: 'misc'
});

const emit = defineEmits<{
  upload: [file: File, url: string];
  remove: [];
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const uploading = ref(false);
const uploadedFile = ref<string | null>(null);
const fileName = ref<string>('');
const error = ref<string>('');

const isImage = computed(() => {
  return props.accept.includes('image');
});

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleDragOver = (e: DragEvent) => {
  isDragging.value = true;
};

const handleDragLeave = (e: DragEvent) => {
  isDragging.value = false;
};

const handleDrop = (e: DragEvent) => {
  isDragging.value = false;
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    handleFiles(files);
  }
};

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    handleFiles(target.files);
  }
};

const handleFiles = async (files: FileList) => {
  error.value = '';
  const file = files[0];
  
  if (!file) {
    error.value = 'No file selected';
    return;
  }

  // Validate file size
  if (file.size > props.maxSize * 1024 * 1024) {
    error.value = `File size exceeds ${props.maxSize}MB`;
    return;
  }

  // Validate file type
  if (props.accept !== '*' && !file.type.match(props.accept.replace('/*', ''))) {
    error.value = 'Invalid file type';
    return;
  }

  fileName.value = file.name;
  uploading.value = true;

  try {
    // Upload file
    const formData = new FormData();
    formData.append(isImage.value ? 'avatar' : 'file', file);
    formData.append('uploadType', props.uploadType);

    const token = localStorage.getItem('token');
    const endpoint = isImage.value ? '/api/uploads/avatar' : '/api/uploads/file';
    
    const response = await fetch(`http://localhost:3000${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    const fileUrl = isImage.value ? data.avatar.path : data.file.path;
    uploadedFile.value = `http://localhost:3000${fileUrl}`;
    
    emit('upload', file, fileUrl);
  } catch (err) {
    error.value = 'Upload failed. Please try again.';
    console.error('Upload error:', err);
  } finally {
    uploading.value = false;
  }
};

const removeFile = () => {
  uploadedFile.value = null;
  fileName.value = '';
  error.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  emit('remove');
};
</script>

<style scoped>
.file-upload {
  width: 100%;
}

.upload-area {
  position: relative;
  border: 2px dashed #cbd5e0;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f7fafc;
}

.upload-area:hover,
.upload-area.dragging {
  border-color: #4299e1;
  background-color: #ebf8ff;
}

.hidden {
  display: none;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.upload-icon {
  width: 48px;
  height: 48px;
  color: #718096;
}

.upload-text {
  font-size: 1rem;
  font-weight: 500;
  color: #2d3748;
  margin: 0;
}

.upload-hint {
  font-size: 0.875rem;
  color: #718096;
  margin: 0;
}

.uploading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #4299e1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.uploaded-file {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.uploaded-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  object-fit: cover;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.file-icon {
  width: 24px;
  height: 24px;
  color: #4299e1;
}

.remove-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 32px;
  height: 32px;
  background-color: #fc8181;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.remove-btn:hover {
  background-color: #f56565;
}

.remove-icon {
  width: 16px;
  height: 16px;
  color: white;
}

.error-message {
  margin-top: 0.5rem;
  color: #f56565;
  font-size: 0.875rem;
}
</style>
