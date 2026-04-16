<template>
  <div class="prop-section">
    <p class="prop-section__heading">Table</p>
    <label class="prop-label">Headers (comma-separated)</label>
    <input class="prop-input" :value="node.head.join(',')" @input="onHeadInput" />
    <label class="prop-label">Rows (JSON array of arrays)</label>
    <textarea
      class="prop-input prop-textarea"
      :value="node.content"
      @input="update('content', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEditorStore } from '@/stores/editor';
import type { TableNode } from '@/editor/types';

const props = defineProps<{ nodeId: string }>();
const store = useEditorStore();
const node = computed(() => store.getNode(props.nodeId) as TableNode);

function update(key: string, e: Event) {
  store.updateNode(props.nodeId, {
    [key]: (e.target as HTMLInputElement | HTMLTextAreaElement).value,
  } as Partial<TableNode>);
}

function onHeadInput(e: Event) {
  const headers = (e.target as HTMLInputElement).value.split(',').map((s) => s.trim());
  const pcts = headers.map(() => Math.floor(100 / headers.length));
  store.updateNode(props.nodeId, { head: headers, headWidthPercentages: pcts });
}
</script>

<style scoped lang="scss">
.prop-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;

  &__heading {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-base-content);
    opacity: 0.5;
    margin: 0 0 4px;
  }
}

.prop-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-base-content);
  opacity: 0.6;
  display: block;
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.prop-input {
  width: 100%;
  border: 1px solid var(--color-base-300);
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 0.82rem;
  background: var(--color-base-100);
  color: var(--color-base-content);

  &:focus {
    outline: 2px solid var(--color-accent);
    outline-offset: -1px;
  }
}

.prop-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: monospace;
}
</style>
