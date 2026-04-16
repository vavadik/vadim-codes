<template>
  <Teleport to="body">
    <div v-if="drag.active && node" class="drag-ghost" :style="ghostStyle">
      <span class="drag-ghost__label">{{ node.kind }}</span>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEditorStore } from '@/stores/editor';
import { useDragDrop } from '@/editor/composables/useDragDrop';
import { useCanvasScale } from '@/editor/composables/useCanvasScale';

const store = useEditorStore();
const { drag } = useDragDrop();
const { toPx } = useCanvasScale();

const node = computed(() => (drag.nodeId ? store.getNode(drag.nodeId) : null));

const ghostStyle = computed(() => {
  if (!node.value) return {};
  return {
    position: 'fixed' as const,
    left: `${drag.ghostX}px`,
    top: `${drag.ghostY}px`,
    width: `${toPx(node.value.width)}px`,
    height: `${toPx(node.value.height)}px`,
    pointerEvents: 'none' as const,
    opacity: 0.5,
    zIndex: 9999,
    background: '#6366f1',
    border: '2px solid #4f46e5',
    borderRadius: '2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
});
</script>

<style scoped lang="scss">
.drag-ghost {
  &__label {
    font-size: 0.7rem;
    color: #fff;
    text-transform: capitalize;
    user-select: none;
  }
}
</style>
