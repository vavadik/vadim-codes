<template>
  <div
    ref="pageRef"
    class="canvas-page"
    :style="pageStyle"
    @click.self="store.deselectAll()"
    @dragover="onDragOver"
    @drop="onDrop"
  >
    <CanvasNode v-for="id in store.rootIds" :key="id" :node-id="id" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useEditorStore } from '@/stores/editor';
import { useDragDrop } from '@/editor/composables/useDragDrop';
import { useCanvasScale } from '@/editor/composables/useCanvasScale';
import CanvasNode from './CanvasNode.vue';

const store = useEditorStore();
const { onPaletteDragOver, onPaletteDrop } = useDragDrop();
const { toPx } = useCanvasScale();

const pageRef = ref<HTMLDivElement>();

const pageStyle = computed(() => ({
  width: `${toPx(store.page.width)}px`,
  height: `${toPx(store.page.height)}px`,
}));

function onDragOver(e: DragEvent) {
  onPaletteDragOver(e);
}

function onDrop(e: DragEvent) {
  if (pageRef.value) onPaletteDrop(e, pageRef.value);
}
</script>

<style scoped lang="scss">
.canvas-page {
  position: relative;
  background: #fff;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  flex-shrink: 0;
  // Pin to light values so page always looks like paper
  color: #111827;
}
</style>
