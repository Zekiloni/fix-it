import { z } from 'zod';
import { UserRole } from '../enums/user-role.enum';

const objectIdLike = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, 'must be a valid ObjectId');

export const setUserRoleSchema = z.object({
  role: z.nativeEnum(UserRole),
});
export type SetUserRoleDto = z.infer<typeof setUserRoleSchema>;

export const setUserOrganizationSchema = z.object({
  organizationId: objectIdLike.nullable(),
});
export type SetUserOrganizationDto = z.infer<typeof setUserOrganizationSchema>;
