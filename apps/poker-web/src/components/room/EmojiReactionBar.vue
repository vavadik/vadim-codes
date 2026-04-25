<template>
  <div class="emoji-bar">
    <button
      v-for="emoji in recentEmojis"
      :key="emoji"
      class="emoji-bar__btn"
      :class="{ 'emoji-bar__btn--cooldown': onCooldown }"
      :disabled="onCooldown"
      @click="onEmoji(emoji)"
    >
      {{ emoji }}
    </button>

    <div ref="pickerWrapEl" class="emoji-bar__picker-wrap">
      <button class="emoji-bar__btn emoji-bar__btn--add" title="More emojis" @click="togglePicker">
        +
      </button>
      <div v-if="pickerOpen" class="emoji-bar__picker">
        <EmojiPicker native :disable-skin-tones="true" theme="auto" @select="onPickerSelect" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import EmojiPicker from 'vue3-emoji-picker';

const DEFAULT_RECENT = ['👍', '😂', '❤️', '🎉', '🔥'];
const STORAGE_KEY = 'poker:recentEmojis';
const MAX_RECENT = 5;
const COOLDOWN_MS = 500;

const emit = defineEmits<{ react: [emoji: string] }>();

const recentEmojis = ref<string[]>([...DEFAULT_RECENT]);
const pickerOpen = ref(false);
const pickerWrapEl = ref<HTMLElement | null>(null);
const onCooldown = ref(false);
let cooldownTimer: ReturnType<typeof setTimeout> | null = null;

function loadRecent(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        recentEmojis.value = (parsed as string[]).slice(0, MAX_RECENT);
      }
    }
  } catch {
    // ignore malformed storage
  }
}

function saveRecent(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recentEmojis.value));
}

function addToRecent(emoji: string): void {
  if (recentEmojis.value.includes(emoji)) {
    return;
  }
  const updated = [...recentEmojis.value, emoji];
  if (updated.length > MAX_RECENT) {
    updated.shift();
  }
  recentEmojis.value = updated;
  saveRecent();
}

function onEmoji(emoji: string): void {
  if (onCooldown.value) {
    return;
  }
  addToRecent(emoji);
  pickerOpen.value = false;
  emit('react', emoji);
  onCooldown.value = true;
  cooldownTimer = setTimeout(() => {
    onCooldown.value = false;
    cooldownTimer = null;
  }, COOLDOWN_MS);
}

function onPickerSelect(emoji: { i: string }): void {
  onEmoji(emoji.i);
}

function togglePicker(): void {
  pickerOpen.value = !pickerOpen.value;
}

function onClickOutside(e: MouseEvent): void {
  if (pickerWrapEl.value && !pickerWrapEl.value.contains(e.target as Node)) {
    pickerOpen.value = false;
  }
}

onMounted(() => {
  loadRecent();
  document.addEventListener('click', onClickOutside, true);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside, true);
  if (cooldownTimer !== null) {
    clearTimeout(cooldownTimer);
  }
});
</script>

<style scoped lang="scss">
.emoji-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.125rem;
  padding: 0.4rem 1rem;
  border-bottom: 1px solid var(--color-base-300);

  &__btn {
    font-size: 1.4rem;
    line-height: 1;
    padding: 0.3rem 0.35rem;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 0.4rem;
    transition:
      background 0.1s,
      transform 0.1s;

    &:hover {
      background: var(--color-base-200);
      transform: scale(1.2);
    }

    &:active {
      transform: scale(0.9);
    }

    &:disabled {
      cursor: default;
      opacity: 0.45;
      transform: none;

      &:hover {
        background: transparent;
        transform: none;
      }
    }

    &--add {
      font-size: 1rem;
      font-weight: 700;
      color: var(--color-base-content);
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  &__picker-wrap {
    position: relative;
  }

  &__picker {
    position: absolute;
    bottom: calc(100% + 0.5rem);
    right: 0;
    z-index: 200;
  }
}
</style>
