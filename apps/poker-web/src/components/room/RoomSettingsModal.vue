<template>
  <Modal :open="open" @close="$emit('close')">
    <template #title>Room settings</template>

    <!-- General -->
    <section class="settings-section">
      <h4 class="settings-section__heading">General</h4>
      <div class="settings-row">
        <label class="settings-label">Room title</label>
        <input
          v-model="titleDraft"
          class="settings-input"
          placeholder="Untitled room"
          maxlength="100"
          @keydown.enter="saveTitle"
          @blur="saveTitle"
        />
      </div>
      <div class="settings-row">
        <label class="settings-label">Invite link</label>
        <Button size="sm" variant="ghost" @click="copyInvite">
          {{ copied ? 'Copied!' : 'Copy link' }}
        </Button>
      </div>
    </section>

    <Divider />

    <!-- Session -->
    <section class="settings-section">
      <h4 class="settings-section__heading">Session</h4>
      <div class="settings-row settings-row--between">
        <label class="settings-label">Public mode</label>
        <input
          type="checkbox"
          class="toggle toggle-accent toggle-sm"
          :checked="store.room?.isPublicMode"
          @change="onTogglePublicMode"
        />
      </div>
      <p class="settings-hint">When on, anyone can reveal cards, reset, and set the task.</p>
      <div class="settings-row">
        <label class="settings-label">Deck</label>
        <select :value="store.room?.deck" class="settings-select" @change="onDeckChange">
          <option value="fibonacci">Fibonacci</option>
          <option value="tshirt">T-shirt</option>
          <option value="powersOfTwo">Powers of 2</option>
          <option value="custom">Custom…</option>
        </select>
      </div>
      <div v-if="store.room?.deck === 'custom'" class="settings-row">
        <input
          v-model="customDeckInput"
          class="settings-input"
          placeholder="1, 2, 4, 8…"
          @keydown.enter="applyCustomDeck"
        />
        <Button size="sm" variant="ghost" @click="applyCustomDeck">Apply</Button>
      </div>
    </section>

    <Divider />

    <!-- Participants -->
    <section class="settings-section">
      <h4 class="settings-section__heading">Participants</h4>
      <ul class="settings-participants">
        <li v-for="p in store.room?.participants" :key="p.sessionId" class="settings-participant">
          <span class="settings-participant__name">
            {{ p.name }}
            <span
              v-if="p.sessionId === store.room?.masterSessionId"
              class="settings-participant__crown"
              title="Current master"
              >👑</span
            >
          </span>
          <Button
            v-if="p.sessionId !== sessionId && p.sessionId !== store.room?.masterSessionId"
            size="xs"
            variant="ghost"
            @click="onTransferMaster(p.sessionId)"
          >
            Make master
          </Button>
        </li>
      </ul>
    </section>

    <Divider />

    <!-- Danger zone -->
    <section class="settings-section">
      <h4 class="settings-section__heading settings-section__heading--danger">Danger zone</h4>
      <Alert v-if="deleteError" variant="error">{{ deleteError }}</Alert>
      <Button variant="error" size="sm" :loading="isDeleting" @click="confirmDelete">
        Delete room
      </Button>
    </section>

    <template #actions>
      <Button variant="ghost" @click="$emit('close')">Close</Button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Alert, Button, Divider, Modal } from '@/components/ui';
import { useRoomStore } from '@/stores/room';
import { useSession } from '@/composables/useSession';
import { useDeleteRoom } from '@/composables/useDeleteRoom';

const props = defineProps<{
  open: boolean;
  transferMaster: (sessionId: string) => void;
  togglePublicMode: (enabled: boolean) => void;
  setTitle: (title: string) => void;
  setDeck: (deck: string, deckValues?: string[]) => void;
}>();

const emit = defineEmits<{ close: [] }>();

const store = useRoomStore();
const { sessionId } = useSession();
const { deleteRoom, isDeleting, deleteError } = useDeleteRoom();

// Title
const titleDraft = ref(store.room?.title ?? '');
watch(
  () => store.room?.title,
  (val) => {
    titleDraft.value = val ?? '';
  }
);

function saveTitle(): void {
  const trimmed = titleDraft.value.trim();
  if (trimmed !== store.room?.title) {
    props.setTitle(trimmed);
  }
}

// Invite link
const copied = ref(false);
async function copyInvite(): Promise<void> {
  await navigator.clipboard.writeText(window.location.href);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}

// Public mode
function onTogglePublicMode(e: Event): void {
  props.togglePublicMode((e.target as HTMLInputElement).checked);
}

// Deck
const customDeckInput = ref('');
function onDeckChange(e: Event): void {
  const deck = (e.target as HTMLSelectElement).value;
  if (deck !== 'custom') {
    props.setDeck(deck);
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
  if (values.length > 0) {
    props.setDeck('custom', values);
  }
}

// Transfer master
function onTransferMaster(targetSessionId: string): void {
  props.transferMaster(targetSessionId);
}

// Delete room
async function confirmDelete(): Promise<void> {
  if (!store.room) {
    return;
  }
  const confirmed = window.confirm('Delete this room? This cannot be undone.');
  if (!confirmed) {
    return;
  }
  await deleteRoom(store.room.id, true);
}
</script>

<style scoped lang="scss">
.settings-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem 0;

  &__heading {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: color-mix(in oklch, var(--color-base-content) 50%, transparent);
    margin-bottom: 0.25rem;

    &--danger {
      color: var(--color-error);
    }
  }
}

.settings-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &--between {
    justify-content: space-between;
  }
}

.settings-label {
  font-size: 0.875rem;
  min-width: 6rem;
  flex-shrink: 0;
}

.settings-input {
  flex: 1;
  font-size: 0.875rem;
  background: var(--color-base-200);
  border: 1px solid var(--color-base-300);
  border-radius: 0.375rem;
  padding: 0.25rem 0.5rem;
  color: var(--color-base-content);
  outline: none;

  &:focus {
    border-color: var(--color-accent);
  }
}

.settings-select {
  font-size: 0.875rem;
  background: var(--color-base-200);
  border: 1px solid var(--color-base-300);
  border-radius: 0.375rem;
  padding: 0.25rem 0.5rem;
  color: var(--color-base-content);
  cursor: pointer;

  &:focus {
    outline: 1px solid var(--color-accent);
  }
}

.settings-hint {
  font-size: 0.75rem;
  color: color-mix(in oklch, var(--color-base-content) 50%, transparent);
}

.settings-participants {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.settings-participant {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;

  &__name {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  &__crown {
    font-size: 0.75rem;
  }
}
</style>
