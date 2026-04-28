import { initContract } from '@ts-rest/core';
import {
  imagesHealthDegradedSchema,
  imagesHealthOkSchema,
  rankImagesDtoSchema,
  rankImagesErrorSchema,
  rankImagesResponseSchema,
} from '../dtos/images.dto';

const c = initContract();

export const imagesContract = c.router({
  health: {
    method: 'GET',
    path: '/images/health',
    summary: 'CLIP worker health',
    description: 'Returns whether the CLIP worker process is ready to handle requests.',
    metadata: {
      tags: ['Images'],
      responseExamples: {
        200: { status: 'ok', clip_worker: 'ok' },
        503: { status: 'degraded', clip_worker: 'unavailable' },
      },
    },
    responses: {
      200: imagesHealthOkSchema,
      503: imagesHealthDegradedSchema,
    },
  },
  rank: {
    method: 'POST',
    path: '/images/rank',
    summary: 'Rank images',
    description: 'Ranks a list of image URLs by semantic similarity to a text prompt using CLIP.',
    metadata: {
      tags: ['Images'],
      requestExample: {
        prompt: 'a cat sitting on a couch',
        images: ['https://example.com/cat.jpg', 'https://example.com/dog.jpg'],
      },
      responseExamples: {
        200: {
          results: [
            { url: 'https://example.com/cat.jpg', score: 0.87 },
            { url: 'https://example.com/dog.jpg', score: 0.43 },
          ],
        },
        400: { code: 'INVALID_INPUT', message: 'images must contain at least 1 element' },
      },
    },
    body: rankImagesDtoSchema,
    responses: {
      200: rankImagesResponseSchema,
      400: rankImagesErrorSchema,
    },
  },
});
