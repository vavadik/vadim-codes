import { initClient } from '@ts-rest/core';
import { contract } from '@vadim-codes/poker-contracts';

export const roomApi = initClient(contract.room, {
  baseUrl: '/api',
  baseHeaders: {},
});
