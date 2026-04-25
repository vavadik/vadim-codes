<template>
  <Teleport to="body">
    <button
      ref="notchRef"
      class="results-notch"
      :class="{ 'results-notch--open': isOpen }"
      @click="isOpen = !isOpen"
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M6 9l6 6 6-6"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          :style="{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transformOrigin: 'center',
            transition: 'transform 0.2s',
          }"
        />
      </svg>
      Results
    </button>

    <div ref="panelRef" class="results-panel" :class="{ 'results-panel--open': isOpen }">
      <ResultsSummary :votes="votes" :participants="participants" />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { ParticipantPayload } from '@vadim-codes/poker-contracts';
import ResultsSummary from './ResultsSummary.vue';

const props = defineProps<{
  votes: Record<string, string | null>;
  participants: ParticipantPayload[];
  autoOpen?: boolean;
}>();

const isOpen = ref(props.autoOpen ?? false);
const notchRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);

function onDocClick(e: MouseEvent): void {
  if (!isOpen.value) {
    return;
  }
  const target = e.target as Node;
  if (!notchRef.value?.contains(target) && !panelRef.value?.contains(target)) {
    isOpen.value = false;
  }
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown);
  document.addEventListener('click', onDocClick);
});

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown);
  document.removeEventListener('click', onDocClick);
});
</script>

<style scoped lang="scss">
$navbar-h: 64px;
$content-max: 900px;
$content-pad: 1.5rem;

.results-notch {
  position: fixed;
  top: $navbar-h;
  left: 50%;
  transform: translateX(-50%);
  z-index: 101;

  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 11px 5px;
  background: var(--color-base-100);
  border: 1px solid var(--color-base-300);
  border-top: none;
  border-radius: 0 0 8px 8px;
  color: color-mix(in oklch, var(--color-base-content) 55%, transparent);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  white-space: nowrap;
  cursor: pointer;
  transition:
    color 0.15s,
    background 0.15s,
    border-color 0.15s;

  &:hover {
    color: var(--color-base-content);
    background: var(--color-base-200);
  }

  &--open {
    color: var(--color-accent);
    border-color: var(--color-accent);
    border-top: none;
    background: var(--color-accent-subtle);

    &:hover {
      background: var(--color-accent-subtle-hover);
    }
  }
}

.results-panel {
  position: fixed;
  top: $navbar-h;
  left: 50%;
  width: calc(100% - #{$content-pad * 2});
  max-width: $content-max;
  z-index: 99;
  transform: translateX(-50%) translateY(-100%);
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;

  &--open {
    transform: translateX(-50%) translateY(0);
    pointer-events: auto;
  }

  :deep(.results) {
    border-radius: 0 0 0.75rem 0.75rem;
    border-top: none;
    box-shadow: 0 8px 24px color-mix(in oklch, black 12%, transparent);
  }
}
</style>
