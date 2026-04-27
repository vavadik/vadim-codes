<template>
  <div class="divider" :class="{ 'divider-horizontal': vertical }">
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ vertical?: boolean }>(), { vertical: false });
</script>
