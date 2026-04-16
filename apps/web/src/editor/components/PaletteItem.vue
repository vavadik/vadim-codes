<template>
  <div class="palette-item" draggable="true" :title="label" @dragstart="onDragStart">
    <span class="palette-item__icon">{{ icon }}</span>
    <span class="palette-item__label">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import type { NodeKind } from '@/editor/types';

const props = defineProps<{
  kind: NodeKind;
  label: string;
  icon: string;
}>();

function onDragStart(e: DragEvent) {
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('editor/kind', props.kind);
  }
}
</script>

<style scoped lang="scss">
.palette-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: grab;
  user-select: none;
  font-size: 0.85rem;
  color: var(--color-base-content);
  transition: background 0.1s;

  &:hover {
    background: var(--color-base-200);
  }

  &:active {
    cursor: grabbing;
  }

  &__icon {
    font-size: 1.1rem;
    width: 24px;
    text-align: center;
    flex-shrink: 0;
  }

  &__label {
    font-weight: 500;
  }
}
</style>
