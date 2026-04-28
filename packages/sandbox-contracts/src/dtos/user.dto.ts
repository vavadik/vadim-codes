import { z } from 'zod';

export const userDtoSchema = z.object({
  id: z.string(),
  email: z.string().nullable(),
  name: z.string().nullable(),
  avatarUrl: z.string().nullable(),
});

export type UserDto = z.infer<typeof userDtoSchema>;
