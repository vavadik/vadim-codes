<template>
  <div ref="containerRef" class="monaco-editor"></div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref } from 'vue';
import { useEditor } from '@/composables/useEditor';
import { useTheme } from '@/composables/useTheme';

const props = defineProps<{ onSave?: (code: string) => void }>();

const containerRef = ref<HTMLElement | null>(null);

const { mount, updateTheme } = useEditor();
const { theme } = useTheme();

onMounted(async () => {
  if (containerRef.value) {
    await mount(containerRef.value, props.onSave);
  }
});

watch(theme, (t) => updateTheme(t));
</script>

<style scoped lang="scss">
.monaco-editor {
  width: 100%;
  height: 100%;
}
</style>
