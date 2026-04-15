<template>
  <aside class="options-panel">
    <p class="options-panel__heading">Properties</p>
    <p class="options-panel__empty">Select an element to edit its properties</p>
  </aside>
</template>

<style scoped lang="scss">
.options-panel {
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

  &__empty {
    font-size: 0.8rem;
    color: var(--color-base-content);
    opacity: 0.4;
    text-align: center;
    padding: 2rem 1rem;
    line-height: 1.5;
  }
}
</style>
