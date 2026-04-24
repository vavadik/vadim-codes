<template>
  <div class="card-hand">
    <button
      v-for="value in allCards"
      :key="value"
      class="card-hand__card"
      :class="{
        'card-hand__card--selected': value === selectedValue,
        'card-hand__card--disabled': disabled,
      }"
      :disabled="disabled"
      @click="select(value)"
    >
      {{ value }}
    </button>
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

const emit = defineEmits<{ 'update:selectedValue': [value: string] }>();

const allCards = computed(() => [...props.deckValues, ...SPECIAL_CARDS]);

function select(value: string): void {
  if (!props.disabled) {
    emit('update:selectedValue', value);
  }
}
</script>

<style scoped lang="scss">
.card-hand {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  padding: 1rem;

  &__card {
    min-width: 3rem;
    height: 4.5rem;
    border: 2px solid var(--color-base-300);
    border-radius: 0.5rem;
    background: var(--color-base-100);
    color: var(--color-base-content);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition:
      transform 0.15s,
      border-color 0.15s,
      background 0.15s;
    padding: 0 0.75rem;

    &:hover:not(:disabled) {
      transform: translateY(-4px);
      border-color: var(--color-accent);
    }

    &--selected {
      transform: translateY(-8px);
      border-color: var(--color-accent);
      background: var(--color-accent-subtle);
      color: var(--color-accent);
    }

    &--disabled {
      opacity: 0.5;
      cursor: not-allowed;

      &:hover {
        transform: none;
      }
    }
  }
}
</style>
