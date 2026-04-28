import { z } from 'zod';

export const rankImagesDtoSchema = z.object({
  prompt: z.string().min(1).max(500).describe('Text query to rank images against'),
  images: z
    .array(z.string().url())
    .min(1)
    .max(50)
    .describe('List of 1–50 http/https image URLs to rank'),
});

export const rankedImageDtoSchema = z.object({
  url: z.string().url().describe('Image URL'),
  score: z.number().describe('Cosine similarity score (0–1)'),
});

export const rankImagesResponseSchema = z.object({
  results: z.array(rankedImageDtoSchema).describe('Images sorted by descending score'),
});

export const rankImagesErrorSchema = z.object({
  code: z.literal('INVALID_INPUT'),
  message: z.string(),
});

export const imagesHealthOkSchema = z.object({
  status: z.literal('ok'),
  clip_worker: z.literal('ok'),
});

export const imagesHealthDegradedSchema = z.object({
  status: z.literal('degraded'),
  clip_worker: z.literal('unavailable'),
});

export type RankImagesDto = z.infer<typeof rankImagesDtoSchema>;
export type RankedImageDto = z.infer<typeof rankedImageDtoSchema>;
export type RankImagesResponse = z.infer<typeof rankImagesResponseSchema>;
