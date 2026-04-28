import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

export const usersContract = c.router({
  deleteMe: {
    method: 'DELETE',
    path: '/users/me',
    body: z.object({}),
    responses: {
      204: z.object({}),
      401: z.object({ message: z.string() }),
    },
  },
});
