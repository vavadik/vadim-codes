<template>
  <dialog ref="dialogRef" class="modal" @click="onBackdropClick">
    <div class="modal-box">
      <h3 v-if="$slots.title" class="text-lg font-bold mb-4">
        <slot name="title" />
      </h3>
      <slot />
      <div v-if="$slots.actions" class="modal-action">
        <slot name="actions" />
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: [] }>();

const dialogRef = ref<HTMLDialogElement | null>(null);

watch(
  () => props.open,
  (val) => {
    if (val) {
      dialogRef.value?.showModal();
    } else {
      dialogRef.value?.close();
    }
  },
  { immediate: true }
);

function onBackdropClick(e: MouseEvent) {
  if (e.target === dialogRef.value) {
    emit('close');
  }
}
</script>
