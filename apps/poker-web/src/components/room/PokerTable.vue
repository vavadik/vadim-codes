<template>
  <div ref="tableEl" class="poker-table" :class="{ 'poker-table--compact': compact }">
    <div class="poker-table__felt">
      <span v-if="currentTask && !compact" class="poker-table__task">{{ currentTask }}</span>
    </div>

    <div class="poker-table__seats">
      <div
        v-for="(seat, i) in orderedSeats"
        :key="seat.sessionId"
        class="poker-table__seat"
        :style="seatStyle(i)"
      >
        <PlayerSeat
          :name="seat.name"
          :card-state="seat.cardState"
          :card-value="seat.cardValue"
          :is-master="seat.isMaster"
          :is-connected="seat.isConnected"
          :on-kick="seat.onKick"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import PlayerSeat from './PlayerSeat.vue';
import { computeTableLayout } from '@/composables/useTableLayout';

export interface TableSeat {
  sessionId: string;
  name: string;
  cardState: 'idle' | 'voted' | 'revealed';
  cardValue?: string;
  isMaster: boolean;
  isConnected: boolean;
  onKick?: () => void;
}

const props = defineProps<{
  seats: TableSeat[];
  localSessionId: string;
  currentTask: string;
}>();

const tableEl = ref<HTMLElement | null>(null);
const containerSmall = ref(false);
let ro: ResizeObserver | null = null;

const COMPACT_HEIGHT = 340;

onMounted(() => {
  ro = new ResizeObserver((entries) => {
    const entry = entries[0];
    if (entry) {
      containerSmall.value = entry.contentRect.height < COMPACT_HEIGHT;
    }
  });
  if (tableEl.value) {
    ro.observe(tableEl.value);
  }
});

onUnmounted(() => {
  ro?.disconnect();
});

const compact = computed(() => containerSmall.value || props.seats.length > 10);

const orderedSeats = computed(() => {
  const local = props.seats.find((s) => s.sessionId === props.localSessionId);
  const others = props.seats.filter((s) => s.sessionId !== props.localSessionId);
  return local ? [local, ...others] : [...props.seats];
});

const positions = computed(() => computeTableLayout(orderedSeats.value.length));

function seatStyle(i: number): Record<string, string> {
  if (compact.value) {
    return {};
  }
  const pos = positions.value[i];
  if (!pos) {
    return {};
  }
  return { left: `${pos.x}%`, top: `${pos.y}%` };
}
</script>

<style scoped lang="scss">
.poker-table {
  position: relative;
  width: 100%;
  max-height: 30rem;
  flex-grow: 1;

  &--compact {
    max-height: unset;
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__felt {
    position: absolute;
    left: 10%;
    right: 10%;
    top: 14%;
    bottom: 14%;
    border-radius: 9999px;
    background: var(--felt-color);
    box-shadow:
      0 6px 32px rgba(0, 0, 0, 0.25),
      inset 0 0 48px rgba(0, 0, 0, 0.15);
    display: flex;

    .poker-table--compact & {
      inset: 0;
      border-radius: 0.75rem;
    }
  }

  &__task {
    font-size: 1rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.65);
    text-align: center;
    padding: 0 1.5rem;
    max-width: 70%;
    line-height: 1.4;
  }

  &__seats {
    position: absolute;
    inset: 0;

    .poker-table--compact & {
      position: relative;
      inset: auto;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 1rem 1.5rem;
      padding: 1rem;
    }
  }

  &__seat {
    position: absolute;
    transform: translate(-50%, -50%);

    .poker-table--compact & {
      position: static;
      transform: none;
    }
  }
}
</style>
