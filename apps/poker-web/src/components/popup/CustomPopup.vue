<template>
  <Card class="w-full max-w-md shadow-2xl">
    <template #header>{{ title }}</template>

    <Input v-model="value" label="Name" @keydown.enter="submit" @keydown.esc="resolve(undefined)" />

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button variant="ghost" @click="resolve(undefined)">Cancel</Button>
        <Button :disabled="!value.trim()" @click="submit">Save</Button>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button, Card, Input } from '@/components/ui';

const props = defineProps<{
  title?: string;
  initialValue?: string;
  resolve: (value: string | undefined) => void;
}>();

const value = ref(props.initialValue ?? '');

function submit() {
  if (value.value.trim()) {
    props.resolve(value.value.trim());
  }
}
</script>
