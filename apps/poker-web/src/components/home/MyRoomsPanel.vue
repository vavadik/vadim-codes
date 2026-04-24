<template>
  <div class="my-rooms">
    <h2 class="my-rooms__heading">My rooms</h2>

    <Alert v-if="toastMessage" variant="error" class="my-rooms__toast">{{ toastMessage }}</Alert>

    <template v-if="ownedRooms.length > 0">
      <h3 class="my-rooms__subheading">Owned</h3>
      <ul class="my-rooms__list">
        <li v-for="room in ownedRooms" :key="room.id" class="my-rooms__item">
          <div class="my-rooms__item-info">
            <span class="my-rooms__item-crown" title="You own this room">👑</span>
            <span class="my-rooms__item-title">{{ room.title || 'Untitled room' }}</span>
            <span class="my-rooms__item-time">{{ relativeTime(room.lastVisited) }}</span>
          </div>
          <div class="my-rooms__item-actions">
            <Button size="xs" variant="ghost" @click="openRoom(room.id)">Open</Button>
            <Button
              size="xs"
              variant="error"
              :loading="deletingId === room.id"
              @click="onDelete(room.id)"
              >Delete</Button
            >
          </div>
        </li>
      </ul>
    </template>

    <template v-if="recentRooms.length > 0">
      <h3 class="my-rooms__subheading">Recent</h3>
      <ul class="my-rooms__list">
        <li v-for="room in recentRooms" :key="room.id" class="my-rooms__item">
          <div class="my-rooms__item-info">
            <span class="my-rooms__item-title">{{ room.title || 'Untitled room' }}</span>
            <span class="my-rooms__item-time">{{ relativeTime(room.lastVisited) }}</span>
          </div>
          <div class="my-rooms__item-actions">
            <Button size="xs" variant="ghost" @click="openRoom(room.id)">Rejoin</Button>
          </div>
        </li>
      </ul>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Alert, Button } from '@/components/ui';
import { useSession } from '@/composables/useSession';
import { useDeleteRoom } from '@/composables/useDeleteRoom';

const router = useRouter();
const { rooms } = useSession();
const { deleteRoom } = useDeleteRoom();

const deletingId = ref<string | null>(null);
const toastMessage = ref('');
let toastTimer: ReturnType<typeof setTimeout> | null = null;

const ownedRooms = computed(() => rooms.value.filter((r) => r.isOwner));
const recentRooms = computed(() => rooms.value.filter((r) => !r.isOwner));

function openRoom(id: string): void {
  router.push(`/room/${id}`);
}

async function onDelete(id: string): Promise<void> {
  deletingId.value = id;
  const ok = await deleteRoom(id);
  deletingId.value = null;
  if (!ok) {
    showToast('Failed to delete room.');
  }
}

function showToast(msg: string): void {
  toastMessage.value = msg;
  if (toastTimer) {
    clearTimeout(toastTimer);
  }
  toastTimer = setTimeout(() => {
    toastMessage.value = '';
  }, 4000);
}

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

function relativeTime(iso: string): string {
  const diffMs = Date.parse(iso) - Date.now();
  const seconds = Math.round(diffMs / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  if (Math.abs(days) >= 1) {
    return rtf.format(days, 'day');
  }
  if (Math.abs(hours) >= 1) {
    return rtf.format(hours, 'hour');
  }
  if (Math.abs(minutes) >= 1) {
    return rtf.format(minutes, 'minute');
  }
  return rtf.format(seconds, 'second');
}
</script>

<style scoped lang="scss">
.my-rooms {
  width: 100%;
  max-width: 400px;
  background: var(--color-base-100);
  border: 1px solid var(--color-base-300);
  border-radius: 1rem;
  padding: 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &__heading {
    font-size: 1.125rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
  }

  &__subheading {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: color-mix(in oklch, var(--color-base-content) 50%, transparent);
    margin-top: 0.5rem;
  }

  &__list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  &__item-info {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    min-width: 0;
  }

  &__item-crown {
    font-size: 0.75rem;
    flex-shrink: 0;
  }

  &__item-title {
    font-size: 0.875rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__item-time {
    font-size: 0.75rem;
    color: color-mix(in oklch, var(--color-base-content) 50%, transparent);
    white-space: nowrap;
    flex-shrink: 0;
  }

  &__item-actions {
    display: flex;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  &__toast {
    margin-bottom: 0.25rem;
  }
}
</style>
