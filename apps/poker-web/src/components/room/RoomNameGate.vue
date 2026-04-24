<template>
  <div class="room-gate">
    <div class="room-gate__card">
      <h2 class="room-gate__title">What's your name?</h2>
      <form class="room-gate__form" @submit.prevent="submit">
        <Input ref="inputRef" v-model="nameInput" placeholder="Your name" :error="nameError" />
        <Button type="submit" variant="primary" class="room-gate__cta">Join room</Button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Button, Input } from '@/components/ui';
import { useSession } from '@/composables/useSession';

const { setName } = useSession();

const nameInput = ref('');
const nameError = ref('');
const inputRef = ref<InstanceType<typeof Input> | null>(null);

onMounted(() => {
  inputRef.value?.$el.querySelector('input')?.focus();
});

function submit(): void {
  const trimmed = nameInput.value.trim().slice(0, 32);
  if (!trimmed) {
    nameError.value = 'Name cannot be empty.';
    return;
  }
  nameError.value = '';
  setName(trimmed);
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
</style>
