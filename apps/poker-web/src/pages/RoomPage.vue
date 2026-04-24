<template>
  <AppLayout>
    <RoomNameGate v-if="!hasName" />

    <template v-else>
      <div v-if="store.isConnecting" class="room-status">
        <Loading />
        <span>Connecting…</span>
      </div>

      <div v-else-if="store.error" class="room-status">
        <Alert variant="error">{{ store.error }}</Alert>
        <RouterLink to="/" class="room-status__link">← Back to home</RouterLink>
      </div>

      <div v-else-if="store.room" class="room">
        <ResultsSummary
          v-if="store.room.state === 'revealed' && store.room.votes"
          :votes="store.room.votes"
          :participants="store.room.participants"
        />

        <RoomHeader
          :title="store.room.title"
          :current-task="store.room.currentTask"
          :is-public-mode="store.room.isPublicMode"
          :is-leaderless="isLeaderless"
          :is-master="isMaster"
          :transfer-master="transferMaster"
          :toggle-public-mode="togglePublicMode"
          :set-title="setTitle"
          :set-deck="setDeck"
          :set-task="setTask"
        />

        <div class="room__participants">
          <PlayerSeat
            v-for="p in store.room.participants"
            :key="p.sessionId"
            :name="p.name"
            :card-state="seatCardState(p)"
            :card-value="store.room.votes?.[p.sessionId] ?? undefined"
            :is-master="p.sessionId === store.room.masterSessionId"
            :is-connected="p.isConnected"
            :on-kick="
              isMaster && p.sessionId !== sessionId ? () => kickParticipant(p.sessionId) : undefined
            "
          />
        </div>

        <RoomToolbar
          v-if="isMasterOrPublic"
          :is-master="isMaster"
          :deck="store.room.deck"
          :deck-values="store.room.deckValues"
          :state="store.room.state"
          :any-voted="anyVoted"
          @reveal="reveal"
          @reset="reset"
          @set-deck="setDeck"
        />

        <div class="room__hand">
          <CardHand
            :deck-values="store.room.deckValues"
            :selected-value="mySelectedCard"
            :disabled="store.room.state === 'revealed'"
            @update:selected-value="onSelectCard"
          />
        </div>
      </div>
    </template>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import type { ParticipantPayload } from '@vadim-codes/poker-contracts';
import AppLayout from '@/components/layouts/AppLayout.vue';
import { Alert, Loading } from '@/components/ui';
import CardHand from '@/components/room/CardHand.vue';
import PlayerSeat from '@/components/room/PlayerSeat.vue';
import ResultsSummary from '@/components/room/ResultsSummary.vue';
import RoomHeader from '@/components/room/RoomHeader.vue';
import RoomNameGate from '@/components/room/RoomNameGate.vue';
import RoomToolbar from '@/components/room/RoomToolbar.vue';
import { useSession } from '@/composables/useSession';
import { useRoom } from '@/composables/useRoom';

const route = useRoute();
const roomId = route.params.id as string;

const { sessionId, name } = useSession();
const hasName = computed(() => name.value.trim().length > 0);

const {
  store,
  selectCard,
  reveal,
  reset,
  setTask,
  setDeck,
  transferMaster,
  togglePublicMode,
  setTitle,
  kickParticipant,
} = useRoom(roomId);

const isMaster = computed(() => store.room?.masterSessionId === sessionId);
const isMasterOrPublic = computed(() => isMaster.value || store.room?.isPublicMode === true);
const anyVoted = computed(() => store.room?.participants.some((p) => p.hasVoted) ?? false);
const isLeaderless = computed(
  () =>
    store.room?.masterSessionId != null &&
    !store.room.participants.find(
      (p) => p.sessionId === store.room?.masterSessionId && p.isConnected
    )
);

const mySelectedCard = ref<string | null>(null);
watch(
  () => store.room?.state,
  (state) => {
    if (state === 'voting') {
      mySelectedCard.value = null;
    }
  }
);

function onSelectCard(value: string): void {
  mySelectedCard.value = value;
  selectCard(value);
}

function seatCardState(p: ParticipantPayload): 'idle' | 'voted' | 'revealed' {
  if (store.room?.state === 'revealed') {
    return 'revealed';
  }
  return p.hasVoted ? 'voted' : 'idle';
}
</script>

<style scoped lang="scss">
.room-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  min-height: calc(100vh - 64px);

  &__link {
    color: var(--color-accent);
    text-decoration: underline;
  }
}

.room {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  max-width: 900px;
  margin: 0 auto;

  &__participants {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  &__hand {
    background: var(--color-base-100);
    border: 1px solid var(--color-base-300);
    border-radius: 0.75rem;
  }
}
</style>
