<template>
  <div>
    <div v-if="store.imagesLoading" class="flex justify-center py-8">
      <span class="loading loading-spinner loading-md" />
    </div>

    <div v-else-if="store.imagesError" class="text-error text-sm py-4">
      {{ store.imagesError }}
    </div>

    <div
      v-else-if="store.imageAttachments.length === 0"
      class="py-8 text-center text-sm text-base-content/40"
    >
      No image attachments for this record
    </div>

    <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      <div
        v-for="img in store.imageAttachments"
        :key="img.id"
        class="rounded-box border border-base-300 overflow-hidden flex flex-col"
      >
        <div class="bg-base-200 flex items-center justify-center aspect-square overflow-hidden">
          <img
            :src="`/api/salesforce/attachments/${img.id}/body`"
            :alt="img.name"
            class="object-contain w-full h-full"
            loading="lazy"
          />
        </div>
        <div class="px-2 py-1.5">
          <p class="text-xs truncate" :title="img.name">{{ img.name }}</p>
          <p class="text-xs text-base-content/40">{{ formatBytes(img.bodyLength) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useSalesforceStore } from '@/stores/salesforce';

const store = useSalesforceStore();

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

watch(
  () => store.currentRecord,
  (record) => {
    const id = record?.['Id'] as string | undefined;
    if (id && store.selectedName && store.imagesRecordId !== id) {
      store.fetchImageAttachments(store.selectedName, id);
    }
  },
  { immediate: true }
);
</script>
