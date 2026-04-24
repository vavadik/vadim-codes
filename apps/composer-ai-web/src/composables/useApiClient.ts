import { initClient } from '@ts-rest/core';
import { contract } from '@vadim-codes/composer-ai-contracts';

export const apiClient = initClient(contract, {
  baseUrl: import.meta.env.VITE_API_URL ?? '/api',
  baseHeaders: {},
  credentials: 'include',
});
