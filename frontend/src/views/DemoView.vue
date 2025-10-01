<script setup lang="ts">
import Button from '../components/ui/Button.vue'
</script>

<template>
  <div class="max-w-4xl mx-auto p-8">
    <h1 class="text-4xl font-bold text-gray-900 mb-4">
      Tailwind CSS + Shadcn/ui Demo
    </h1>
    
    <p class="text-gray-600 mb-8">
      This page demonstrates that Tailwind CSS is properly configured and working.
    </p>

    <div class="space-y-6">
      <!-- Card with Tailwind utilities -->
      <div class="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
        <h2 class="text-2xl font-semibold mb-4 text-gray-800">Welcome to Schoman</h2>
        <p class="text-gray-600 mb-4">
          A full-stack application with Vue.js 3, TypeScript, Tailwind CSS, and a Node.js backend.
        </p>
        
        <div class="flex flex-wrap gap-3">
          <Button>Default Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="ghost">Ghost Button</Button>
        </div>
      </div>

      <!-- Grid layout demo -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 class="font-bold text-blue-900 mb-2">Frontend</h3>
          <p class="text-sm text-blue-700">Vue 3 + TypeScript + Tailwind</p>
        </div>
        <div class="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 class="font-bold text-green-900 mb-2">Backend</h3>
          <p class="text-sm text-green-700">Node.js + Express + MongoDB</p>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h3 class="font-bold text-purple-900 mb-2">Auth</h3>
          <p class="text-sm text-purple-700">JWT + Bcrypt</p>
        </div>
      </div>

      <!-- Flexbox demo -->
      <div class="flex items-center justify-between bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-gray-200">
        <div>
          <h3 class="text-xl font-semibold text-gray-900">Ready to start?</h3>
          <p class="text-gray-600">Start building your application now!</p>
        </div>
        <Button size="lg">Get Started</Button>
      </div>
    </div>
  </div>
</template>
