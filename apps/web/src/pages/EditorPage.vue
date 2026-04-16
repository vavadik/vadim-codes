<template>
  <AppLayout>
    <div class="editor-root">
      <div class="editor-toolbar">
        <span class="editor-toolbar__title">PDF Editor</span>
        <button class="btn btn-primary btn-sm" :disabled="exporting" @click="exportPdf">
          <span v-if="exporting" class="loading loading-spinner loading-xs" />
          Export PDF
        </button>
      </div>
      <div ref="designerRef" class="editor-designer" />
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Designer } from '@pdfme/ui';
import { generate } from '@pdfme/generator';
import { text, table, image } from '@pdfme/schemas';
import type { Template } from '@pdfme/common';
import AppLayout from '@/components/layouts/AppLayout.vue';

const plugins = { Text: text, Table: table, Image: image };

const blankTemplate: Template = {
  basePdf: { width: 210, height: 297, padding: [0, 0, 0, 0] },
  schemas: [[]],
};

const designerRef = ref<HTMLDivElement>();
const exporting = ref(false);
let designer: Designer | null = null;

onMounted(() => {
  if (!designerRef.value) return;
  designer = new Designer({
    domContainer: designerRef.value,
    template: blankTemplate,
    plugins,
  });
});

onUnmounted(() => {
  designer?.destroy();
  designer = null;
});

async function exportPdf() {
  if (!designer) return;
  exporting.value = true;
  try {
    const template = designer.getTemplate();
    const inputs = [
      Object.fromEntries(template.schemas.flat().map((s) => [s.name, String(s.content ?? '')])),
    ];
    const pdf = await generate({ template, inputs, plugins });
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
  height: calc(100vh - 65px);
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

.editor-designer {
  flex: 1;
  overflow: hidden;
}
</style>
