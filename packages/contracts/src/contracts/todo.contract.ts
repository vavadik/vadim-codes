import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { todoDtoSchema, createTodoDtoSchema, updateTodoDtoSchema } from '../dtos/todo.dto';

const c = initContract();

export const todoContract = c.router({
  list: {
    method: 'GET',
    path: '/todos',
    responses: {
      200: z.array(todoDtoSchema),
    },
  },
  create: {
    method: 'POST',
    path: '/todos',
    body: createTodoDtoSchema,
    responses: {
      201: todoDtoSchema,
    },
  },
  update: {
    method: 'PATCH',
    path: '/todos/:id',
    pathParams: z.object({ id: z.string() }),
    body: updateTodoDtoSchema,
    responses: {
      200: todoDtoSchema,
      404: z.object({ message: z.string() }),
    },
  },
  remove: {
    method: 'DELETE',
    path: '/todos/:id',
    pathParams: z.object({ id: z.string() }),
    responses: {
      200: todoDtoSchema,
      404: z.object({ message: z.string() }),
    },
  },
});
