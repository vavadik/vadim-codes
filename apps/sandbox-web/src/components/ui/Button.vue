<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="btn"
    :class="[variantClass[variant], sizeClass[size], { loading: loading }]"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
type Variant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'error';
type Size = 'xs' | 'sm' | 'md' | 'lg';

const props = withDefaults(
  defineProps<{
    variant?: Variant;
    size?: Size;
    loading?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
  }>(),
  { variant: 'primary', size: 'md', type: 'button' }
);

const variantClass: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  accent: 'btn-accent',
  ghost: 'btn-ghost',
  outline: 'btn-outline',
  error: 'btn-error',
};

const sizeClass: Record<Size, string> = {
  xs: 'btn-xs',
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
};
</script>
