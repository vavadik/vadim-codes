<template>
  <AppLayout>
    <div class="home">
      <div class="home__card">
        <!-- PS-01: name entry -->
        <template v-if="!hasName">
          <h1 class="home__title">Welcome to Poker</h1>
          <p class="home__subtitle">Enter your display name to get started.</p>
          <form class="home__form" @submit.prevent="submitName">
            <Input
              ref="nameInputRef"
              v-model="nameInput"
              placeholder="Your name"
              :error="nameError"
            />
            <Button type="submit" variant="primary" class="home__cta">Continue</Button>
          </form>
        </template>

        <!-- PS-02: create room -->
        <template v-else>
          <h1 class="home__title">Ready to estimate?</h1>
          <p class="home__subtitle">Create a room and share the link with your team.</p>
          <form class="home__form" @submit.prevent="createRoom">
            <Input v-model="roomTitle" placeholder="Room title (optional)" />
            <Alert v-if="createError" variant="error" :dismissible="true">{{ createError }}</Alert>
            <Button type="submit" variant="primary" :loading="isCreating" class="home__cta">
              Create room
            </Button>
          </form>
        </template>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AppLayout from '@/components/layouts/AppLayout.vue';
import { Alert, Button, Input } from '@/components/ui';
import { useSession } from '@/composables/useSession';
import { roomApi } from '@/api/roomApi';

const router = useRouter();
const { name, setName } = useSession();

const hasName = computed(() => name.value.trim().length > 0);

// PS-01 — name entry
const nameInput = ref(name.value);
const nameError = ref('');
const nameInputRef = ref<InstanceType<typeof Input> | null>(null);

onMounted(() => {
  if (!hasName.value) {
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

// PS-02 — create room
const roomTitle = ref('');
const isCreating = ref(false);
const createError = ref('');

async function createRoom(): Promise<void> {
  isCreating.value = true;
  createError.value = '';
  try {
    const res = await roomApi.createRoom({
      body: { title: roomTitle.value.trim() || undefined },
    });
    if (res.status === 201) {
      await router.push(`/room/${res.body.id}`);
    } else {
      createError.value = 'Failed to create room. Please try again.';
    }
  } catch {
    createError.value = 'Network error. Please try again.';
  } finally {
    isCreating.value = false;
  }
}
</script>

<style scoped lang="scss">
.home {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  padding: 2rem 1rem;

  &__card {
    width: 100%;
    max-width: 400px;
    background: var(--color-base-100);
    border: 1px solid var(--color-base-300);
    border-radius: 1rem;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__title {
    font-size: 1.5rem;
    font-weight: 700;
    text-align: center;
  }

  &__subtitle {
    font-size: 0.9rem;
    text-align: center;
    color: color-mix(in oklch, var(--color-base-content) 60%, transparent);
    margin-top: -0.5rem;
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
</style>
