import { z } from 'zod';
import { UserRole } from '../enums/user-role.enum';

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(80),
  role: z.nativeEnum(UserRole).default(UserRole.User),
  avatarUrl: z.string().url().optional(),
  googleId: z.string().optional(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
