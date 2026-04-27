<template>
  <div v-if="visible" class="alert" :class="variantClass[variant]" role="alert">
    <span class="flex-1"><slot /></span>
    <button v-if="dismissible" class="btn btn-ghost btn-xs btn-circle" @click="dismiss">✕</button>
  </div>
</template>

<script setup lang="ts">
type Variant = 'info' | 'success' | 'warning' | 'error';

withDefaults(defineProps<{ variant?: Variant; dismissible?: boolean }>(), {
  variant: 'info',
});

const emit = defineEmits<{ dismiss: [] }>();

const visible = defineModel<boolean>('visible', { default: true });

function dismiss() {
  visible.value = false;
  emit('dismiss');
}

const variantClass: Record<Variant, string> = {
  info: 'alert-info',
  success: 'alert-success',
  warning: 'alert-warning',
  error: 'alert-error',
};
</script>
