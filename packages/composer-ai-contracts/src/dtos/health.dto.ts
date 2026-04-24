import { z } from 'zod';

export const healthDtoSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
});

export type HealthDto = z.infer<typeof healthDtoSchema>;
