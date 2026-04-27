<template>
  <span class="badge" :class="[variantClass[variant], sizeClass[size]]">
    <slot />
  </span>
</template>

<script setup lang="ts">
type Variant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'ghost'
  | 'outline'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';
type Size = 'xs' | 'sm' | 'md' | 'lg';

const props = withDefaults(defineProps<{ variant?: Variant; size?: Size }>(), {
  variant: 'primary',
  size: 'md',
});

const variantClass: Record<Variant, string> = {
  primary: 'badge-primary',
  secondary: 'badge-secondary',
  accent: 'badge-accent',
  ghost: 'badge-ghost',
  outline: 'badge-outline',
  info: 'badge-info',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
};

const sizeClass: Record<Size, string> = {
  xs: 'badge-xs',
  sm: 'badge-sm',
  md: '',
  lg: 'badge-lg',
};
</script>
