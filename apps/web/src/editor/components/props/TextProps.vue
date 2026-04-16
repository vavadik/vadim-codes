<template>
  <div class="prop-section">
    <p class="prop-section__heading">Text</p>

    <label class="prop-label">Content</label>
    <textarea
      class="prop-input prop-textarea"
      :value="node.content"
      @input="update('content', $event)"
    />

    <div class="prop-row">
      <div class="prop-field">
        <label class="prop-label">Font size (pt)</label>
        <input
          class="prop-input"
          type="number"
          min="4"
          max="200"
          :value="node.fontSize"
          @input="updateNum('fontSize', $event)"
        />
      </div>
      <div class="prop-field">
        <label class="prop-label">Line height</label>
        <input
          class="prop-input"
          type="number"
          min="0.5"
          max="5"
          step="0.1"
          :value="node.lineHeight"
          @input="updateNum('lineHeight', $event)"
        />
      </div>
    </div>

    <label class="prop-label">Alignment</label>
    <select class="prop-input" :value="node.alignment" @change="update('alignment', $event)">
      <option value="left">Left</option>
      <option value="center">Center</option>
      <option value="right">Right</option>
      <option value="justify">Justify</option>
    </select>

    <label class="prop-label">Vertical alignment</label>
    <select
      class="prop-input"
      :value="node.verticalAlignment"
      @change="update('verticalAlignment', $event)"
    >
      <option value="top">Top</option>
      <option value="middle">Middle</option>
      <option value="bottom">Bottom</option>
    </select>

    <div class="prop-row">
      <div class="prop-field">
        <label class="prop-label">Font color</label>
        <input
          class="prop-input prop-color"
          type="color"
          :value="node.fontColor"
          @input="update('fontColor', $event)"
        />
      </div>
      <div class="prop-field">
        <label class="prop-label">BG color</label>
        <input
          class="prop-input prop-color"
          type="color"
          :value="node.backgroundColor === 'transparent' ? '#ffffff' : node.backgroundColor"
          @input="update('backgroundColor', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEditorStore } from '@/stores/editor';
import type { TextNode } from '@/editor/types';

const props = defineProps<{ nodeId: string }>();
const store = useEditorStore();
const node = computed(() => store.getNode(props.nodeId) as TextNode);

function update(key: string, e: Event) {
  store.updateNode(props.nodeId, {
    [key]: (e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value,
  } as Partial<TextNode>);
}

function updateNum(key: string, e: Event) {
  const val = parseFloat((e.target as HTMLInputElement).value);
  if (!isNaN(val)) store.updateNode(props.nodeId, { [key]: val } as Partial<TextNode>);
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
    outline: 2px solid #6366f1;
    outline-offset: -1px;
  }
}

.prop-textarea {
  resize: vertical;
  min-height: 60px;
}

.prop-color {
  padding: 2px;
  height: 32px;
  cursor: pointer;
}

.prop-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.prop-field {
  display: flex;
  flex-direction: column;
}
</style>
