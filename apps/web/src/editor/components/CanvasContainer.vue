<template>
  <div class="canvas-container" :style="containerStyle">
    <CanvasNode v-for="childId in container.childIds" :key="childId" :node-id="childId" />
    <div v-if="isDropTarget" class="canvas-container__drop-highlight" />
    <div
      v-if="isDropTarget && insertLineStyle"
      class="canvas-container__insert-line"
      :style="insertLineStyle"
    />
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
import type { ContainerNode, EditorNode } from '@/editor/types';
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

/** Walk up the parent chain to get page-absolute position (mm). */
function getNodeAbsPos(nodeId: string): { x: number; y: number } {
  const node = store.getNode(nodeId);
  if (!node) {
    return { x: 0, y: 0 };
  }
  if (node.parentId === null) {
    return { x: node.x, y: node.y };
  }
  const parentPos = getNodeAbsPos(node.parentId);
  return { x: parentPos.x + node.x, y: parentPos.y + node.y };
}

/**
 * Insertion indicator line: a thin indigo line that shows where the dragged item
 * will be inserted within this container.
 */
const insertLineStyle = computed(() => {
  if (!isDropTarget.value || drag.insertIndex === null) {
    return null;
  }

  const c = container.value;
  const isRow = c.flexDirection === 'row' || c.flexDirection === 'row-reverse';

  // Non-dragged children (same list computeInsertIndex uses)
  const children = c.childIds
    .filter((id) => id !== drag.nodeId)
    .map((id) => store.getNode(id))
    .filter((n): n is EditorNode => n !== undefined);

  const idx = drag.insertIndex;
  let linePosMm: number;

  if (children.length === 0 || idx === 0) {
    linePosMm = isRow ? c.paddingLeft : c.paddingTop;
  } else if (idx >= children.length) {
    const last = children[children.length - 1]!;
    linePosMm = isRow ? last.x + last.width : last.y + last.height;
  } else {
    // Midpoint of the gap between child[idx-1] and child[idx]
    const prev = children[idx - 1]!;
    const curr = children[idx]!;
    linePosMm = isRow ? (prev.x + prev.width + curr.x) / 2 : (prev.y + prev.height + curr.y) / 2;
  }

  const linePosPx = toPx(linePosMm);

  if (isRow) {
    return {
      position: 'absolute' as const,
      left: `${linePosPx}px`,
      top: '3px',
      bottom: '3px',
      width: '2px',
      backgroundColor: 'var(--color-accent)',
      pointerEvents: 'none' as const,
      zIndex: 10,
      transform: 'translateX(-1px)',
    };
  } else {
    return {
      position: 'absolute' as const,
      top: `${linePosPx}px`,
      left: '3px',
      right: '3px',
      height: '2px',
      backgroundColor: 'var(--color-accent)',
      pointerEvents: 'none' as const,
      zIndex: 10,
      transform: 'translateY(-1px)',
    };
  }
});
</script>

<style scoped lang="scss">
.canvas-container {
  &__drop-highlight {
    position: absolute;
    inset: 0;
    border: 2px dashed var(--color-accent);
    pointer-events: none;
    border-radius: 2px;
  }

  &__insert-line {
    border-radius: 1px;
  }

  &__empty {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    color: color-mix(in oklch, var(--color-base-content) 35%, transparent);
    pointer-events: none;
    user-select: none;
  }
}
</style>
