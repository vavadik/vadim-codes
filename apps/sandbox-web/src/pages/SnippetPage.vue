<template>
  <AppLayout :loading="loading" :not-found="notFound" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import AppLayout from '@/components/layouts/AppLayout.vue';
import { pendingCode } from '@/composables/useEditor';
import { useSnippet } from '@/composables/useSnippet';

const route = useRoute();
const { loadSnippet } = useSnippet();

const loading = ref(true);
const notFound = ref(false);

onMounted(async () => {
  const id = route.params['id'] as string;
  document.title = `Sandbox — /s/${id}`;

  const snippet = await loadSnippet(id);
  if (snippet) {
    pendingCode.value = snippet.code;
  } else {
    notFound.value = true;
  }
  loading.value = false;
});
</script>
