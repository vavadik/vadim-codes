<template>
  <AppLayout>
    <!-- Name entry inline (PS-03) -->
    <div v-if="needsName" class="room-gate">
      <div class="room-gate__card">
        <h2 class="room-gate__title">What's your name?</h2>
        <form class="room-gate__form" @submit.prevent="submitName">
          <Input
            ref="nameInputRef"
            v-model="nameInput"
            placeholder="Your name"
            :error="nameError"
          />
          <Button type="submit" variant="primary" class="room-gate__cta">Join room</Button>
        </form>
      </div>
    </div>

    <template v-else>
      <!-- Connecting -->
      <div v-if="store.isConnecting" class="room-status">
        <Loading />
        <span>Connecting…</span>
      </div>

      <!-- Room not found -->
      <div v-else-if="store.error" class="room-status">
        <Alert variant="error">{{ store.error }}</Alert>
        <RouterLink to="/" class="room-status__link">← Back to home</RouterLink>
      </div>

      <!-- Room loaded -->
      <div v-else-if="store.room" class="room">
        <!-- Results summary (PS-09) — shown after reveal -->
        <ResultsSummary
          v-if="store.room.state === 'revealed' && store.room.votes"
          :votes="store.room.votes"
          :participants="store.room.participants"
        />

        <!-- Header -->
        <div class="room__header">
          <div class="room__meta">
            <span class="room__title">{{ store.room.title || 'Poker room' }}</span>

            <!-- PS-08: current task — editable for master, read-only for others -->
            <div class="room__task-wrap">
              <template v-if="isMaster && !editingTask">
                <button class="room__task-edit-btn" @click="startEditTask">
                  {{ store.room.currentTask || 'Click to set task…' }}
                </button>
              </template>
              <template v-else-if="isMaster && editingTask">
                <input
                  ref="taskInputRef"
                  v-model="taskDraft"
                  class="room__task-input"
                  placeholder="Describe the task…"
                  maxlength="256"
                  @keydown.enter="saveTask"
                  @keydown.esc="cancelEditTask"
                  @blur="saveTask"
                />
              </template>
              <span v-else class="room__task-readonly">
                {{ store.room.currentTask || 'No task set' }}
              </span>
            </div>
          </div>
          <div class="room__invite">
            <span class="room__invite-url">{{ inviteUrl }}</span>
            <Button size="sm" variant="ghost" @click="copyInvite">
              {{ copied ? 'Copied!' : 'Copy link' }}
            </Button>
          </div>
        </div>

        <!-- Participants (PS-07: PlayerSeat component) -->
        <div class="room__participants">
          <PlayerSeat
            v-for="p in store.room.participants"
            :key="p.sessionId"
            :name="p.name"
            :card-state="seatCardState(p)"
            :card-value="store.room.votes?.[p.sessionId] ?? undefined"
            :is-master="p.sessionId === store.room.masterSessionId"
            :is-connected="p.isConnected"
          />
        </div>

        <!-- Master toolbar (PS-05 / PS-06 / PS-10) -->
        <div v-if="isMasterOrPublic" class="room__toolbar">
          <!-- PS-10: Deck selector (master only) -->
          <div v-if="isMaster" class="room__deck-selector">
            <select :value="store.room.deck" class="room__deck-select" @change="onDeckChange">
              <option value="fibonacci">Fibonacci</option>
              <option value="tshirt">T-shirt</option>
              <option value="powersOfTwo">Powers of 2</option>
              <option value="custom">Custom…</option>
            </select>
            <div v-if="store.room.deck === 'custom'" class="room__custom-deck">
              <input
                v-model="customDeckInput"
                class="room__custom-deck-input"
                placeholder="1, 2, 4, 8…"
                @keydown.enter="applyCustomDeck"
              />
              <Button size="sm" variant="ghost" @click="applyCustomDeck">Apply</Button>
            </div>
          </div>
          <span v-else class="room__deck-label">Deck: {{ deckLabel }}</span>

          <Button
            v-if="store.room.state === 'voting'"
            variant="primary"
            :disabled="!anyVoted"
            @click="reveal"
          >
            Reveal
          </Button>
          <Button v-else variant="secondary" @click="reset"> New round </Button>
        </div>

        <!-- Card hand (PS-04) -->
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
import { ref, computed, nextTick, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import type { ParticipantPayload } from '@vadim-codes/poker-contracts';
import AppLayout from '@/components/layouts/AppLayout.vue';
import { Alert, Button, Input, Loading } from '@/components/ui';
import CardHand from '@/components/room/CardHand.vue';
import PlayerSeat from '@/components/room/PlayerSeat.vue';
import ResultsSummary from '@/components/room/ResultsSummary.vue';
import { useSession } from '@/composables/useSession';
import { useRoom } from '@/composables/useRoom';

const route = useRoute();
const roomId = route.params.id as string;

const { sessionId, name, setName } = useSession();

// PS-03: inline name entry without redirect
const needsName = computed(() => name.value.trim().length === 0);
const nameInput = ref('');
const nameError = ref('');
const nameInputRef = ref<InstanceType<typeof Input> | null>(null);

onMounted(() => {
  if (needsName.value) {
    nameInputRef.value?.$el.querySelector('input')?.focus();
  }
});

function submitName(): void {
  const trimmed = nameInput.value.trim().slice(0, 32);
  if (!trimmed) {
    nameError.value = 'Name cannot be empty.';
    return;
  }
  nameError.value = '';
  setName(trimmed);
}

// Room connection — only active once name is set
const { store, selectCard, reveal, reset, setTask, setDeck } = useRoom(roomId);

// Invite link copy (PS-02)
const copied = ref(false);
const inviteUrl = computed(() => window.location.href);

async function copyInvite(): Promise<void> {
  await navigator.clipboard.writeText(inviteUrl.value);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}

// Derived state
const isMaster = computed(() => store.room?.masterSessionId === sessionId);
const isMasterOrPublic = computed(() => isMaster.value || store.room?.isPublicMode === true);
const anyVoted = computed(() => store.room?.participants.some((p) => p.hasVoted) ?? false);

// Local selection — cleared on round reset
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

// PS-07: derive cardState for each seat
function seatCardState(p: ParticipantPayload): 'idle' | 'voted' | 'revealed' {
  if (store.room?.state === 'revealed') {
    return 'revealed';
  }
  return p.hasVoted ? 'voted' : 'idle';
}

// PS-08: task inline editing
const editingTask = ref(false);
const taskDraft = ref('');
const taskInputRef = ref<HTMLInputElement | null>(null);

function startEditTask(): void {
  taskDraft.value = store.room?.currentTask ?? '';
  editingTask.value = true;
  nextTick(() => taskInputRef.value?.focus());
}

function saveTask(): void {
  if (!editingTask.value) {
    return;
  }
  editingTask.value = false;
  const trimmed = taskDraft.value.trim().slice(0, 256);
  if (trimmed !== store.room?.currentTask) {
    setTask(trimmed);
  }
}

function cancelEditTask(): void {
  editingTask.value = false;
}

// PS-10: deck selection
const customDeckInput = ref('');

const DECK_LABELS: Record<string, string> = {
  fibonacci: 'Fibonacci',
  tshirt: 'T-shirt',
  powersOfTwo: 'Powers of 2',
  custom: 'Custom',
};

const deckLabel = computed(() => DECK_LABELS[store.room?.deck ?? 'fibonacci'] ?? 'Fibonacci');

function onDeckChange(event: Event): void {
  const deck = (event.target as HTMLSelectElement).value;
  if (deck !== 'custom') {
    setDeck(deck);
  } else {
    customDeckInput.value = store.room?.deckValues.join(', ') ?? '';
  }
}

function applyCustomDeck(): void {
  const values = customDeckInput.value
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v.length > 0 && v.length <= 8)
    .slice(0, 20);
  if (values.length === 0) {
    return;
  }
  setDeck('custom', values);
}
</script>

