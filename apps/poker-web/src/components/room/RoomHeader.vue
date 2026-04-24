<template>
  <div class="room-header">
    <div class="room-header__meta">
      <div class="room-header__title-row">
        <span class="room-header__title">{{ title || 'Poker room' }}</span>
        <Badge v-if="isPublicMode" variant="accent" size="sm">Public</Badge>
        <Badge v-if="isLeaderless" variant="warning" size="sm">No facilitator</Badge>
      </div>

      <div class="room-header__task">
        <template v-if="isMaster && !taskEditing">
          <button class="room-header__task-btn" @click="startTaskEdit">
            {{ currentTask || 'Click to set task…' }}
          </button>
        </template>
        <template v-else-if="isMaster && taskEditing">
          <input
            ref="taskInputRef"
            v-model="taskDraft"
            class="room-header__task-input"
            placeholder="Describe the task…"
            maxlength="256"
            @keydown.enter="saveTask"
            @keydown.esc="cancelTask"
            @blur="saveTask"
          />
        </template>
        <span v-else class="room-header__task-readonly">
          {{ currentTask || 'No task set' }}
        </span>
      </div>
    </div>

    <div class="room-header__actions">
      <div class="room-header__invite">
        <span class="room-header__invite-url">{{ inviteUrl }}</span>
        <Button size="sm" variant="ghost" @click="copyInvite">
          {{ copied ? 'Copied!' : 'Copy link' }}
        </Button>
      </div>
      <button
        v-if="isMaster"
        class="room-header__settings-btn"
        title="Room settings"
        @click="settingsOpen = true"
      >
        ⚙
      </button>
    </div>
  </div>

  <RoomSettingsModal
    :open="settingsOpen"
    :transfer-master="transferMaster"
    :toggle-public-mode="togglePublicMode"
    :set-title="setTitle"
    :set-deck="setDeck"
    @close="settingsOpen = false"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Badge, Button } from '@/components/ui';
import RoomSettingsModal from './RoomSettingsModal.vue';
import { useTaskEdit } from '@/composables/useTaskEdit';

const props = defineProps<{
  title: string;
  currentTask: string;
  isPublicMode: boolean;
  isLeaderless: boolean;
  isMaster: boolean;
  transferMaster: (sessionId: string) => void;
  togglePublicMode: (enabled: boolean) => void;
  setTitle: (title: string) => void;
  setDeck: (deck: string, deckValues?: string[]) => void;
  setTask: (task: string) => void;
}>();

const {
  editing: taskEditing,
  draft: taskDraft,
  inputRef: taskInputRef,
  startEdit: startTaskEdit,
  save: saveTask,
  cancel: cancelTask,
} = useTaskEdit(
  () => props.currentTask,
  (task) => props.setTask(task)
);

const settingsOpen = ref(false);

const inviteUrl = computed(() => window.location.href);
const copied = ref(false);

async function copyInvite(): Promise<void> {
  await navigator.clipboard.writeText(inviteUrl.value);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}
</script>

<style scoped lang="scss">
.room-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  background: var(--color-base-100);
  border: 1px solid var(--color-base-300);
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;

  &__meta {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  &__title-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  &__title {
    font-size: 1.125rem;
    font-weight: 700;
  }

  &__task {
    min-height: 1.5rem;
  }

  &__task-btn {
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

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
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

  &__settings-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.1rem;
    color: color-mix(in oklch, var(--color-base-content) 60%, transparent);
    padding: 0.25rem;
    line-height: 1;

    &:hover {
      color: var(--color-base-content);
    }
  }
}
</style>
