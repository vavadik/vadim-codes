import { initContract } from '@ts-rest/core';
import { authContract } from './contracts/auth.contract';
import { healthContract } from './contracts/health.contract';
import { usersContract } from './contracts/users.contract';

const c = initContract();

export const contract = c.router({
  ...healthContract,
  auth: authContract,
  users: usersContract,
});
