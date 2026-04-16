import { initContract } from '@ts-rest/core';
import { healthContract } from './contracts/health.contract';
import { salesforceContract } from './contracts/salesforce.contract';
import { todoContract } from './contracts/todo.contract';

const c = initContract();

export const contract = c.router({
  ...healthContract,
  salesforce: salesforceContract,
  todo: todoContract,
});
