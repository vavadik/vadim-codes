<template>
  <div class="results">
    <div v-if="average !== null" class="results__average">
      Average: <strong>{{ average }}</strong>
    </div>

    <div class="results__breakdown">
      <div v-for="row in breakdown" :key="row.value" class="results__row">
        <span class="results__value">{{ row.value }}</span>
        <div class="results__bar-wrap">
          <div class="results__bar" :style="{ width: row.pct + '%' }" />
        </div>
        <span class="results__count"
          >{{ row.count }} vote{{ row.count !== 1 ? 's' : '' }} ({{ row.pct }}%)</span
        >
      </div>
    </div>

    <div v-if="nonVoters.length" class="results__non-voters">
      <span class="results__non-voters-label">Spectators:</span>
      {{ nonVoters.map((p) => p.name).join(', ') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ParticipantPayload } from '@vadim-codes/poker-contracts';

const props = defineProps<{
  votes: Record<string, string | null>;
  participants: ParticipantPayload[];
}>();

const SPECIAL = new Set(['?', '☕', '∞']);

const nonVoters = computed(() => props.participants.filter((p) => !(p.sessionId in props.votes)));

const numericVotes = computed(() =>
  Object.values(props.votes)
    .filter((v): v is string => v !== null && !SPECIAL.has(v) && !isNaN(Number(v)))
    .map(Number)
);

const average = computed(() => {
  if (numericVotes.value.length === 0) {
    return null;
  }
  const sum = numericVotes.value.reduce((a, b) => a + b, 0);
  return (sum / numericVotes.value.length).toFixed(1);
});

const breakdown = computed(() => {
  const counts = new Map<string, number>();
  for (const v of Object.values(props.votes)) {
    if (v === null) {
      continue;
    }
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }

  const total = Object.values(props.votes).filter((v) => v !== null).length;

  return [...counts.entries()]
    .sort((a, b) => {
      const na = Number(a[0]);
      const nb = Number(b[0]);
      if (!isNaN(na) && !isNaN(nb)) {
        return na - nb;
      }
      return a[0].localeCompare(b[0]);
    })
    .map(([value, count]) => ({
      value,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
});
</script>

<style scoped lang="scss">
.results {
  background: var(--color-base-100);
  border: 1px solid var(--color-base-300);
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  &__average {
    font-size: 1rem;
    color: color-mix(in oklch, var(--color-base-content) 70%, transparent);

    strong {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-accent);
    }
  }

  &__breakdown {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  &__row {
    display: grid;
    grid-template-columns: 3rem 1fr 8rem;
    align-items: center;
    gap: 0.5rem;
  }

  &__value {
    font-weight: 600;
    font-size: 0.9rem;
    text-align: right;
  }

  &__bar-wrap {
    height: 1.25rem;
    background: var(--color-base-200);
    border-radius: 0.25rem;
    overflow: hidden;
  }

  &__bar {
    height: 100%;
    background: var(--color-accent);
    border-radius: 0.25rem;
    transition: width 0.3s;
    min-width: 2px;
  }

  &__count {
    font-size: 0.8rem;
    color: color-mix(in oklch, var(--color-base-content) 60%, transparent);
  }

  &__non-voters {
    font-size: 0.8rem;
    color: color-mix(in oklch, var(--color-base-content) 55%, transparent);
    border-top: 1px solid var(--color-base-300);
    padding-top: 0.5rem;
  }

  &__non-voters-label {
    font-weight: 600;
    margin-right: 0.25rem;
  }
}
</style>
