<template>
  <div class="canvas-viewport" @click.self="store.deselectAll()" @wheel.prevent="onWheel">
    <div class="canvas-scroller">
      <CanvasPage />
    </div>
    <div class="canvas-zoom-controls">
      <ZoomControls />
    </div>
    <DragGhost />
  </div>
</template>

<script setup lang="ts">
import { useEditorStore } from '@/stores/editor';
import CanvasPage from './CanvasPage.vue';
import ZoomControls from './ZoomControls.vue';
import DragGhost from './DragGhost.vue';

const store = useEditorStore();

function onWheel(e: WheelEvent) {
  if (e.ctrlKey || e.metaKey) {
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    store.setZoom(store.zoom + delta);
  }
}
</script>

<style scoped lang="scss">
.canvas-viewport {
  position: relative;
  flex: 1;
  overflow: auto;
  background: var(--color-base-200);
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.canvas-scroller {
  padding: 2rem;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-width: 100%;
  min-height: 100%;
}

.canvas-zoom-controls {
  position: sticky;
  bottom: 1rem;
  left: 1rem;
  display: flex;
  justify-content: flex-start;
  pointer-events: none;

  > * {
    pointer-events: all;
  }
}
</style>
