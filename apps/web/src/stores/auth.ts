import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

interface AuthUser {
  sfUserId: string;
  sfOrgId: string;
  email: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null);
  const isAuthenticated = computed(() => user.value !== null);

  async function fetchMe(): Promise<void> {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });

      if (res.ok) {
        user.value = (await res.json()) as AuthUser;
        return;
      }

      if (res.status === 401) {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });

        if (refreshRes.ok) {
          const retryRes = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
          if (retryRes.ok) {
            user.value = (await retryRes.json()) as AuthUser;
            return;
          }
        }
      }

      user.value = null;
    } catch {
      user.value = null;
    }
  }

  async function logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
    } finally {
      user.value = null;
    }
  }

  return { user, isAuthenticated, fetchMe, logout };
});
