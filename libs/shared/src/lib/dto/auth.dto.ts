import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(80),
  password: z
    .string()
    .min(8, 'password must be at least 8 characters')
    .max(128),
});

export type RegisterDto = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginDto = z.infer<typeof loginSchema>;