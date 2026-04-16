<template>
  <AppLayout>
    <div class="editor-root">
      <div class="editor-toolbar">
        <span class="editor-toolbar__title">PDF Editor</span>
        <button
          class="btn btn-sm"
          :class="store.showOutlines ? 'btn-neutral' : 'btn-ghost'"
          @click="store.toggleOutlines()"
        >
          Outlines
        </button>
        <button class="btn btn-primary btn-sm" :disabled="exporting" @click="exportPdf">
          <span v-if="exporting" class="loading loading-spinner loading-xs" />
          Export PDF
        </button>
      </div>

      <div class="editor-body">
        <ElementPalette />
        <EditorCanvas />
        <PropertiesPanel />
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { generate } from '@pdfme/generator';
import { text, table, image, rectangle } from '@pdfme/schemas';
import AppLayout from '@/components/layouts/AppLayout.vue';
import ElementPalette from '@/editor/components/ElementPalette.vue';
import EditorCanvas from '@/editor/components/EditorCanvas.vue';
import PropertiesPanel from '@/editor/components/PropertiesPanel.vue';
import { useEditorStore } from '@/stores/editor';
import { useYogaLayout } from '@/editor/composables/useYogaLayout';
import { buildPdfmeTemplate, buildInputs } from '@/editor/utils/toPdfmeTemplate';

const plugins = { Text: text, Table: table, Image: image, Rectangle: rectangle };

const store = useEditorStore();
const { initYoga, yogaReady, recalculateAll } = useYogaLayout();
const exporting = ref(false);

onMounted(async () => {
  await initYoga();
});

// Re-run Yoga whenever layout-affecting store mutations occur
watch([() => store.layoutVersion, yogaReady], ([, ready]) => {
  if (ready) recalculateAll();
});

async function exportPdf() {
  exporting.value = true;
  try {
    const template = buildPdfmeTemplate(store.nodes, store.rootIds, store.page);
    const schemas = template.schemas.flat();
    const inputs = buildInputs(schemas);
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

.editor-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}
</style>
