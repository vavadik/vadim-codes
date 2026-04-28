import { initContract } from '@ts-rest/core';
import { healthDtoSchema } from '../dtos/health.dto';

const c = initContract();

export const healthContract = c.router({
  health: {
    method: 'GET',
    path: '/health',
    summary: 'Health check',
    description: 'Returns the current service status and server timestamp.',
    metadata: {
      tags: ['Health'],
      responseExamples: {
        200: { status: 'ok', timestamp: '2026-04-28T12:00:00.000Z' },
      },
    },
    responses: {
      200: healthDtoSchema,
    },
  },
});
