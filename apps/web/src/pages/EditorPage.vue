<template>
  <div class="editor-root">
    <header class="editor-header">
      <div class="editor-header__left">
        <RouterLink to="/" class="editor-header__logo">composer-ai</RouterLink>
        <div class="editor-header__brand-sep" />
        <span class="editor-header__title">PDF Editor</span>
      </div>

      <div class="editor-header__right">
        <nav class="editor-header__nav">
          <RouterLink to="/design-system" class="editor-header__nav-link">Design System</RouterLink>
          <RouterLink to="/editor" class="editor-header__nav-link">Editor</RouterLink>
          <a href="#" class="editor-header__nav-link">GitHub</a>
        </nav>

        <button
          class="editor-header__theme-btn"
          :aria-label="theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
          @click="toggleTheme"
        >
          <svg v-if="theme === 'light'" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2" />
            <path
              d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
    </header>

    <div class="editor-body">
      <ElementPalette :style="{ width: leftWidth + 'px' }" />
      <div class="resize-handle" @mousedown="startResize('left', $event)" />
      <div class="editor-center">
        <div class="canvas-toolbar">
          <div class="tool-group">
            <Tooltip text="Toggle outlines" placement="bottom">
              <button
                class="canvas-tool-btn"
                :class="{ 'canvas-tool-btn--active': store.showOutlines }"
                aria-label="Toggle outlines"
                @click="store.toggleOutlines()"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <rect
                    x="2"
                    y="2"
                    width="12"
                    height="12"
                    rx="1.5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-dasharray="3 2.5"
                  />
                </svg>
              </button>
            </Tooltip>
            <div class="tool-group__sep" />
            <Tooltip text="Export PDF" placement="bottom">
              <button
                class="canvas-tool-btn canvas-tool-btn--export"
                :disabled="exporting"
                aria-label="Export PDF"
                @click="exportPdf"
              >
                <span v-if="exporting" class="loading loading-spinner loading-xs" />
                <svg v-else width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 2v8M8 10l-2.5-2.5M8 10l2.5-2.5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M2.5 11.5v1A1.5 1.5 0 004 14h8a1.5 1.5 0 001.5-1.5v-1"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </Tooltip>
          </div>
        </div>
        <EditorCanvas />
      </div>
      <div class="resize-handle" @mousedown="startResize('right', $event)" />
      <PropertiesPanel :style="{ width: rightWidth + 'px' }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

const LEFT_DEFAULT = 180;
const RIGHT_DEFAULT = 240;
const LEFT_MIN = 100;
const LEFT_MAX = 480;
const RIGHT_MIN = 140;
const RIGHT_MAX = 520;

function readStorage(key: string, fallback: number): number {
  const v = localStorage.getItem(key);
  return v ? parseInt(v, 10) : fallback;
}

const leftWidth = ref(readStorage('panel-left-width', LEFT_DEFAULT));
const rightWidth = ref(readStorage('panel-right-width', RIGHT_DEFAULT));

function startResize(side: 'left' | 'right', e: MouseEvent) {
  e.preventDefault();
  const startX = e.clientX;
  const startWidth = side === 'left' ? leftWidth.value : rightWidth.value;

  function onMove(ev: MouseEvent) {
    const dx = ev.clientX - startX;
    if (side === 'left') {
      leftWidth.value = Math.min(LEFT_MAX, Math.max(LEFT_MIN, startWidth + dx));
    } else {
      rightWidth.value = Math.min(RIGHT_MAX, Math.max(RIGHT_MIN, startWidth - dx));
    }
  }

  function onUp() {
    localStorage.setItem('panel-left-width', String(leftWidth.value));
    localStorage.setItem('panel-right-width', String(rightWidth.value));
    window.removeEventListener('mousemove', onMove);
  }

  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp, { once: true });
}
import { generate } from '@pdfme/generator';
import { text, table, image, rectangle } from '@pdfme/schemas';
import { Tooltip } from '@/components/ui';
import { useTheme } from '@/composables/useTheme';
import ElementPalette from '@/editor/components/ElementPalette.vue';
import EditorCanvas from '@/editor/components/EditorCanvas.vue';
import PropertiesPanel from '@/editor/components/PropertiesPanel.vue';
import { useEditorStore } from '@/stores/editor';
import { useYogaLayout } from '@/editor/composables/useYogaLayout';
import { buildPdfmeTemplate, buildInputs } from '@/editor/utils/toPdfmeTemplate';

const plugins = { Text: text, Table: table, Image: image, Rectangle: rectangle };

const store = useEditorStore();
const { theme, toggle: toggleTheme } = useTheme();
const { initYoga, yogaReady, recalculateAll } = useYogaLayout();
const exporting = ref(false);

onMounted(async () => {
  await initYoga();
});

// Re-run Yoga whenever layout-affecting store mutations occur
watch([() => store.layoutVersion, yogaReady], ([, ready]) => {
  if (ready) {
    recalculateAll();
  }
});

async function exportPdf() {
  exporting.value = true;
  try {
    const template = buildPdfmeTemplate(store.nodes, store.rootIds, store.page);
    const schemas = template.schemas.flat();
    const inputs = buildInputs(schemas);
    const pdf = await generate({ template: JSON.parse(JSON.stringify(template)), inputs, plugins });
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
  height: 100vh;
  background: var(--color-base-200);
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  height: 56px;
  background: var(--color-base-100);
  border-bottom: 1px solid var(--color-base-300);
  flex-shrink: 0;

  &__left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__logo {
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-base-content);
    text-decoration: none;

    &:hover {
      opacity: 0.8;
    }
  }

  &__brand-sep {
    width: 1px;
    height: 18px;
    background: var(--color-base-300);
  }

  &__title {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--color-base-content);
    opacity: 0.7;
  }

  &__nav {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-left: 4px;
  }

  &__nav-link {
    font-size: 0.82rem;
    color: var(--color-base-content);
    opacity: 0.6;
    text-decoration: none;
    transition: opacity 0.15s;

    &:hover {
      opacity: 1;
    }
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__theme-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 6px;
    border: none;
    background: transparent;
    color: var(--color-base-content);
    cursor: pointer;
    opacity: 0.7;
    transition:
      opacity 0.15s,
      background 0.15s;

    &:hover {
      opacity: 1;
      background: var(--color-base-200);
    }
  }
}

.editor-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.editor-center {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.canvas-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  padding: 0 12px;
  height: 40px;
  background: var(--color-base-200);
  border-bottom: 1px solid var(--color-base-300);
  box-shadow: inset 0 -1px 0 var(--color-base-300);
  flex-shrink: 0;
}

.tool-group {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-base-300);
  border-radius: 7px;
  background: var(--color-base-100);
  overflow: hidden;

  &__sep {
    width: 1px;
    height: 16px;
    background: var(--color-base-300);
    flex-shrink: 0;
  }
}

.canvas-tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--color-base-content);
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;

  &:hover {
    background: var(--color-base-200);
  }

  &--active {
    background: var(--color-accent-subtle);
    color: var(--color-accent);

    &:hover {
      background: var(--color-accent-subtle-hover);
    }
  }

  &--export {
    background: var(--color-accent);
    color: var(--color-accent-content);
    width: 30px;

    &:hover {
      background: var(--color-accent-hover);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

.resize-handle {
  width: 4px;
  flex-shrink: 0;
  cursor: col-resize;
  background: var(--color-base-300);
  transition: background 0.15s;
  user-select: none;

  &:hover {
    background: var(--color-accent);
  }
}
</style>
