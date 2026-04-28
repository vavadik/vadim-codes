<template>
  <div class="app-layout">
    <!-- Left Pane -->
    <aside class="app-layout__left">
      <div class="app-layout__snippets">
        <!-- Snippet list — populated in CS-16 -->
      </div>

      <div class="app-layout__settings">
        <button
          class="app-layout__theme-btn"
          :aria-label="theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
          @click="toggleTheme"
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
    </aside>

    <!-- Center Pane -->
    <main class="app-layout__center">
      <div class="app-layout__toolbar">
        <!-- Run, Stop, Fork/Save, elapsed timer — populated in CS-07/CS-08/CS-09/CS-12 -->
      </div>
      <div class="app-layout__editor">
        <MonacoEditor />
      </div>
    </main>

    <!-- Right Pane -->
    <aside class="app-layout__right">
      <!-- User panel -->
      <div class="app-layout__user-panel">
        <template v-if="isAuthenticated && user">
          <img
            v-if="user.avatarUrl"
            :src="user.avatarUrl"
            :alt="user.name ?? 'User'"
            class="app-layout__avatar"
          />
          <div v-else class="app-layout__avatar-placeholder">
            {{ (user.name ?? user.email ?? '?')[0]?.toUpperCase() }}
          </div>
          <span class="app-layout__username">{{ user.name ?? user.email }}</span>
        </template>

        <button
          :class="['app-layout__auth-btn', { 'app-layout__auth-btn--signed-in': isAuthenticated }]"
          @click="handleAuthBtn"
        >
          {{ isAuthenticated ? 'Sign out' : 'Sign in' }}
        </button>
      </div>

      <div class="app-layout__tabs">
        <button
          :class="['app-layout__tab', { 'app-layout__tab--active': activeTab === 'console' }]"
          @click="activeTab = 'console'"
        >
          Console
        </button>
        <button
          :class="['app-layout__tab', { 'app-layout__tab--active': activeTab === 'errors' }]"
          @click="activeTab = 'errors'"
        >
          Errors
        </button>
      </div>
      <div class="app-layout__output">
        <!-- Console output — populated in CS-10 -->
        <!-- Runtime errors — populated in CS-11 -->
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useTheme } from '@/composables/useTheme';
import { useAuth } from '@/composables/useAuth';
import { usePopup } from '@/composables/usePopup';
import MonacoEditor from '@/components/editor/MonacoEditor.vue';
import SignInPopup from '@/components/auth/SignInPopup.vue';

const { theme, toggleTheme } = useTheme();
const { user, isAuthenticated, signIn, signOut } = useAuth();
const { open } = usePopup();
const activeTab = ref<'console' | 'errors'>('console');

async function handleAuthBtn(): Promise<void> {
  if (isAuthenticated.value) {
    await signOut();
  } else {
    const provider = await open<'google' | 'github'>(SignInPopup);
    if (provider) {
      signIn(provider);
    }
  }
}
</script>

<style scoped lang="scss">
.app-layout {
  display: flex;
  height: 100dvh;
  overflow: hidden;
  background: var(--color-base-200);

  &__left {
    width: 260px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: var(--color-base-100);
    border-right: 1px solid var(--color-base-300);
  }

  &__snippets {
    flex: 1;
    overflow-y: auto;
  }

  &__settings {
    padding: 12px;
    border-top: 1px solid var(--color-base-300);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__theme-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    border: none;
    background: transparent;
    color: var(--color-base-content);
    cursor: pointer;
    opacity: 0.6;
    transition:
      opacity 0.15s,
      background 0.15s;

    &:hover {
      opacity: 1;
      background: var(--color-base-200);
    }
  }

  &__user-panel {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 12px;
    height: 44px;
    flex-shrink: 0;
    border-bottom: 1px solid var(--color-base-300);
    overflow: hidden;
  }

  &__avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  &__avatar-placeholder {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--color-accent-subtle);
    color: var(--color-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
    flex-shrink: 0;
  }

  &__username {
    font-size: 13px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
  }

  &__auth-btn {
    margin-left: auto;
    flex-shrink: 0;
    padding: 5px 12px;
    border-radius: 6px;
    border: 1px solid var(--color-accent);
    background: var(--color-accent);
    color: var(--color-accent-content);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition:
      background 0.15s,
      border-color 0.15s,
      color 0.15s;

    &:hover {
      background: var(--color-accent-hover);
      border-color: var(--color-accent-hover);
    }

    &--signed-in {
      background: transparent;
      border-color: var(--color-base-300);
      color: color-mix(in oklch, var(--color-base-content) 55%, transparent);

      &:hover {
        border-color: color-mix(in oklch, var(--color-base-content) 40%, transparent);
        color: var(--color-base-content);
      }
    }
  }

  &__center {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &__toolbar {
    height: 44px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    padding: 0 12px;
    background: var(--color-base-100);
    border-bottom: 1px solid var(--color-base-300);
  }

  &__editor {
    flex: 1;
    overflow: hidden;
  }

  &__right {
    width: 320px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: var(--color-base-100);
    border-left: 1px solid var(--color-base-300);
  }

  &__tabs {
    display: flex;
    border-bottom: 1px solid var(--color-base-300);
    flex-shrink: 0;
  }

  &__tab {
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 500;
    border: none;
    background: transparent;
    color: color-mix(in oklch, var(--color-base-content) 50%, transparent);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition:
      color 0.15s,
      border-color 0.15s;

    &:hover {
      color: var(--color-base-content);
    }

    &--active {
      color: var(--color-accent);
      border-bottom-color: var(--color-accent);
    }
  }

  &__output {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
  }
}
</style>
