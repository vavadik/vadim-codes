<template>
  <div class="room-toolbar">
    <template v-if="isMaster">
      <div class="room-toolbar__deck-selector">
        <select :value="deck" class="room-toolbar__deck-select" @change="onDeckChange">
          <option value="fibonacci">Fibonacci</option>
          <option value="tshirt">T-shirt</option>
          <option value="powersOfTwo">Powers of 2</option>
          <option value="custom">Custom…</option>
        </select>
        <div v-if="deck === 'custom'" class="room-toolbar__custom-deck">
          <input
            v-model="customDeckInput"
            class="room-toolbar__custom-deck-input"
            placeholder="1, 2, 4, 8…"
            @keydown.enter="applyCustomDeck"
          />
          <Button size="sm" variant="ghost" @click="applyCustomDeck">Apply</Button>
        </div>
      </div>
    </template>
    <span v-else class="room-toolbar__deck-label">Deck: {{ deckLabel }}</span>

    <Button
      v-if="state === 'voting'"
      variant="primary"
      :disabled="!anyVoted"
      @click="$emit('reveal')"
    >
      Reveal
    </Button>
    <Button v-else variant="secondary" @click="$emit('reset')">New round</Button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { DeckName, RoomState } from '@vadim-codes/poker-contracts';
import { Button } from '@/components/ui';

const props = defineProps<{
  isMaster: boolean;
  deck: DeckName;
  deckValues: string[];
  state: RoomState;
  anyVoted: boolean;
}>();

const emit = defineEmits<{
  reveal: [];
  reset: [];
  'set-deck': [deck: string, deckValues?: string[]];
}>();

const DECK_LABELS: Record<string, string> = {
  fibonacci: 'Fibonacci',
  tshirt: 'T-shirt',
  powersOfTwo: 'Powers of 2',
  custom: 'Custom',
};

const deckLabel = computed(() => DECK_LABELS[props.deck] ?? props.deck);
const customDeckInput = ref('');

function onDeckChange(e: Event): void {
  const deck = (e.target as HTMLSelectElement).value;
  if (deck !== 'custom') {
    emit('set-deck', deck);
  } else {
    customDeckInput.value = props.deckValues.join(', ');
  }
}

function applyCustomDeck(): void {
  const values = customDeckInput.value
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v.length > 0 && v.length <= 8)
    .slice(0, 20);
  if (values.length > 0) {
    emit('set-deck', 'custom', values);
  }
}
</script>

<style scoped lang="scss">
.room-toolbar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0.5rem 0;

  &__deck-selector {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  &__deck-select {
    font-size: 0.875rem;
    background: var(--color-base-100);
    border: 1px solid var(--color-base-300);
    border-radius: 0.375rem;
    padding: 0.25rem 0.5rem;
    color: var(--color-base-content);
    cursor: pointer;

    &:focus {
      outline: 1px solid var(--color-accent);
    }
  }

  &__custom-deck {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  &__custom-deck-input {
    font-size: 0.875rem;
    background: var(--color-base-100);
    border: 1px solid var(--color-base-300);
    border-radius: 0.375rem;
    padding: 0.25rem 0.5rem;
    color: var(--color-base-content);
    width: 160px;
    outline: none;

    &:focus {
      border-color: var(--color-accent);
    }
  }

  &__deck-label {
    font-size: 0.8rem;
    color: color-mix(in oklch, var(--color-base-content) 60%, transparent);
  }
}
</style>
