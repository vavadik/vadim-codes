import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { todoDtoSchema, createTodoDtoSchema, updateTodoDtoSchema } from '../dtos/todo.dto';

const c = initContract();

const todoIdParam = z.object({ id: z.string().describe('UUID of the todo') });

const exampleTodo = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Buy groceries',
  done: false,
  createdAt: '2026-04-28T10:00:00.000Z',
  updatedAt: '2026-04-28T10:00:00.000Z',
};

export const todoContract = c.router({
  list: {
    method: 'GET',
    path: '/todos',
    summary: 'List todos',
    description: 'Returns all todos.',
    metadata: {
      tags: ['Todos'],
      responseExamples: { 200: [exampleTodo] },
    },
    responses: {
      200: z.array(todoDtoSchema),
    },
  },
  create: {
    method: 'POST',
    path: '/todos',
    summary: 'Create todo',
    description: 'Creates a new todo item.',
    metadata: {
      tags: ['Todos'],
      requestExample: { title: 'Buy groceries' },
      responseExamples: { 201: exampleTodo },
    },
    body: createTodoDtoSchema,
    responses: {
      201: todoDtoSchema,
    },
  },
  update: {
    method: 'PATCH',
    path: '/todos/:id',
    summary: 'Update todo',
    description: 'Partially updates an existing todo by ID.',
    metadata: {
      tags: ['Todos'],
      requestExample: { done: true },
      responseExamples: {
        200: { ...exampleTodo, done: true, updatedAt: '2026-04-28T11:00:00.000Z' },
        404: { message: 'Todo not found' },
      },
    },
    pathParams: todoIdParam,
    body: updateTodoDtoSchema,
    responses: {
      200: todoDtoSchema,
      404: z.object({ message: z.string() }),
    },
  },
  remove: {
    method: 'DELETE',
    path: '/todos/:id',
    summary: 'Delete todo',
    description: 'Permanently removes a todo by ID.',
    metadata: {
      tags: ['Todos'],
      responseExamples: {
        200: exampleTodo,
        404: { message: 'Todo not found' },
      },
    },
    pathParams: todoIdParam,
    responses: {
      200: todoDtoSchema,
      404: z.object({ message: z.string() }),
    },
  },
});
