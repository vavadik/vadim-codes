<template>
  <div class="space-y-3">
    <h3 class="text-sm font-medium">Fetch record by ID</h3>
    <form class="flex gap-2" @submit.prevent="handleFetch">
      <input
        v-model="recordId"
        type="text"
        placeholder="Record ID…"
        class="input input-sm flex-1 font-mono"
      />
      <button
        type="submit"
        class="btn btn-sm btn-primary"
        :disabled="!recordId.trim() || store.recordLoading"
      >
        <span v-if="store.recordLoading" class="loading loading-spinner loading-xs" />
        <span v-else>Fetch</span>
      </button>
    </form>

    <div v-if="store.recordError" class="text-error text-sm">{{ store.recordError }}</div>

    <template v-if="store.currentRecord">
      <div role="tablist" class="tabs tabs-border tabs-sm">
        <button
          role="tab"
          class="tab"
          :class="{ 'tab-active': activeTab === 'values' }"
          @click="activeTab = 'values'"
        >
          Values
        </button>
        <button
          v-if="hasAttachments"
          role="tab"
          class="tab"
          :class="{ 'tab-active': activeTab === 'images' }"
          @click="activeTab = 'images'"
        >
          Images
          <span v-if="store.imageAttachments.length > 0" class="ml-1"
            >({{ store.imageAttachments.length }})</span
          >
        </button>
        <button
          v-if="hasAttachments"
          role="tab"
          class="tab"
          :class="{ 'tab-active': activeTab === 'search' }"
          @click="activeTab = 'search'"
        >
          Image Search
        </button>
      </div>

      <div v-if="activeTab === 'values'" class="overflow-x-auto rounded-box border border-base-300">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="[key, val] in recordRows" :key="key" class="hover">
              <td class="font-mono text-xs text-base-content/70">{{ key }}</td>
              <td class="text-sm break-all">{{ val ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <SObjectImagesTab v-else-if="activeTab === 'images'" />
      <SObjectImageSearch v-else-if="activeTab === 'search'" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useSalesforceStore } from '@/stores/salesforce';
import SObjectImagesTab from './SObjectImagesTab.vue';
import SObjectImageSearch from './SObjectImageSearch.vue';

const store = useSalesforceStore();
const recordId = ref('');
const activeTab = ref<'values' | 'images' | 'search'>('values');

const hasAttachments = computed(
  () =>
    store.currentDescribe?.childRelationships.some(
      (r) => r.childSObject === 'Attachment' && !r.deprecatedAndHidden
    ) ?? false
);

const recordRows = computed(() => {
  if (!store.currentRecord) {
    return [];
  }
  return Object.entries(store.currentRecord).filter(([key]) => key !== 'attributes');
});

function handleFetch() {
  const id = recordId.value.trim();
  if (id && store.selectedName) {
    store.fetchRecord(store.selectedName, id);
  }
}

// Reset to values tab when the selected object changes
watch(
  () => store.selectedName,
  () => {
    activeTab.value = 'values';
  }
);
</script>
