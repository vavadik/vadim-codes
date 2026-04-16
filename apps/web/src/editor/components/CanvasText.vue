<template>
  <div class="canvas-text" :style="textStyle">{{ node.content || 'Text' }}</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEditorStore } from '@/stores/editor';
import { useCanvasScale } from '@/editor/composables/useCanvasScale';
import type { TextNode } from '@/editor/types';

const props = defineProps<{ nodeId: string }>();
const store = useEditorStore();
const { toPx } = useCanvasScale();

const node = computed(() => store.getNode(props.nodeId) as TextNode);

const textStyle = computed(() => ({
  fontSize: `${toPx(node.value.fontSize * 0.352778)}px`, // pt to mm to px
  color: node.value.fontColor,
  textAlign: node.value.alignment as 'left' | 'center' | 'right' | 'justify',
  lineHeight: String(node.value.lineHeight),
  letterSpacing: `${node.value.characterSpacing}px`,
  backgroundColor:
    node.value.backgroundColor === 'transparent' ? undefined : node.value.backgroundColor,
  display: 'flex',
  alignItems:
    node.value.verticalAlignment === 'middle'
      ? 'center'
      : node.value.verticalAlignment === 'bottom'
        ? 'flex-end'
        : 'flex-start',
  overflow: 'hidden',
  width: '100%',
  height: '100%',
  boxSizing: 'border-box' as const,
  padding: '2px',
  userSelect: 'none' as const,
  cursor: 'default',
  whiteSpace: 'pre-wrap' as const,
}));
</script>
