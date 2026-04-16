<template>
  <aside class="element-palette">
    <p class="element-palette__title">Elements</p>
    <div class="element-palette__list">
      <PaletteItem kind="text" label="Text" icon="T" />
      <PaletteItem kind="image" label="Image" icon="🖼" />
      <PaletteItem kind="table" label="Table" icon="⊞" />
      <PaletteItem kind="container" label="Flex Container" icon="▣" />
    </div>
    <p class="element-palette__hint">Drag onto the canvas</p>
  </aside>
</template>

<script setup lang="ts">
import PaletteItem from './PaletteItem.vue';
</script>

<style scoped lang="scss">
.element-palette {
  width: 180px;
  flex-shrink: 0;
  border-right: 1px solid var(--color-base-300);
  background: var(--color-base-100);
  padding: 1rem 0;
  overflow-y: auto;

  &__title {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-base-content);
    opacity: 0.5;
    padding: 0 12px;
    margin-bottom: 6px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__hint {
    font-size: 0.7rem;
    color: var(--color-base-content);
    opacity: 0.4;
    padding: 12px 12px 0;
    text-align: center;
  }
}
</style>
