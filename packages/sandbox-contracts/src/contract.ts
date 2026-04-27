import { initContract } from '@ts-rest/core';
import { healthContract } from './contracts/health.contract';

const c = initContract();

export const contract = c.router({
  ...healthContract,
});
