import { initContract } from '@ts-rest/core';
import { authContract } from './contracts/auth.contract';
import { healthContract } from './contracts/health.contract';
import { snippetsContract } from './contracts/snippets.contract';
import { usersContract } from './contracts/users.contract';

const c = initContract();

export const contract = c.router({
  ...healthContract,
  auth: authContract,
  users: usersContract,
  snippets: snippetsContract,
});
