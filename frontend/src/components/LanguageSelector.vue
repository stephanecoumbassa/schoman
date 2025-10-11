<template>
  <div class="language-selector">
    <select 
      v-model="currentLocale" 
      @change="changeLocale"
      class="locale-select"
      :aria-label="t('common.language')"
    >
      <option value="fr">🇫🇷 Français</option>
      <option value="en">🇬🇧 English</option>
      <option value="ar">🇸🇦 العربية</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale, t } = useI18n()
const currentLocale = ref(locale.value)

// Watch for locale changes from other sources
watch(locale, (newLocale) => {
  currentLocale.value = newLocale
})

const changeLocale = () => {
  locale.value = currentLocale.value
  localStorage.setItem('locale', currentLocale.value)
  
  // Update document direction for RTL languages
  document.documentElement.dir = currentLocale.value === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.lang = currentLocale.value
}

// Set initial direction on mount
if (currentLocale.value === 'ar') {
  document.documentElement.dir = 'rtl'
}
document.documentElement.lang = currentLocale.value
</script>

<style scoped>
.language-selector {
  display: inline-block;
}

.locale-select {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
}

.locale-select:hover {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.locale-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.locale-select option {
  padding: 0.5rem;
}
</style>
