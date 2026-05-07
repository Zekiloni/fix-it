import { z } from 'zod';
import { ProblemCategory } from '../enums/problem-category.enum';
import { geoPointSchema } from './geo-point.dto';

export const createProblemSchema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().min(10).max(2000),
  category: z.nativeEnum(ProblemCategory),
  location: geoPointSchema,
  address: z.string().max(300).optional(),
  contactPhone: z
    .string()
    .min(5)
    .max(30)
    .regex(/^[+0-9 ()\-]+$/, 'Invalid phone number')
    .optional(),
});

export type CreateProblemDto = z.infer<typeof createProblemSchema>;
