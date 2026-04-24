<template>
  <div class="player-seat" :class="{ 'player-seat--disconnected': !isConnected }">
    <div class="player-seat__card" :class="`player-seat__card--${cardState}`">
      <span v-if="cardState === 'revealed'">{{ cardValue ?? '–' }}</span>
      <span v-else-if="cardState === 'voted'" class="player-seat__checkmark">✓</span>
    </div>
    <span class="player-seat__name">
      {{ name }}
      <span v-if="isMaster"> 👑</span>
      <span v-if="!isConnected" class="player-seat__offline"> (offline)</span>
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string;
  cardState: 'idle' | 'voted' | 'revealed';
  cardValue?: string;
  isMaster?: boolean;
  isConnected?: boolean;
}>();
</script>

<style scoped lang="scss">
.player-seat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: opacity 0.1s;

  &--disconnected {
    opacity: 0.45;
  }

  &__card {
    width: 3.5rem;
    height: 5rem;
    border: 2px solid var(--color-base-300);
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    font-weight: 700;
    transition:
      transform 0.1s,
      background 0.1s,
      border-color 0.1s;

    // idle: empty outline
    &--idle {
      background: var(--color-base-200);
    }

    // voted: solid back — distinct from idle
    &--voted {
      background: var(--color-accent-subtle);
      border-color: var(--color-accent);
      transform: translateY(-4px);
    }

    // revealed: face-up with value
    &--revealed {
      background: var(--color-accent-subtle);
      border-color: var(--color-accent);
      color: var(--color-accent);
    }
  }

  &__checkmark {
    color: var(--color-accent);
    font-size: 1.5rem;
  }

  &__name {
    font-size: 0.8rem;
    text-align: center;
    max-width: 5rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__offline {
    color: color-mix(in oklch, var(--color-base-content) 40%, transparent);
  }
}
</style>
