import { initContract } from '@ts-rest/core';
import { healthContract } from './contracts/health.contract';
import { imagesContract } from './contracts/images.contract';
import { salesforceContract } from './contracts/salesforce.contract';
import { todoContract } from './contracts/todo.contract';

const c = initContract();

export const contract = c.router({
  ...healthContract,
  images: imagesContract,
  salesforce: salesforceContract,
  todo: todoContract,
});
