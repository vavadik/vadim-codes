<template>
  <div ref="scrollRef" class="console-panel">
    <p v-if="messages.length === 0" class="console-panel__empty">
      Run your code to see output here.
    </p>
    <div
      v-for="(msg, i) in messages"
      v-else
      :key="`${i}-${msg.timestamp}`"
      :class="['console-panel__entry', `is-${msg.level}`]"
    >
      <span class="console-panel__text">{{ msg.args.join(' ') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useExecution } from '@/composables/useExecution';

const { messages } = useExecution();
const scrollRef = ref<HTMLElement | null>(null);

watch(
  () => messages.value.length,
  () => {
    if (scrollRef.value) {
      scrollRef.value.scrollTop = scrollRef.value.scrollHeight;
    }
  },
  { flush: 'post' }
);
</script>

<style scoped lang="scss">
.console-panel {
  height: 100%;
  overflow-y: auto;
  padding: 8px 0;
  font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
  font-size: 12px;

  &__empty {
    padding: 12px 14px;
    font-size: 12px;
    color: color-mix(in oklch, var(--color-base-content) 35%, transparent);
    font-style: italic;
    margin: 0;
  }

  &__entry {
    padding: 2px 14px;
    white-space: pre-wrap;
    word-break: break-all;
    line-height: 1.5;
    border-bottom: 1px solid color-mix(in oklch, var(--color-base-300) 40%, transparent);

    &.is-log {
      color: var(--color-base-content);
    }

    &.is-info {
      color: oklch(65% 0.15 240);
    }

    &.is-warn {
      color: oklch(70% 0.15 80);
      background: color-mix(in oklch, oklch(70% 0.15 80) 6%, transparent);
    }

    &.is-error {
      color: oklch(60% 0.2 25);
      background: color-mix(in oklch, oklch(60% 0.2 25) 6%, transparent);
    }

    &.is-system {
      color: color-mix(in oklch, var(--color-base-content) 40%, transparent);
      font-style: italic;
    }
  }

  &__text {
    display: block;
  }
}
</style>
