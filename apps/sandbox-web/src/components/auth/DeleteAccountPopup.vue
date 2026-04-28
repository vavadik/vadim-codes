<template>
  <Card class="w-full max-w-md shadow-2xl">
    <template #header>Delete Account</template>

    <p class="delete-popup__message">
      Your account will be deleted. Your saved snippets will remain accessible via their share links
      but will no longer appear in any account list.
    </p>

    <div class="delete-popup__field">
      <label class="delete-popup__label">Type <strong>delete</strong> to confirm</label>
      <Input v-model="confirmation" placeholder="delete" autofocus />
    </div>

    <template #footer>
      <div class="delete-popup__actions">
        <Button variant="ghost" @click="resolve(false)">Cancel</Button>
        <Button variant="error" :disabled="!isConfirmed" @click="resolve(true)">
          Delete Account
        </Button>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Button, Card, Input } from '@/components/ui';

defineProps<{
  resolve: (value: boolean | undefined) => void;
}>();

const confirmation = ref('');
const isConfirmed = computed(() => confirmation.value.trim().toLowerCase() === 'delete');
</script>

<style scoped lang="scss">
.delete-popup {
  &__message {
    font-size: 14px;
    color: color-mix(in oklch, var(--color-base-content) 70%, transparent);
    line-height: 1.5;
    margin-bottom: 16px;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__label {
    font-size: 13px;
    color: color-mix(in oklch, var(--color-base-content) 60%, transparent);
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}
</style>
