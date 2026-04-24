<template>
  <AppLayout>
    <!-- Name entry inline (PS-03: no redirect, shown within room page) -->
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
        <!-- Header -->
        <div class="room__header">
          <div class="room__meta">
            <span class="room__title">{{ store.room.title || 'Poker room' }}</span>
            <span class="room__task" v-if="store.room.currentTask">{{
              store.room.currentTask
            }}</span>
          </div>
          <div class="room__invite">
            <span class="room__invite-url">{{ inviteUrl }}</span>
            <Button size="sm" variant="ghost" @click="copyInvite">
              {{ copied ? 'Copied!' : 'Copy link' }}
            </Button>
          </div>
        </div>

        <!-- Participants -->
        <div class="room__participants">
          <div
            v-for="p in store.room.participants"
            :key="p.sessionId"
            class="room__seat"
            :class="{
              'room__seat--disconnected': !p.isConnected,
              'room__seat--voted': p.hasVoted && store.room.state === 'voting',
            }"
          >
            <!-- Face-down / face-up card -->
            <div
              class="room__seat-card"
              :class="{ 'room__seat-card--revealed': store.room.state === 'revealed' }"
            >
              <span v-if="store.room.state === 'revealed' && store.room.votes">
                {{ store.room.votes[p.sessionId] ?? '–' }}
              </span>
              <span v-else-if="p.hasVoted">✓</span>
            </div>
            <span class="room__seat-name">
              {{ p.name }}
              <span v-if="p.sessionId === store.room.masterSessionId"> 👑</span>
              <span v-if="!p.isConnected" class="room__seat-offline"> (offline)</span>
            </span>
          </div>
        </div>

        <!-- Master toolbar (PS-05 / PS-06) -->
        <div v-if="isMasterOrPublic" class="room__toolbar">
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
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import AppLayout from '@/components/layouts/AppLayout.vue';
import { Alert, Button, Input, Loading } from '@/components/ui';
import CardHand from '@/components/room/CardHand.vue';
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
const { store, selectCard, reveal, reset } = useRoom(roomId);

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
const isMasterOrPublic = computed(
  () => store.room?.masterSessionId === sessionId || store.room?.isPublicMode === true
);

const anyVoted = computed(() => store.room?.participants.some((p) => p.hasVoted) ?? false);

// Local selection — the server doesn't echo the value back during voting,
// only hasVoted is broadcast. We track it ourselves and clear on reset.
const mySelectedCard = ref<string | null>(null);

// Clear local selection when the round resets
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

  &__task {
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

  &__seat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;

    &--disconnected {
      opacity: 0.45;
    }
  }

  &__seat-card {
    width: 3.5rem;
    height: 5rem;
    border: 2px solid var(--color-base-300);
    border-radius: 0.5rem;
    background: var(--color-base-200);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    font-weight: 700;
    transition:
      transform 0.3s,
      background 0.3s,
      border-color 0.3s;

    &--revealed {
      border-color: var(--color-accent);
      background: var(--color-accent-subtle);
      color: var(--color-accent);
    }
  }

  &__seat-name {
    font-size: 0.8rem;
    text-align: center;
    max-width: 5rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__seat-offline {
    color: color-mix(in oklch, var(--color-base-content) 40%, transparent);
  }

  &__toolbar {
    display: flex;
    justify-content: center;
    padding: 0.5rem 0;
  }

  &__hand {
    background: var(--color-base-100);
    border: 1px solid var(--color-base-300);
    border-radius: 0.75rem;
  }
}
</style>
