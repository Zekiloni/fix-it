import { z } from 'zod';
import { ProblemStatus } from '../enums/problem-status.enum';

const objectIdLike = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, 'must be a valid ObjectId');

export const routeProblemSchema = z.object({
  organizationId: objectIdLike,
});
export type RouteProblemDto = z.infer<typeof routeProblemSchema>;

export const assignProblemSchema = z.object({
  assigneeId: objectIdLike,
});
export type AssignProblemDto = z.infer<typeof assignProblemSchema>;

export const updateProblemStatusSchema = z.object({
  status: z.nativeEnum(ProblemStatus),
});
export type UpdateProblemStatusDto = z.infer<typeof updateProblemStatusSchema>;
