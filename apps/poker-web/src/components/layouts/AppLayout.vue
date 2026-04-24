<template>
  <div class="min-h-screen bg-base-200">
    <div class="navbar bg-base-100 border-b border-base-300 px-6">
      <div class="navbar-start">
        <RouterLink to="/" class="text-xl font-bold">poker</RouterLink>
      </div>
      <div class="navbar-end gap-4">
        <button
          class="theme-toggle"
          :aria-label="theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
          @click="toggle"
        >
          <svg v-if="theme === 'light'" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2" />
            <path
              d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';

const { theme, toggle } = useTheme();
</script>

<style scoped lang="scss">
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--color-base-content);
  cursor: pointer;
  opacity: 0.7;
  transition:
    opacity 0.15s,
    background 0.15s;

  &:hover {
    opacity: 1;
    background: var(--color-base-200);
  }
}
</style>
