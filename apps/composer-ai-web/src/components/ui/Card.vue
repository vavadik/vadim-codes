<template>
  <div class="card bg-base-100 border border-base-300" :class="{ 'shadow-sm': shadow }">
    <div class="card-body gap-3">
      <div v-if="$slots.header" class="card-title text-base">
        <slot name="header" />
      </div>
      <slot />
      <div v-if="$slots.footer" class="pt-2 border-t border-base-300 text-sm text-base-content/60">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ shadow?: boolean }>(), { shadow: true });
</script>
