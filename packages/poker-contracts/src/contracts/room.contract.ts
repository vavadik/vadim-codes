import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

export const roomContract = c.router({
  createRoom: {
    method: 'POST',
    path: '/rooms',
    body: z.object({
      title: z.string().optional(),
      deck: z.enum(['fibonacci', 'tshirt', 'powersOfTwo', 'custom']).optional(),
    }),
    responses: {
      201: z.object({
        id: z.string(),
        inviteUrl: z.string(),
      }),
    },
  },
  deleteRoom: {
    method: 'DELETE',
    path: '/rooms/:id',
    body: z.undefined(),
    responses: {
      204: z.undefined(),
    },
  },
});
