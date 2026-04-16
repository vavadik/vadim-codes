<template>
  <div class="canvas-viewport" @click.self="store.deselectAll()" @wheel="onWheel">
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
    e.preventDefault();
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
  background-color: var(--color-base-200);
  background-image: radial-gradient(
    circle,
    color-mix(in oklch, var(--color-base-content) 20%, transparent) 1px,
    transparent 1px
  );
  background-size: 20px 20px;
}

.canvas-scroller {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 100%;
  min-height: 100%;
  box-sizing: border-box;
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
