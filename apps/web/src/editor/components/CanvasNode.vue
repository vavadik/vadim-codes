<template>
  <div
    class="canvas-node"
    :class="{
      'canvas-node--selected': isSelected,
      'canvas-node--outlined': store.showOutlines && !isSelected,
      'canvas-node--dragging': drag.active && drag.nodeId === nodeId,
    }"
    :style="nodeStyle"
    @mousedown.stop="onMouseDown"
  >
    <component :is="childComponent" :node-id="nodeId" />
    <SelectionOverlay v-if="isSelected" :node-id="nodeId" />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { useEditorStore } from '@/stores/editor';
import { useDragDrop } from '@/editor/composables/useDragDrop';
import { useCanvasScale } from '@/editor/composables/useCanvasScale';
import type { NodeKind } from '@/editor/types';
import SelectionOverlay from './SelectionOverlay.vue';

// Lazy load to break circular: CanvasContainer → CanvasNode → CanvasContainer
const componentMap: Record<NodeKind, ReturnType<typeof defineAsyncComponent>> = {
  text: defineAsyncComponent(() => import('./CanvasText.vue')),
  image: defineAsyncComponent(() => import('./CanvasImage.vue')),
  table: defineAsyncComponent(() => import('./CanvasTable.vue')),
  container: defineAsyncComponent(() => import('./CanvasContainer.vue')),
};

const props = defineProps<{ nodeId: string }>();
const store = useEditorStore();
const { startNodeDrag, drag } = useDragDrop();
const { toPx } = useCanvasScale();

const node = computed(() => store.getNode(props.nodeId));
const isSelected = computed(() => store.selectedId === props.nodeId);
const childComponent = computed(() => (node.value ? componentMap[node.value.kind] : null));

const nodeStyle = computed(() => {
  const n = node.value;
  if (!n) {
    return {};
  }
  return {
    position: 'absolute' as const,
    left: `${toPx(n.x)}px`,
    top: `${toPx(n.y)}px`,
    width: `${toPx(n.width)}px`,
    height: `${toPx(n.height)}px`,
    transform: n.rotate ? `rotate(${n.rotate}deg)` : undefined,
    opacity: n.opacity !== undefined ? n.opacity : undefined,
    cursor: n.parentId === null ? 'move' : 'grab',
  };
});

function onMouseDown(e: MouseEvent) {
  if (e.button !== 0) {
    return;
  }
  store.selectNode(props.nodeId);
  startNodeDrag(props.nodeId, e, e.currentTarget as HTMLElement);
}
</script>

<style scoped lang="scss">
.canvas-node {
  box-sizing: border-box;

  &--selected {
    outline: 2px solid var(--color-canvas-selection);
    outline-offset: 1px;
  }

  &--outlined {
    outline: 1px dotted rgba(0, 0, 0, 0.3);
    outline-offset: 1px;
  }

  &--dragging {
    opacity: 0.3;
  }
}
</style>
