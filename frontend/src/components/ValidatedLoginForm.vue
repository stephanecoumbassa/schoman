<script setup lang="ts">
import { useForm } from 'vee-validate'
import { loginSchema } from '@/composables/useFormValidation'
import { useAuthStore } from '@/stores/auth'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const loading = ref(false)
const errorMessage = ref('')

// Setup form with validation
const { handleSubmit, defineField, errors } = useForm({
  validationSchema: loginSchema,
})

// Define fields
const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')

// Submit handler
const onSubmit = handleSubmit(async (values) => {
  loading.value = true
  errorMessage.value = ''
  
  try {
    await authStore.login(values.email, values.password)
    router.push('/dashboard')
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Erreur de connexion'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <form @submit="onSubmit" class="space-y-6">
    <!-- Email Field -->
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Email
      </label>
      <input
        id="email"
        v-model="email"
        v-bind="emailAttrs"
        type="email"
        placeholder="votre@email.com"
        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        :class="{
          'border-red-500 dark:border-red-400': errors.email,
          'border-gray-300 dark:border-gray-600': !errors.email,
          'bg-white dark:bg-gray-800 text-gray-900 dark:text-white': true,
        }"
      />
      <p v-if="errors.email" class="mt-1 text-sm text-red-600 dark:text-red-400">
        {{ errors.email }}
      </p>
    </div>

    <!-- Password Field -->
    <div>
      <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Mot de passe
      </label>
      <input
        id="password"
        v-model="password"
        v-bind="passwordAttrs"
        type="password"
        placeholder="••••••••"
        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        :class="{
          'border-red-500 dark:border-red-400': errors.password,
          'border-gray-300 dark:border-gray-600': !errors.password,
          'bg-white dark:bg-gray-800 text-gray-900 dark:text-white': true,
        }"
      />
      <p v-if="errors.password" class="mt-1 text-sm text-red-600 dark:text-red-400">
        {{ errors.password }}
      </p>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <p class="text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
    </div>

    <!-- Submit Button -->
    <button
      type="submit"
      :disabled="loading"
      class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
    >
      <span v-if="loading" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
      {{ loading ? 'Connexion...' : 'Se connecter' }}
    </button>
  </form>
</template>

<style scoped>
/* Add focus styles for better UX */
input:focus {
  outline: none;
}
</style>
