<template>
  <div class="canvas-wrapper" @dragover.prevent @drop="onDrop">
    <div ref="paperRef" class="canvas-paper">
      <CanvasElement v-for="el in store.elements" :key="el.id" :element="el" />
      <div v-if="!store.elements.length" class="canvas-paper__empty">
        Drag components here to start building your PDF
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useEditorStore } from '@/stores/editor';
import type { ElementType } from '@/stores/editor';
import CanvasElement from './CanvasElement.vue';

const MM_TO_PX = 3;

const store = useEditorStore();
const paperRef = ref<HTMLDivElement>();

const defaultSizes: Record<ElementType, { width: number; height: number; content: string }> = {
  text: { width: 80, height: 10, content: 'Text' },
  table: { width: 100, height: 40, content: 'Header 1,Header 2\nRow 1,Row 2' },
  block: { width: 60, height: 30, content: '' },
};

function onDrop(event: DragEvent) {
  const type = event.dataTransfer?.getData('componentType') as ElementType | undefined;
  if (!type || !paperRef.value) return;

  const rect = paperRef.value.getBoundingClientRect();
  const rawX = event.clientX - rect.left;
  const rawY = event.clientY - rect.top;

  const { width, height, content } = defaultSizes[type];

  // Center element on drop point, clamped to paper bounds
  const paperWidthMm = 210;
  const paperHeightMm = 297;
  const x = Math.min(Math.max(rawX / MM_TO_PX - width / 2, 0), paperWidthMm - width);
  const y = Math.min(Math.max(rawY / MM_TO_PX - height / 2, 0), paperHeightMm - height);

  store.addElement({ type, x, y, width, height, content });
}
</script>

<style scoped lang="scss">
.canvas-wrapper {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem;
  min-height: 100%;
}

.canvas-paper {
  position: relative;
  // A4: 210 × 297 mm at 3 px/mm
  width: 630px;
  height: 891px;
  background: #ffffff;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  flex-shrink: 0;

  &__empty {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    color: var(--color-base-content);
    opacity: 0.4;
    pointer-events: none;
    text-align: center;
    padding: 2rem;
  }
}
</style>
