import { z } from 'zod';

export const healthDtoSchema = z.object({
  status: z.string().describe('Service status (ok / degraded / down)'),
  timestamp: z.string().describe('ISO 8601 timestamp of the check'),
});

export type HealthDto = z.infer<typeof healthDtoSchema>;
