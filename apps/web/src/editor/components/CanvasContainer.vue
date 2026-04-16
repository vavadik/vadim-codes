<template>
  <div class="canvas-container" :style="containerStyle">
    <CanvasNode v-for="childId in container.childIds" :key="childId" :node-id="childId" />
    <div v-if="isDropTarget" class="canvas-container__drop-highlight" />
    <div v-if="container.childIds.length === 0" class="canvas-container__empty">
      Drop elements here
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEditorStore } from '@/stores/editor';
import { useDragDrop } from '@/editor/composables/useDragDrop';
import { useCanvasScale } from '@/editor/composables/useCanvasScale';
import type { ContainerNode } from '@/editor/types';
// Defer import to avoid circular dependency at module load time
import CanvasNode from './CanvasNode.vue';

const props = defineProps<{ nodeId: string }>();
const store = useEditorStore();
const { drag } = useDragDrop();
const { toPx } = useCanvasScale();

const container = computed(() => store.getNode(props.nodeId) as ContainerNode);
const isDropTarget = computed(() => drag.overContainerId === props.nodeId);

const containerStyle = computed(() => {
  const c = container.value;
  return {
    width: '100%',
    height: '100%',
    position: 'relative' as const,
    backgroundColor: c.backgroundColor === 'transparent' ? undefined : c.backgroundColor,
    border:
      c.borderWidth > 0 ? `${toPx(c.borderWidth * 0.352778)}px solid ${c.borderColor}` : undefined,
    boxSizing: 'border-box' as const,
    overflow: 'hidden',
  };
});
</script>

<style scoped lang="scss">
.canvas-container {
  &__drop-highlight {
    position: absolute;
    inset: 0;
    border: 2px dashed #6366f1;
    pointer-events: none;
    border-radius: 2px;
  }

  &__empty {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    color: #94a3b8;
    pointer-events: none;
    user-select: none;
  }
}
</style>
