<template>
  <AppLayout>
    <div class="flex h-[calc(100vh-65px)]">
      <SObjectList />

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

        <SObjectDescribePanel v-else-if="store.currentDescribe" :describe="store.currentDescribe" />
      </main>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useRoute } from 'vue-router';
import AppLayout from '@/components/layouts/AppLayout.vue';
import { useSalesforceStore } from '@/stores/salesforce';
import SObjectList from '@/components/salesforce/SObjectList.vue';
import SObjectDescribePanel from '@/components/salesforce/SObjectDescribePanel.vue';

const store = useSalesforceStore();
const route = useRoute();

watch(
  () => route.params.name as string | undefined,
  (name) => {
    if (name && name !== store.selectedName) {
      store.describeSObject(name);
    } else if (!name) {
      store.selectedName = null;
    }
  },
  { immediate: true }
);
</script>
