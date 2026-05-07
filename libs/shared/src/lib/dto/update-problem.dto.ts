import { z } from 'zod';
import { createProblemSchema } from './create-problem.dto';

export const updateProblemSchema = createProblemSchema.partial();

export type UpdateProblemDto = z.infer<typeof updateProblemSchema>;
