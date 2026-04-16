<template>
  <aside class="properties-panel">
    <template v-if="node">
      <p class="properties-panel__title">Properties</p>
      <div class="properties-panel__scroll">
        <BaseProps :node-id="node.id" />
        <hr class="properties-panel__divider" />
        <TextProps v-if="node.kind === 'text'" :node-id="node.id" />
        <ImageProps v-else-if="node.kind === 'image'" :node-id="node.id" />
        <TableProps v-else-if="node.kind === 'table'" :node-id="node.id" />
        <ContainerProps v-else-if="node.kind === 'container'" :node-id="node.id" />
      </div>
    </template>
    <div v-else class="properties-panel__empty">
      <p>Select an element</p>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEditorStore } from '@/stores/editor';
import BaseProps from './props/BaseProps.vue';
import TextProps from './props/TextProps.vue';
import ImageProps from './props/ImageProps.vue';
import TableProps from './props/TableProps.vue';
import ContainerProps from './props/ContainerProps.vue';

const store = useEditorStore();
const node = computed(() => store.selectedNode);
</script>

<style scoped lang="scss">
.properties-panel {
  width: 240px;
  flex-shrink: 0;
  border-left: 1px solid var(--color-base-300);
  background: var(--color-base-100);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__title {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-base-content);
    opacity: 0.5;
    padding: 12px 12px 4px;
    margin: 0;
    flex-shrink: 0;
  }

  &__scroll {
    flex: 1;
    overflow-y: auto;
  }

  &__divider {
    border: none;
    border-top: 1px solid var(--color-base-300);
    margin: 4px 0;
  }

  &__empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.82rem;
    color: var(--color-base-content);
    opacity: 0.4;
  }
}
</style>
