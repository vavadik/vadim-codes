import { initContract } from '@ts-rest/core';
import { healthDtoSchema } from './dtos/health.dto';

const c = initContract();

export const contract = c.router({
  health: {
    method: 'GET',
    path: '/health',
    responses: {
      200: healthDtoSchema,
    },
  },
});
