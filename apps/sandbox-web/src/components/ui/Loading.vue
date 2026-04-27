<template>
  <span class="loading" :class="[variantClass[variant], sizeClass[size]]" />
</template>

<script setup lang="ts">
type Variant = 'spinner' | 'dots' | 'ring' | 'bars';
type Size = 'xs' | 'sm' | 'md' | 'lg';

const props = withDefaults(defineProps<{ variant?: Variant; size?: Size }>(), {
  variant: 'spinner',
  size: 'md',
});

const variantClass: Record<Variant, string> = {
  spinner: 'loading-spinner',
  dots: 'loading-dots',
  ring: 'loading-ring',
  bars: 'loading-bars',
};

const sizeClass: Record<Size, string> = {
  xs: 'loading-xs',
  sm: 'loading-sm',
  md: 'loading-md',
  lg: 'loading-lg',
};
</script>
