import { z } from 'zod';

export const todoDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  done: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createTodoDtoSchema = z.object({
  title: z.string().min(1),
});

export const updateTodoDtoSchema = z.object({
  title: z.string().min(1).optional(),
  done: z.boolean().optional(),
});

export type TodoDto = z.infer<typeof todoDtoSchema>;
export type CreateTodoDto = z.infer<typeof createTodoDtoSchema>;
export type UpdateTodoDto = z.infer<typeof updateTodoDtoSchema>;
