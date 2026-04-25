<template>
  <div class="card-hand" :class="{ 'card-hand--disabled': disabled }">
    <div
      v-for="(value, i) in allCards"
      :key="value"
      class="card-hand__slot"
      :style="{ zIndex: i }"
      @click="select(value)"
    >
      <button
        class="card-hand__card"
        :class="{ 'card-hand__card--selected': value === selectedValue }"
        :disabled="disabled"
      >
        <span class="card-hand__corner card-hand__corner--tl">{{ value }}</span>
        <span class="card-hand__corner card-hand__corner--br">{{ value }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const SPECIAL_CARDS = ['?', '☕', '∞'];

const props = defineProps<{
  deckValues: string[];
  selectedValue: string | null;
  disabled?: boolean;
}>();

const emit = defineEmits<{ 'update:selectedValue': [value: string | null] }>();

const allCards = computed(() => [...props.deckValues, ...SPECIAL_CARDS]);

function select(value: string): void {
  if (!props.disabled) {
    emit('update:selectedValue', value === props.selectedValue ? null : value);
  }
}
</script>

<style scoped lang="scss">
.card-hand {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 0;
  justify-content: center;
  align-items: flex-end;
  user-select: none;
  // top padding must cover the max card lift (3rem hover-selected) plus a small gap
  padding: 3.5rem 1.5rem 1rem 4rem;

  &--disabled {
    // opacity: 0.65;
  }

  &__slot {
    flex-shrink: 0;
    width: 5rem;
    height: 7rem;
    cursor: pointer;
    margin-left: -2.5rem;

    @media (hover: hover) {
      &:hover .card-hand__card:not(:disabled) {
        transform: translateY(-2rem);
        border-color: var(--color-accent);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
      }

      &:hover .card-hand__card--selected:not(:disabled) {
        transform: translateY(-3rem);
      }
    }
  }

  &__card {
    position: relative;
    width: 100%;
    height: 100%;
    border: 2px solid var(--color-base-300);
    border-radius: 0.6rem;
    background: var(--color-base-100);
    cursor: pointer;
    transition:
      transform 150ms ease,
      box-shadow 150ms ease,
      border-color 150ms ease,
      background 150ms ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    &--selected {
      transform: translateY(-2.5rem);
      border-color: var(--color-accent);
      background: var(--color-accent-subtle);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
      z-index: 99 !important;

      .card-hand__corner {
        color: var(--color-accent);
      }
    }
  }

  &__corner {
    position: absolute;
    font-size: 1.1rem;
    font-weight: 700;
    line-height: 1;
    color: var(--color-base-content);

    &--tl {
      top: 0.4rem;
      left: 0.45rem;
    }

    &--br {
      bottom: 0.4rem;
      right: 0.45rem;
      transform: rotate(180deg);
    }
  }
}
</style>
