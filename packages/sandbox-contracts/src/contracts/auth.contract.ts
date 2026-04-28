import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { userDtoSchema } from '../dtos/user.dto';

const c = initContract();

export const authContract = c.router({
  me: {
    method: 'GET',
    path: '/auth/me',
    responses: {
      200: userDtoSchema,
      401: z.object({ message: z.string() }),
    },
  },
  logout: {
    method: 'POST',
    path: '/auth/logout',
    body: z.object({}),
    responses: {
      200: z.object({ message: z.string() }),
    },
  },
});