<style scoped lang="scss">
.room-gate {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  padding: 2rem 1rem;

  &__card {
    width: 100%;
    max-width: 360px;
    background: var(--color-base-100);
    border: 1px solid var(--color-base-300);
    border-radius: 1rem;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__title {
    font-size: 1.25rem;
    font-weight: 700;
    text-align: center;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__cta {
    width: 100%;
  }
}

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

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    background: var(--color-base-100);
    border: 1px solid var(--color-base-300);
    border-radius: 0.75rem;
    padding: 1rem 1.25rem;
  }

  &__meta {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  &__title {
    font-size: 1.125rem;
    font-weight: 700;
  }

  // PS-08: task area
  &__task-wrap {
    min-height: 1.5rem;
  }

  &__task-edit-btn {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-size: 0.875rem;
    color: color-mix(in oklch, var(--color-base-content) 60%, transparent);
    text-align: left;

    &:hover {
      color: var(--color-accent);
      text-decoration: underline;
    }
  }

  &__task-input {
    font-size: 0.875rem;
    background: none;
    border: none;
    border-bottom: 1px solid var(--color-accent);
    outline: none;
    color: var(--color-base-content);
    width: 280px;
    max-width: 100%;
    padding: 0 0 2px;
  }

  &__task-readonly {
    font-size: 0.875rem;
    color: color-mix(in oklch, var(--color-base-content) 60%, transparent);
  }

  &__invite {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__invite-url {
    font-size: 0.75rem;
    color: color-mix(in oklch, var(--color-base-content) 50%, transparent);
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__participants {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.75rem;
    padding: 0.5rem 0;
  }

  // PS-10: deck selector
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

  &__hand {
    background: var(--color-base-100);
    border: 1px solid var(--color-base-300);
    border-radius: 0.75rem;
  }
}
</style>
