<template>
  <Card class="w-full max-w-md shadow-2xl">
    <template #header>{{ title }}</template>

    <p class="text-base-content/70 text-sm">{{ message }}</p>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button variant="ghost" @click="resolve(false)">{{ cancelLabel }}</Button>
        <Button variant="error" @click="resolve(true)">{{ confirmLabel }}</Button>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { Button, Card } from '@/components/ui';

withDefaults(
  defineProps<{
    message: string;
    title?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    resolve: (value: boolean | undefined) => void;
  }>(),
  {
    title: 'Confirm',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
  }
);
</script>
