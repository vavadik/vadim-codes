<template>
  <AppLayout>
    <div class="flex h-[calc(100vh-65px)]">
      <!-- SObject list -->
      <aside class="w-72 shrink-0 bg-base-100 border-r border-base-300 flex flex-col">
        <div class="p-3 border-b border-base-300">
          <input
            v-model="filter"
            type="text"
            placeholder="Filter objects…"
            class="input input-sm w-full"
          />
        </div>

        <div v-if="store.loading" class="flex justify-center items-center flex-1">
          <span class="loading loading-spinner loading-sm" />
        </div>

        <ul v-else class="overflow-y-auto flex-1 py-1">
          <li v-for="obj in filtered" :key="obj.name">
            <button
              class="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-base-200 transition-colors"
              :class="{ 'bg-primary/10 text-primary font-medium': store.selectedName === obj.name }"
              @click="store.describeSObject(obj.name)"
            >
              <span class="truncate">{{ obj.name }}</span>
              <span v-if="obj.custom" class="badge badge-xs badge-outline ml-auto shrink-0"
                >custom</span
              >
            </button>
          </li>
          <li
            v-if="filtered.length === 0"
            class="px-3 py-4 text-sm text-base-content/50 text-center"
          >
            No results
          </li>
        </ul>

        <div class="p-2 border-t border-base-300 text-xs text-base-content/40 text-center">
          {{ filtered.length }} / {{ store.sobjects.length }} objects
        </div>
      </aside>

      <!-- Describe panel -->
      <main class="flex-1 overflow-y-auto">
        <div
          v-if="!store.selectedName"
          class="flex items-center justify-center h-full text-base-content/40 text-sm"
        >
          Select an object to inspect its fields
        </div>

        <div v-else-if="store.describeLoading" class="flex items-center justify-center h-full">
          <span class="loading loading-spinner loading-md" />
        </div>

        <div v-else-if="store.currentDescribe" class="p-6 space-y-6">
          <div class="flex items-center gap-3">
            <h2 class="text-xl font-semibold">{{ store.currentDescribe.label }}</h2>
            <code class="text-sm text-base-content/60">{{ store.currentDescribe.name }}</code>
            <span v-if="store.currentDescribe.custom" class="badge badge-outline">custom</span>
          </div>

          <div class="flex gap-4 text-sm text-base-content/60">
            <span v-if="store.currentDescribe.queryable">queryable</span>
            <span v-if="store.currentDescribe.createable">createable</span>
            <span v-if="store.currentDescribe.updateable">updateable</span>
            <span v-if="store.currentDescribe.deletable">deletable</span>
          </div>

          <!-- Record lookup -->
          <div class="space-y-3">
            <h3 class="text-sm font-medium">Fetch record by ID</h3>
            <form class="flex gap-2" @submit.prevent="handleFetchRecord">
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

            <div
              v-if="store.currentRecord"
              class="overflow-x-auto rounded-box border border-base-300"
            >
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
          </div>

          <!-- Fields table -->
          <div class="space-y-2">
            <h3 class="text-sm font-medium">Fields</h3>
            <div class="overflow-x-auto rounded-box border border-base-300">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Label</th>
                    <th>Type</th>
                    <th>Required</th>
                    <th>Updateable</th>
                    <th>References</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="field in store.currentDescribe.fields" :key="field.name" class="hover">
                    <td class="font-mono text-xs">{{ field.name }}</td>
                    <td>{{ field.label }}</td>
                    <td>
                      <span class="badge badge-ghost badge-sm">{{ field.type }}</span>
                    </td>
                    <td>
                      <span v-if="!field.nillable && field.createable" class="text-error text-xs"
                        >●</span
                      >
                    </td>
                    <td>
                      <span v-if="field.updateable" class="text-success text-xs">●</span>
                    </td>
                    <td class="font-mono text-xs text-base-content/60">
                      {{ field.referenceTo?.join(', ') }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import AppLayout from '@/components/layouts/AppLayout.vue';
import { useSalesforceStore } from '@/stores/salesforce';

const store = useSalesforceStore();
const filter = ref('');
const recordId = ref('');

const filtered = computed(() => {
  const q = filter.value.toLowerCase();
  if (!q) {
    return store.sobjects;
  }
  return store.sobjects.filter(
    (o) => o.name.toLowerCase().includes(q) || o.label.toLowerCase().includes(q)
  );
});

const recordRows = computed(() => {
  if (!store.currentRecord) {
    return [];
  }
  return Object.entries(store.currentRecord).filter(([key]) => key !== 'attributes');
});

function handleFetchRecord() {
  const id = recordId.value.trim();
  if (id && store.selectedName) {
    store.fetchRecord(store.selectedName, id);
  }
}

onMounted(() => {
  if (store.sobjects.length === 0) {
    store.fetchSobjects();
  }
});
</script>
