<template>
  <RouterView />
  <PopupContainer />
  <ToastContainer />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import PopupContainer from '@/components/popup/PopupContainer.vue';
import ToastContainer from '@/components/ui/ToastContainer.vue';
import { initAuth } from '@/composables/useAuth';

onMounted(() => {
  initAuth();
});
</script>
