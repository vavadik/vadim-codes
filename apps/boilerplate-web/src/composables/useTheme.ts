import { ref, watchEffect } from 'vue';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'boilerplate-theme';

const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
const system: Theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
const theme = ref<Theme>(stored ?? system);

watchEffect(() => {
  document.documentElement.setAttribute('data-theme', theme.value);
  localStorage.setItem(STORAGE_KEY, theme.value);
});

export function useTheme() {
  return {
    theme,
    toggle: () => {
      theme.value = theme.value === 'light' ? 'dark' : 'light';
    },
  };
}
