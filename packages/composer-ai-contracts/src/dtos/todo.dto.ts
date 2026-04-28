import { z } from 'zod';

export const todoDtoSchema = z.object({
  id: z.string().describe('UUID of the todo'),
  title: z.string().describe('Display text of the todo item'),
  done: z.boolean().describe('Whether the todo has been completed'),
  createdAt: z.string().describe('ISO 8601 creation timestamp'),
  updatedAt: z.string().describe('ISO 8601 last-update timestamp'),
});

export const createTodoDtoSchema = z.object({
  title: z.string().min(1).describe('Display text for the new todo (min 1 character)'),
});

export const updateTodoDtoSchema = z.object({
  title: z.string().min(1).describe('Updated display text').optional(),
  done: z.boolean().describe('Mark the todo as completed or not').optional(),
});

export type TodoDto = z.infer<typeof todoDtoSchema>;
export type CreateTodoDto = z.infer<typeof createTodoDtoSchema>;
export type UpdateTodoDto = z.infer<typeof updateTodoDtoSchema>;
