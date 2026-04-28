import { computed, ref } from 'vue';
import type { UserDto } from '@vadim-codes/sandbox-contracts';
import { apiClient } from './useApiClient';

const user = ref<UserDto | null>(null);
const initialized = ref(false);

export async function initAuth(): Promise<void> {
  if (initialized.value) {
    return;
  }
  initialized.value = true;

  const res = await apiClient.auth.me();
  if (res.status === 200) {
    user.value = res.body;
  }
}

export function useAuth() {
  const isAuthenticated = computed(() => user.value !== null);

  function signIn(provider: 'google' | 'github'): void {
    window.location.href = `/api/auth/${provider}`;
  }

  async function signOut(): Promise<void> {
    await apiClient.auth.logout({ body: {} });
    user.value = null;
  }

  async function deleteAccount(): Promise<void> {
    await apiClient.users.deleteMe({ body: {} });
    user.value = null;
  }

  return { user, isAuthenticated, signIn, signOut, deleteAccount };
}
