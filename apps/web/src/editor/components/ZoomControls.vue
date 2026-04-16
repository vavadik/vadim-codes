<template>
  <div class="zoom-controls">
    <button class="zoom-btn" title="Zoom out" @click="store.setZoom(store.zoom - 0.1)">−</button>
    <input
      class="zoom-input"
      type="number"
      :value="Math.round(store.zoom * 100)"
      min="25"
      max="400"
      @change="onInput"
    />
    <span class="zoom-pct">%</span>
    <button class="zoom-btn" title="Zoom in" @click="store.setZoom(store.zoom + 0.1)">+</button>
  </div>
</template>

<script setup lang="ts">
import { useEditorStore } from '@/stores/editor';

const store = useEditorStore();

function onInput(e: Event) {
  const val = parseInt((e.target as HTMLInputElement).value, 10);
  if (!isNaN(val)) store.setZoom(val / 100);
}
</script>

<style scoped lang="scss">
.zoom-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--color-base-100);
  border: 1px solid var(--color-base-300);
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 0.8rem;
}

.zoom-btn {
  width: 20px;
  height: 20px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  color: var(--color-base-content);
  border-radius: 3px;

  &:hover {
    background: var(--color-base-200);
  }
}

.zoom-input {
  width: 48px;
  text-align: center;
  border: 1px solid var(--color-base-300);
  border-radius: 4px;
  padding: 2px 4px;
  font-size: 0.8rem;
  background: transparent;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
}

.zoom-pct {
  color: var(--color-base-content);
  opacity: 0.6;
}
</style>
