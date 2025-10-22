<script setup lang="ts">
import { ref, computed } from 'vue'
import { api } from '@/services/api'

interface Props {
  modelValue?: string[]
  maxFiles?: number
  maxSizeMB?: number
  acceptedTypes?: string
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  maxFiles: 5,
  maxSizeMB: 5,
  acceptedTypes: 'image/*,application/pdf,.doc,.docx,.xls,.xlsx',
  label: 'Pièces jointes',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const attachments = ref<string[]>(props.modelValue || [])
const uploading = ref(false)
const uploadProgress = ref(0)
const error = ref('')

const fileInput = ref<HTMLInputElement>()

// Computed properties
const canAddMore = computed(() => attachments.value.length < props.maxFiles)
const maxSizeBytes = computed(() => props.maxSizeMB * 1024 * 1024)

// Get file name from path
const getFileName = (path: string): string => {
  return path.split('/').pop() || path
}

// Get file extension
const getFileExtension = (path: string): string => {
  const fileName = getFileName(path)
  const parts = fileName.split('.')
  return parts.length > 1 ? parts.pop()!.toLowerCase() : ''
}

// Get file icon based on extension
const getFileIcon = (path: string): string => {
  const ext = getFileExtension(path)
  const iconMap: Record<string, string> = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    xls: '📊',
    xlsx: '📊',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    webp: '🖼️',
  }
  return iconMap[ext] || '📎'
}

// Check if file is an image
const isImage = (path: string): boolean => {
  const ext = getFileExtension(path)
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
}

// Open file picker
const openFilePicker = () => {
  fileInput.value?.click()
}

// Handle file selection
const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (!files || files.length === 0) return

  // Check if we can add more files
  if (attachments.value.length + files.length > props.maxFiles) {
    error.value = `Vous ne pouvez ajouter que ${props.maxFiles} fichiers maximum`
    return
  }

  // Validate file sizes
  for (const file of Array.from(files)) {
    if (file.size > maxSizeBytes.value) {
      error.value = `Le fichier "${file.name}" dépasse la taille maximale de ${props.maxSizeMB}MB`
      return
    }
  }

  // Upload files
  await uploadFiles(Array.from(files))

  // Reset input
  target.value = ''
}

// Upload files
const uploadFiles = async (files: File[]) => {
  uploading.value = true
  error.value = ''
  uploadProgress.value = 0

  try {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })
    formData.append('uploadType', 'attachments')

    const response = await api.post('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        }
      },
    })

    if (response.data?.data?.files) {
      const newAttachments = [...attachments.value, ...response.data.data.files]
      attachments.value = newAttachments
      emit('update:modelValue', newAttachments)
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors du téléchargement'
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

// Remove attachment
const removeAttachment = (index: number) => {
  const newAttachments = attachments.value.filter((_, i) => i !== index)
  attachments.value = newAttachments
  emit('update:modelValue', newAttachments)
}

// View attachment
const viewAttachment = (path: string) => {
  window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/uploads/${path}`, '_blank')
}
</script>

<template>
  <div class="attachment-manager">
    <!-- Label -->
    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {{ label }}
      <span v-if="maxFiles > 1" class="text-gray-500 dark:text-gray-400 text-xs ml-2">
        ({{ attachments.length }}/{{ maxFiles }})
      </span>
    </label>

    <!-- Attachments List -->
    <div v-if="attachments.length > 0" class="space-y-2 mb-3">
      <div
        v-for="(attachment, index) in attachments"
        :key="index"
        class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <!-- Icon/Preview -->
        <div class="flex-shrink-0">
          <img
            v-if="isImage(attachment)"
            :src="`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/uploads/${attachment}`"
            :alt="getFileName(attachment)"
            class="w-12 h-12 object-cover rounded"
          />
          <div v-else class="w-12 h-12 flex items-center justify-center text-2xl bg-gray-200 dark:bg-gray-700 rounded">
            {{ getFileIcon(attachment) }}
          </div>
        </div>

        <!-- File Info -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
            {{ getFileName(attachment) }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ getFileExtension(attachment).toUpperCase() }}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="viewAttachment(attachment)"
            class="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
            title="Voir"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            type="button"
            @click="removeAttachment(index)"
            class="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            title="Supprimer"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Upload Button -->
    <div v-if="canAddMore">
      <input
        ref="fileInput"
        type="file"
        :accept="acceptedTypes"
        :multiple="maxFiles > 1"
        class="hidden"
        @change="handleFileSelect"
      />

      <button
        type="button"
        @click="openFilePicker"
        :disabled="uploading"
        class="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
        :class="{
          'opacity-50 cursor-not-allowed': uploading,
          'cursor-pointer': !uploading,
        }"
      >
        <svg v-if="!uploading" class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <div v-else class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{ uploading ? `Téléchargement... ${uploadProgress}%` : 'Ajouter des fichiers' }}
        </span>
      </button>

      <!-- Help text -->
      <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Formats acceptés: PDF, Word, Excel, Images (max {{ maxSizeMB }}MB par fichier)
      </p>
    </div>

    <!-- Error message -->
    <div v-if="error" class="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
    </div>
  </div>
</template>

<style scoped>
.attachment-manager {
  @apply w-full;
}
</style>
