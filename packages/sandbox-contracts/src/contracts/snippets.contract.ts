import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { snippetCreateSchema, snippetCreatedSchema, snippetDtoSchema } from '../dtos/snippet.dto';

const c = initContract();

export const snippetsContract = c.router({
  create: {
    method: 'POST',
    path: '/snippets',
    body: snippetCreateSchema,
    responses: {
      201: snippetCreatedSchema,
      413: z.object({ message: z.string() }),
      429: z.object({ message: z.string() }),
    },
  },
  getById: {
    method: 'GET',
    path: '/snippets/:id',
    pathParams: z.object({ id: z.string() }),
    responses: {
      200: snippetDtoSchema,
      404: z.object({ message: z.string() }),
    },
  },
});
