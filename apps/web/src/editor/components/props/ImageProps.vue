<template>
  <div class="prop-section">
    <p class="prop-section__heading">Image</p>
    <label class="prop-label">Upload image</label>
    <input class="prop-file" type="file" accept="image/*" @change="onFile" />
    <p v-if="node.content" class="prop-hint">Image loaded</p>
    <p v-else class="prop-hint">No image</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEditorStore } from '@/stores/editor';
import type { ImageNode } from '@/editor/types';

const props = defineProps<{ nodeId: string }>();
const store = useEditorStore();
const node = computed(() => store.getNode(props.nodeId) as ImageNode);

function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    store.updateNode(props.nodeId, { content: reader.result as string });
  };
  reader.readAsDataURL(file);
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

.prop-file {
  font-size: 0.82rem;
  cursor: pointer;
}

.prop-hint {
  font-size: 0.7rem;
  color: var(--color-base-content);
  opacity: 0.4;
  font-style: italic;
  margin: 0;
}
</style>
