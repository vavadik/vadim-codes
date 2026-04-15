<template>
  <AppLayout>
    <div class="editor-root">
      <!-- Toolbar -->
      <div class="editor-toolbar">
        <span class="editor-toolbar__title">PDF Editor</span>
        <button class="btn btn-primary btn-sm" :disabled="exporting" @click="exportPdf">
          <span v-if="exporting" class="loading loading-spinner loading-xs" />
          Export PDF
        </button>
      </div>

      <!-- 3-column body -->
      <div class="editor-body">
        <ComponentPanel class="editor-panel editor-panel--left" />
        <EditorCanvas class="editor-panel editor-panel--canvas" />
        <OptionsPanel class="editor-panel editor-panel--right" />
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { generate } from '@pdfme/generator';
import { text, table } from '@pdfme/schemas';
import type { Template } from '@pdfme/common';
import AppLayout from '@/components/layouts/AppLayout.vue';
import ComponentPanel from '@/components/editor/ComponentPanel.vue';
import EditorCanvas from '@/components/editor/EditorCanvas.vue';
import OptionsPanel from '@/components/editor/OptionsPanel.vue';
import { useEditorStore } from '@/stores/editor';
import type { EditorElement } from '@/stores/editor';

const store = useEditorStore();
const exporting = ref(false);

function buildSchema(el: EditorElement) {
  const base = {
    name: el.id,
    position: { x: el.x, y: el.y },
    width: el.width,
    height: el.height,
  };

  if (el.type === 'text') {
    return { ...base, type: 'text', fontSize: 12, fontColor: '#000000' };
  }

  if (el.type === 'table') {
    const lines = el.content.split('\n').filter(Boolean);
    const head = lines[0]?.split(',').map((s) => s.trim()) ?? ['Col 1', 'Col 2'];
    const colCount = head.length;
    const colWidth = el.width / colCount;
    return {
      ...base,
      type: 'table',
      head,
      headStyle: {
        fontSize: 10,
        fontColor: '#ffffff',
        backgroundColor: '#374151',
      },
      bodyStyle: { fontSize: 9, fontColor: '#000000' },
      columnStyle: Object.fromEntries(head.map((_, i) => [i, { width: colWidth }])),
    };
  }

  // block → text element with background, no content
  return {
    ...base,
    type: 'text',
    fontSize: 10,
    fontColor: '#00000000',
    backgroundColor: '#e5e7eb',
  };
}

function buildInput(el: EditorElement): [string, string] {
  if (el.type === 'table') {
    const lines = el.content.split('\n').filter(Boolean);
    const rows = lines.slice(1).map((l) => l.split(',').map((s) => s.trim()));
    return [el.id, JSON.stringify(rows)];
  }
  if (el.type === 'block') return [el.id, ''];
  return [el.id, el.content];
}

async function exportPdf() {
  if (!store.elements.length) return;

  exporting.value = true;
  try {
    const template: Template = {
      basePdf: { width: 210, height: 297, padding: [0, 0, 0, 0] },
      schemas: [store.elements.map(buildSchema)],
    };

    const inputs = [Object.fromEntries(store.elements.map(buildInput))];

    const pdf = await generate({ template, inputs, plugins: { text, table } });
    const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
    window.open(URL.createObjectURL(blob));
  } finally {
    exporting.value = false;
  }
}
</script>

<style scoped lang="scss">
.editor-root {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 65px); // subtract navbar height
}

.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  height: 48px;
  background: var(--color-base-100);
  border-bottom: 1px solid var(--color-base-300);
  flex-shrink: 0;

  &__title {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--color-base-content);
  }
}

.editor-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.editor-panel {
  overflow: hidden;

  &--left {
    width: 220px;
    flex-shrink: 0;
    border-right: 1px solid var(--color-base-300);
  }

  &--canvas {
    flex: 1;
    overflow: auto;
    background: var(--color-base-200);
  }

  &--right {
    width: 260px;
    flex-shrink: 0;
    border-left: 1px solid var(--color-base-300);
  }
}
</style>
