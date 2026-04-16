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
  background: #f3f4f6;
  border: 1px dashed #d1d5db;
  font-size: 0.75rem;
  color: #9ca3af;
  user-select: none;
}
</style>
