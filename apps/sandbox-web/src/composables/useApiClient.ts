import { initClient } from '@ts-rest/core';
import { contract } from '@vadim-codes/sandbox-contracts';

export const apiClient = initClient(contract, {
  baseUrl: '/api',
  baseHeaders: {},
  credentials: 'include',
});
