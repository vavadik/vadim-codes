<template>
  <div class="canvas-image-wrapper">
    <img v-if="node.content" :src="node.content" class="canvas-image" />
    <div v-else class="canvas-image-placeholder">
      <span>Image</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEditorStore } from '@/stores/editor';
import type { ImageNode } from '@/editor/types';

const props = defineProps<{ nodeId: string }>();
const store = useEditorStore();

const node = computed(() => store.getNode(props.nodeId) as ImageNode);
</script>

<style scoped lang="scss">
.canvas-image-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.canvas-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  user-select: none;
}

.canvas-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-base-200);
  border: 1px dashed var(--color-base-300);
  font-size: 0.75rem;
  color: color-mix(in oklch, var(--color-base-content) 40%, transparent);
  user-select: none;
}
</style>
