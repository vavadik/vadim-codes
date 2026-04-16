<template>
  <div class="prop-section">
    <label class="prop-label">Name</label>
    <input class="prop-input" :value="node.name" @input="update('name', $event)" />

    <template v-if="node.parentId === null">
      <div class="prop-row">
        <div class="prop-field">
          <label class="prop-label">X (mm)</label>
          <input
            class="prop-input"
            type="number"
            :value="fmt(node.x)"
            @input="updateNum('x', $event)"
          />
        </div>
        <div class="prop-field">
          <label class="prop-label">Y (mm)</label>
          <input
            class="prop-input"
            type="number"
            :value="fmt(node.y)"
            @input="updateNum('y', $event)"
          />
        </div>
      </div>
    </template>
    <template v-else>
      <div class="prop-row">
        <div class="prop-field">
          <label class="prop-label">X (mm)</label>
          <input class="prop-input" type="number" :value="fmt(node.x)" disabled />
        </div>
        <div class="prop-field">
          <label class="prop-label">Y (mm)</label>
          <input class="prop-input" type="number" :value="fmt(node.y)" disabled />
        </div>
      </div>
      <p class="prop-hint">Position controlled by flex container</p>
      <div class="prop-row">
        <div class="prop-field">
          <label class="prop-label">Flex Grow</label>
          <input
            class="prop-input"
            type="number"
            min="0"
            step="1"
            :value="node.flexGrow ?? 0"
            @input="updateNum('flexGrow', $event)"
          />
        </div>
        <div class="prop-field">
          <label class="prop-label">Flex Shrink</label>
          <input
            class="prop-input"
            type="number"
            min="0"
            step="1"
            :value="node.flexShrink ?? 1"
            @input="updateNum('flexShrink', $event)"
          />
        </div>
      </div>
    </template>

    <div class="prop-row">
      <div class="prop-field">
        <label class="prop-label">W (mm)</label>
        <input
          class="prop-input"
          type="number"
          :value="fmt(node.width)"
          @input="updateNum('width', $event)"
        />
      </div>
      <div class="prop-field">
        <label class="prop-label">H (mm)</label>
        <input
          class="prop-input"
          type="number"
          :value="fmt(node.height)"
          @input="updateNum('height', $event)"
        />
      </div>
    </div>

    <div class="prop-row">
      <div class="prop-field">
        <label class="prop-label">Rotate (°)</label>
        <input
          class="prop-input"
          type="number"
          :value="node.rotate ?? 0"
          @input="updateNum('rotate', $event)"
        />
      </div>
      <div class="prop-field">
        <label class="prop-label">Opacity</label>
        <input
          class="prop-input"
          type="number"
          min="0"
          max="1"
          step="0.1"
          :value="node.opacity ?? 1"
          @input="updateNum('opacity', $event)"
        />
      </div>
    </div>

    <button class="prop-delete-btn" @click="store.deleteNode(node.id)">Delete element</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEditorStore } from '@/stores/editor';
import type { EditorNode } from '@/editor/types';

const props = defineProps<{ nodeId: string }>();
const store = useEditorStore();
const node = computed(() => store.getNode(props.nodeId) as EditorNode);

function fmt(v: number): string {
  return v.toFixed(1);
}

function update(key: string, e: Event) {
  store.updateNode(props.nodeId, {
    [key]: (e.target as HTMLInputElement).value,
  } as Partial<EditorNode>);
}

function updateNum(key: string, e: Event) {
  const val = parseFloat((e.target as HTMLInputElement).value);
  if (!isNaN(val)) {
    store.updateNode(props.nodeId, { [key]: val } as Partial<EditorNode>);
  }
}
</script>

<style scoped lang="scss">
.prop-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus {
    outline: 2px solid var(--color-accent);
    outline-offset: -1px;
  }
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

.prop-hint {
  font-size: 0.7rem;
  color: var(--color-base-content);
  opacity: 0.4;
  font-style: italic;
  margin: 0;
}

.prop-delete-btn {
  margin-top: 4px;
  padding: 6px;
  border: 1px solid var(--color-error);
  border-radius: 6px;
  background: transparent;
  color: var(--color-error);
  font-size: 0.8rem;
  cursor: pointer;

  &:hover {
    background: var(--color-error-subtle);
  }
}
</style>
