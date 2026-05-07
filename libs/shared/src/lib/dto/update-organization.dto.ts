import { z } from 'zod';
import { createOrganizationSchema } from './create-organization.dto';

export const updateOrganizationSchema = createOrganizationSchema.partial();

export type UpdateOrganizationDto = z.infer<typeof updateOrganizationSchema>;
