<template>
  <aside class="component-panel">
    <p class="component-panel__heading">Components</p>
    <div class="component-panel__list">
      <div
        v-for="item in components"
        :key="item.type"
        class="component-tile"
        draggable="true"
        @dragstart="onDragStart($event, item.type)"
      >
        <span class="component-tile__icon">{{ item.icon }}</span>
        <span class="component-tile__label">{{ item.label }}</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { ElementType } from '@/stores/editor';

const components: { type: ElementType; label: string; icon: string }[] = [
  { type: 'text', label: 'Text', icon: 'T' },
  { type: 'table', label: 'Table', icon: '⊞' },
  { type: 'block', label: 'Block', icon: '▬' },
];

function onDragStart(event: DragEvent, type: ElementType) {
  event.dataTransfer?.setData('componentType', type);
}
</script>

<style scoped lang="scss">
.component-panel {
  display: flex;
  flex-direction: column;
  padding: 1rem 0.75rem;
  background: var(--color-base-100);
  height: 100%;

  &__heading {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-base-content);
    opacity: 0.5;
    margin-bottom: 0.75rem;
    padding: 0 0.25rem;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
}

.component-tile {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid var(--color-base-300);
  background: var(--color-base-100);
  cursor: grab;
  user-select: none;
  transition:
    background 0.15s,
    border-color 0.15s;

  &:hover {
    background: var(--color-base-200);
    border-color: var(--color-primary);
  }

  &:active {
    cursor: grabbing;
  }

  &__icon {
    font-size: 1rem;
    width: 1.4rem;
    text-align: center;
    font-weight: 700;
    color: var(--color-primary);
  }

  &__label {
    font-size: 0.85rem;
    font-weight: 500;
  }
}
</style>
