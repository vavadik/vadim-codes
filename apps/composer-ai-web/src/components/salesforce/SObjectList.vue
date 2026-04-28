<template>
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
          :class="{ 'bg-primary/10 text-primary font-medium': selectedName === obj.name }"
          @click="selectObject(obj.name)"
        >
          <span class="truncate">{{ obj.name }}</span>
          <span v-if="obj.custom" class="badge badge-xs badge-outline ml-auto shrink-0"
            >custom</span
          >
        </button>
      </li>
      <li v-if="filtered.length === 0" class="px-3 py-4 text-sm text-base-content/50 text-center">
        No results
      </li>
    </ul>

    <div class="p-2 border-t border-base-300 text-xs text-base-content/40 text-center">
      {{ filtered.length }} / {{ store.sobjects.length }} objects
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSalesforceStore } from '@/stores/salesforce';

const store = useSalesforceStore();
const router = useRouter();
const route = useRoute();
const filter = ref('');

const selectedName = computed(() => route.params.name as string | undefined);

const filtered = computed(() => {
  const q = filter.value.toLowerCase();
  if (!q) {
    return store.sobjects;
  }
  return store.sobjects.filter(
    (o) => o.name.toLowerCase().includes(q) || o.label.toLowerCase().includes(q)
  );
});

function selectObject(name: string) {
  router.push({ name: 'salesforce', params: { name } });
}

onMounted(() => {
  if (store.sobjects.length === 0) {
    store.fetchSobjects();
  }
});
</script>
