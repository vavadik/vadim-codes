<template>
  <div class="errors-panel">
    <p v-if="errors.length === 0" class="errors-panel__empty">No errors.</p>
    <div v-for="(err, i) in errors" v-else :key="i" class="errors-panel__entry">
      <p class="errors-panel__message">{{ err.message }}</p>
      <div v-if="err.lineNumber" class="errors-panel__location">
        Line {{ err.lineNumber }}{{ err.colNumber ? `, col ${err.colNumber}` : '' }}
      </div>
      <pre v-if="cleanedStack(err.stack)" class="errors-panel__stack">{{
        cleanedStack(err.stack)
      }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useExecution } from '@/composables/useExecution';
import { setMarkers } from '@/composables/useEditor';
import type { IMarkerData } from '@/composables/useEditor';

const { errors } = useExecution();

// Strip internal worker/eval frames so only user-code frames remain.
function cleanedStack(stack: string): string {
  return stack
    .split('\n')
    .filter((line) => {
      if (line.trim() === '') {
        return false;
      }
      if (line.includes('blob:')) {
        return false;
      }
      if (line.includes('eval at ')) {
        return false;
      }
      return true;
    })
    .slice(1) // drop the redundant "ErrorType: message" first line
    .join('\n')
    .trim();
}

watch(
  errors,
  (errs) => {
    const markers: IMarkerData[] = errs
      .filter((e) => e.lineNumber != null)
      .map((e) => ({
        severity: 8, // MarkerSeverity.Error
        message: e.message,
        startLineNumber: e.lineNumber!,
        startColumn: e.colNumber ?? 1,
        endLineNumber: e.lineNumber!,
        endColumn: Number.MAX_SAFE_INTEGER,
      }));
    setMarkers(markers);
  },
  { flush: 'post' }
);
</script>

<style scoped lang="scss">
.errors-panel {
  height: 100%;
  overflow-y: auto;
  padding: 8px 0;

  &__empty {
    padding: 12px 14px;
    font-size: 12px;
    color: color-mix(in oklch, var(--color-base-content) 35%, transparent);
    font-style: italic;
    margin: 0;
  }

  &__entry {
    padding: 8px 14px;
    border-bottom: 1px solid var(--color-base-300);
  }

  &__message {
    font-size: 12px;
    font-weight: 600;
    color: oklch(60% 0.2 25);
    margin: 0 0 4px;
    font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
  }

  &__location {
    font-size: 11px;
    color: color-mix(in oklch, var(--color-base-content) 50%, transparent);
    margin-bottom: 4px;
  }

  &__stack {
    font-size: 11px;
    font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
    color: color-mix(in oklch, var(--color-base-content) 60%, transparent);
    white-space: pre-wrap;
    word-break: break-all;
    margin: 0;
    line-height: 1.5;
  }
}
</style>
