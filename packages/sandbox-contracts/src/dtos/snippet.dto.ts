import { z } from 'zod';

export const snippetDtoSchema = z.object({
  id: z.string(),
  code: z.string(),
  createdAt: z.string(),
});

export const snippetCreateSchema = z.object({
  code: z.string().max(512_000),
});

export const snippetCreatedSchema = z.object({
  id: z.string(),
  url: z.string(),
});

export type SnippetDto = z.infer<typeof snippetDtoSchema>;
export type SnippetCreate = z.infer<typeof snippetCreateSchema>;
export type SnippetCreated = z.infer<typeof snippetCreatedSchema>;
