<template>
  <div class="min-h-screen bg-base-200 flex flex-col">
    <div class="navbar bg-base-100 border-b border-base-300 px-6 sticky top-0 z-100">
      <div class="navbar-start">
        <RouterLink to="/" class="text-xl font-bold">Scrum Poker</RouterLink>
      </div>
      <div class="navbar-end gap-4">
        <div v-if="name" class="greeting">
          <template v-if="!isEditing">
            <span class="greeting__label">Hi,</span>
            <button class="greeting__name" :title="'Change name'" @click="startEditing">
              {{ name }}
            </button>
            <button class="greeting__edit-btn" aria-label="Change name" @click="startEditing">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path
                  d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </template>
          <template v-else>
            <input
              ref="editInputRef"
              v-model="editValue"
              class="greeting__input"
              maxlength="32"
              @keydown.enter="confirmEdit"
              @keydown.escape="cancelEdit"
              @blur="confirmEdit"
            />
          </template>
        </div>
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
import { nextTick, ref } from 'vue';
import { useTheme } from '@/composables/useTheme';
import { useSession } from '@/composables/useSession';

const { theme, toggle } = useTheme();
const { name, setName } = useSession();

const isEditing = ref(false);
const editValue = ref('');
const editInputRef = ref<HTMLInputElement | null>(null);

async function startEditing(): Promise<void> {
  editValue.value = name.value;
  isEditing.value = true;
  await nextTick();
  editInputRef.value?.select();
}

function confirmEdit(): void {
  const trimmed = editValue.value.trim();
  if (trimmed) {
    setName(trimmed);
  }
  isEditing.value = false;
}

function cancelEdit(): void {
  isEditing.value = false;
}
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

.greeting {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--color-base-content);

  &__label {
    opacity: 0.5;
  }

  &__name {
    font-weight: 500;
    background: transparent;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 0;
    font-size: inherit;
    border-radius: 4px;

    &:hover {
      opacity: 0.7;
    }
  }

  &__edit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 4px;
    border: none;
    background: transparent;
    color: var(--color-base-content);
    cursor: pointer;
    opacity: 0.4;
    transition:
      opacity 0.15s,
      background 0.15s;

    &:hover {
      opacity: 0.8;
      background: var(--color-base-200);
    }
  }

  &__input {
    font-size: 14px;
    font-weight: 500;
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid var(--color-accent);
    background: var(--color-base-100);
    color: var(--color-base-content);
    width: 140px;
    outline: none;

    &:focus {
      box-shadow: 0 0 0 2px var(--color-accent-subtle);
    }
  }
}
</style>
