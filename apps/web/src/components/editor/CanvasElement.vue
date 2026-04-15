<template>
  <div
    class="canvas-el"
    :class="`canvas-el--${element.type}`"
    :style="style"
    @pointerdown.stop="startMove"
  >
    <span v-if="element.type === 'text'" class="canvas-el__text">{{ element.content }}</span>
    <span v-else-if="element.type === 'table'" class="canvas-el__label">Table</span>

    <button class="canvas-el__delete" @click.stop="store.removeElement(element.id)">×</button>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted } from 'vue';
import { useEditorStore } from '@/stores/editor';
import type { EditorElement } from '@/stores/editor';

const props = defineProps<{ element: EditorElement }>();
const store = useEditorStore();

const MM_TO_PX = 3;

const style = computed(() => ({
  left: `${props.element.x * MM_TO_PX}px`,
  top: `${props.element.y * MM_TO_PX}px`,
  width: `${props.element.width * MM_TO_PX}px`,
  height: `${props.element.height * MM_TO_PX}px`,
}));

// Pointer-based move
let startPointerX = 0;
let startPointerY = 0;
let startElX = 0;
let startElY = 0;

function startMove(event: PointerEvent) {
  startPointerX = event.clientX;
  startPointerY = event.clientY;
  startElX = props.element.x;
  startElY = props.element.y;
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', stopMove, { once: true });
}

function onMove(event: PointerEvent) {
  const dx = (event.clientX - startPointerX) / MM_TO_PX;
  const dy = (event.clientY - startPointerY) / MM_TO_PX;
  store.moveElement(props.element.id, startElX + dx, startElY + dy);
}

function stopMove() {
  window.removeEventListener('pointermove', onMove);
}

onUnmounted(() => {
  window.removeEventListener('pointermove', onMove);
  window.removeEventListener('pointerup', stopMove);
});
</script>

<style scoped lang="scss">
.canvas-el {
  position: absolute;
  cursor: move;
  border: 1px solid transparent;
  box-sizing: border-box;
  transition: border-color 0.1s;

  &:hover {
    border-color: var(--color-primary);

    .canvas-el__delete {
      opacity: 1;
    }
  }

  &--text {
    overflow: hidden;
  }

  &--table {
    background: var(--color-base-200);
    border-color: var(--color-base-300) !important;
  }

  &--block {
    background: var(--color-base-300);
    border-color: var(--color-base-content) !important;
    opacity: 0.4;
  }

  &__text {
    font-size: 10px;
    line-height: 1.3;
    display: block;
    padding: 1px 2px;
    white-space: pre-wrap;
    word-break: break-word;
  }

  &__label {
    font-size: 9px;
    color: var(--color-base-content);
    opacity: 0.5;
    padding: 2px 4px;
    display: block;
  }

  &__delete {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--color-error);
    color: #fff;
    border: none;
    font-size: 11px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.1s;
    padding: 0;

    &:hover {
      filter: brightness(0.85);
    }
  }
}
</style>
