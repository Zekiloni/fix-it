import { z } from 'zod';
import { ProblemCategory } from '../enums/problem-category.enum';

export const createOrganizationSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'slug must be lowercase, digits, or dashes'),
  description: z.string().max(1000).optional(),
  contactEmail: z.string().email(),
  categories: z.array(z.nativeEnum(ProblemCategory)).min(1),
  customCategories: z
    .array(z.string().trim().min(1).max(60))
    .max(20)
    .optional(),
});

export type CreateOrganizationDto = z.infer<typeof createOrganizationSchema>;
