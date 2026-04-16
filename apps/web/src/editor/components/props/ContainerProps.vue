<template>
  <div class="prop-section">
    <p class="prop-section__heading">Flex Container</p>

    <label class="prop-label">Direction</label>
    <div class="prop-btn-group">
      <button
        v-for="opt in flexDirs"
        :key="opt.value"
        class="prop-btn"
        :class="{ 'prop-btn--active': node.flexDirection === opt.value }"
        :title="opt.label"
        @click="updateFlex('flexDirection', opt.value)"
      >
        {{ opt.icon }}
      </button>
    </div>

    <label class="prop-label">Justify content</label>
    <select
      class="prop-input"
      :value="node.justifyContent"
      @change="updateFlex('justifyContent', ($event.target as HTMLSelectElement).value)"
    >
      <option value="flex-start">Start</option>
      <option value="center">Center</option>
      <option value="flex-end">End</option>
      <option value="space-between">Space between</option>
      <option value="space-around">Space around</option>
      <option value="space-evenly">Space evenly</option>
    </select>

    <label class="prop-label">Align items</label>
    <select
      class="prop-input"
      :value="node.alignItems"
      @change="updateFlex('alignItems', ($event.target as HTMLSelectElement).value)"
    >
      <option value="flex-start">Start</option>
      <option value="center">Center</option>
      <option value="flex-end">End</option>
      <option value="stretch">Stretch</option>
    </select>

    <label class="prop-label">Wrap</label>
    <select
      class="prop-input"
      :value="node.flexWrap"
      @change="updateFlex('flexWrap', ($event.target as HTMLSelectElement).value)"
    >
      <option value="no-wrap">No wrap</option>
      <option value="wrap">Wrap</option>
      <option value="wrap-reverse">Wrap reverse</option>
    </select>

    <label class="prop-label">Gap (mm)</label>
    <input
      class="prop-input"
      type="number"
      min="0"
      :value="node.gap"
      @input="updateFlexNum('gap', $event)"
    />

    <label class="prop-label">Padding (mm)</label>
    <div class="prop-row">
      <div class="prop-field">
        <label class="prop-label">Top</label>
        <input
          class="prop-input"
          type="number"
          min="0"
          :value="node.paddingTop"
          @input="updateFlexNum('paddingTop', $event)"
        />
      </div>
      <div class="prop-field">
        <label class="prop-label">Right</label>
        <input
          class="prop-input"
          type="number"
          min="0"
          :value="node.paddingRight"
          @input="updateFlexNum('paddingRight', $event)"
        />
      </div>
      <div class="prop-field">
        <label class="prop-label">Bottom</label>
        <input
          class="prop-input"
          type="number"
          min="0"
          :value="node.paddingBottom"
          @input="updateFlexNum('paddingBottom', $event)"
        />
      </div>
      <div class="prop-field">
        <label class="prop-label">Left</label>
        <input
          class="prop-input"
          type="number"
          min="0"
          :value="node.paddingLeft"
          @input="updateFlexNum('paddingLeft', $event)"
        />
      </div>
    </div>

    <label class="prop-label">Background color</label>
    <div class="prop-color-row">
      <input
        class="prop-input prop-color"
        type="color"
        :value="node.backgroundColor === 'transparent' ? '#ffffff' : node.backgroundColor"
        @input="updateFlex('backgroundColor', ($event.target as HTMLInputElement).value)"
      />
      <button
        class="prop-btn prop-btn--small"
        @click="updateFlex('backgroundColor', 'transparent')"
      >
        None
      </button>
    </div>

    <div class="prop-row">
      <div class="prop-field">
        <label class="prop-label">Border width</label>
        <input
          class="prop-input"
          type="number"
          min="0"
          step="0.1"
          :value="node.borderWidth"
          @input="updateFlexNum('borderWidth', $event)"
        />
      </div>
      <div class="prop-field">
        <label class="prop-label">Border color</label>
        <input
          class="prop-input prop-color"
          type="color"
          :value="node.borderColor"
          @input="updateFlex('borderColor', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEditorStore } from '@/stores/editor';
import type { ContainerNode } from '@/editor/types';

const props = defineProps<{ nodeId: string }>();
const store = useEditorStore();
const node = computed(() => store.getNode(props.nodeId) as ContainerNode);

const flexDirs = [
  { value: 'row', label: 'Row', icon: '→' },
  { value: 'column', label: 'Column', icon: '↓' },
  { value: 'row-reverse', label: 'Row reverse', icon: '←' },
  { value: 'column-reverse', label: 'Column reverse', icon: '↑' },
];

function updateFlex(key: string, value: string) {
  store.updateFlex(props.nodeId, { [key]: value } as Partial<ContainerNode>);
}

function updateFlexNum(key: string, e: Event) {
  const val = parseFloat((e.target as HTMLInputElement).value);
  if (!isNaN(val)) store.updateFlex(props.nodeId, { [key]: val } as Partial<ContainerNode>);
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

.prop-btn-group {
  display: flex;
  gap: 4px;
}

.prop-btn {
  flex: 1;
  padding: 6px 4px;
  border: 1px solid var(--color-base-300);
  border-radius: 4px;
  background: var(--color-base-100);
  color: var(--color-base-content);
  cursor: pointer;
  font-size: 0.9rem;

  &:hover {
    background: var(--color-base-200);
  }

  &--active {
    background: #6366f1;
    color: #fff;
    border-color: #6366f1;
  }

  &--small {
    flex: none;
    padding: 2px 8px;
    font-size: 0.75rem;
  }
}

.prop-color-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
