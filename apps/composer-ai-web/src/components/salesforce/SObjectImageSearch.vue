<template>
  <div class="space-y-4">
    <form class="flex gap-2" @submit.prevent="handleSearch">
      <input
        v-model="prompt"
        type="text"
        placeholder="Describe what you're looking for…"
        class="input input-sm flex-1"
        :disabled="store.imageSearchLoading"
      />
      <button
        type="submit"
        class="btn btn-sm btn-primary"
        :disabled="!prompt.trim() || store.imageSearchLoading"
      >
        <span v-if="store.imageSearchLoading" class="loading loading-spinner loading-xs" />
        <span v-else>Search</span>
      </button>
    </form>

    <div v-if="store.imageSearchError" class="text-error text-sm">
      {{ store.imageSearchError }}
    </div>

    <div
      v-if="!store.imageSearchLoading && store.imageSearchResults.length === 0 && searched"
      class="py-6 text-center text-sm text-base-content/40"
    >
      No matching images found
    </div>

    <div v-if="store.imageSearchResults.length > 0" class="grid grid-cols-3 gap-4">
      <div
        v-for="result in store.imageSearchResults"
        :key="result.id"
        class="rounded-box border border-base-300 overflow-hidden flex flex-col"
      >
        <div class="relative bg-base-200 aspect-square overflow-hidden">
          <img
            :src="`/api/salesforce/attachments/${result.id}/body`"
            :alt="result.name"
            class="object-contain w-full h-full"
          />
          <span class="absolute top-1.5 right-1.5 badge badge-sm badge-neutral">
            {{ Math.round(result.score * 100) }}%
          </span>
        </div>
        <div class="px-2 py-1.5">
          <p class="text-xs truncate" :title="result.name">{{ result.name }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSalesforceStore } from '@/stores/salesforce';

const store = useSalesforceStore();
const prompt = ref('');
const searched = ref(false);

function handleSearch() {
  const text = prompt.value.trim();
  const record = store.currentRecord;
  if (!text || !record || !store.selectedName) {
    return;
  }
  searched.value = true;
  store.searchImages(store.selectedName, record['Id'] as string, text);
}
</script>
