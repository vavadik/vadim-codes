<template>
  <div class="min-h-screen bg-base-200 flex items-center justify-center">
    <div class="card bg-base-100 shadow-xl w-full max-w-sm">
      <div class="card-body items-center text-center gap-6">
        <h1 class="text-2xl font-bold">composer-ai</h1>
        <p class="text-base-content/60 text-sm">Sign in to continue</p>
        <a :href="`${apiBase}/auth/salesforce`" class="btn btn-primary w-full">
          Sign in with Salesforce
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const apiBase = import.meta.env.VITE_API_URL ?? '/api';
</script>
