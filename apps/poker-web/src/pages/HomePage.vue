<template>
  <AppLayout>
    <div class="hero py-24">
      <div class="hero-content text-center flex-col gap-6">
        <div class="badge badge-primary badge-outline">daisyUI + Tailwind v4 ✓</div>
        <h1 class="text-5xl font-extrabold tracking-tight">Poker app is ready.</h1>
        <p class="text-base-content/60 max-w-md">
          Vue 3 · Tailwind CSS v4 · daisyUI · Pinia · Vue Router · Vite 8 — all wired up and
          working.
        </p>
        <div class="flex gap-3">
          <button class="btn btn-primary">Get started</button>
          <button class="btn btn-ghost">Learn more</button>
        </div>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-6 pb-24 grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div
        v-for="f in features"
        :key="f.title"
        class="card bg-base-100 shadow-sm border border-base-300"
      >
        <div class="card-body gap-1">
          <h2 class="card-title text-base">{{ f.title }}</h2>
          <p class="text-sm text-base-content/60">{{ f.description }}</p>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/components/layouts/AppLayout.vue';

const features = [
  {
    title: 'Vue 3',
    description: 'Composition API with script setup and full TypeScript support.',
  },
  {
    title: 'Tailwind v4',
    description: 'Utility-first CSS with zero config — powered by @tailwindcss/vite.',
  },
  {
    title: 'Pinia',
    description: 'Lightweight, type-safe state management for Vue.',
  },
  {
    title: 'Vite 8',
    description: 'Lightning-fast dev server and optimized production builds.',
  },
];
</script>
