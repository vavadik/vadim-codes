<template>
  <RouterView />
  <PopupContainer />
</template>

<script setup lang="ts">
import PopupContainer from '@/components/popup/PopupContainer.vue';
import { apiClient } from '@/composables/useApiClient';
import { onMounted } from 'vue';

onMounted(async () => {
  const response = await apiClient.health();
  console.log(response);
});
</script>
