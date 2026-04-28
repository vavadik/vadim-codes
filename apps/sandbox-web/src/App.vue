<template>
  <RouterView />
  <PopupContainer />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import PopupContainer from '@/components/popup/PopupContainer.vue';
import { initAuth } from '@/composables/useAuth';

onMounted(() => {
  initAuth();
});
</script>
