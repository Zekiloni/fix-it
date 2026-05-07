'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  CreateProblemDto,
  IProblem,
  ProblemStatus,
  UpdateProblemDto,
  createProblemSchema,
  updateProblemSchema,
} from '@fix-it/shared';
import { apiFetch, ApiError } from '../api-client';

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export interface CreateProblemResult extends ActionResult {
  problem?: IProblem;
}

export async function createProblemAction(
  dto: CreateProblemDto,
): Promise<CreateProblemResult> {
  const parsed = createProblemSchema.safeParse(dto);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; '),
    };
  }
  let problem: IProblem;
  try {
    problem = await apiFetch<IProblem>('/problems', {
      method: 'POST',
      json: parsed.data,
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, error: err.message };
    }
    throw err;
  }
  redirect(`/?reported=${problem.id}`);
}

async function patchProblem<TBody extends object>(
  problemId: string,
  path: string,
  body: TBody,
): Promise<ActionResult> {
  try {
    await apiFetch<IProblem>(`/problems/${problemId}${path}`, {
      method: 'PATCH',
      json: body,
    });
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, error: err.message };
    throw err;
  }
  revalidatePath(`/problems/${problemId}`);
  revalidatePath('/');
  return { ok: true };
}

export async function routeProblemAction(
  problemId: string,
  organizationId: string,
): Promise<ActionResult> {
  return patchProblem(problemId, '/route', { organizationId });
}

export async function assignProblemAction(
  problemId: string,
  assigneeId: string,
): Promise<ActionResult> {
  return patchProblem(problemId, '/assign', { assigneeId });
}

export async function updateProblemStatusAction(
  problemId: string,
  status: ProblemStatus,
): Promise<ActionResult> {
  return patchProblem(problemId, '/status', { status });
}

export async function updateProblemAction(
  problemId: string,
  dto: UpdateProblemDto,
): Promise<ActionResult> {
  const parsed = updateProblemSchema.safeParse(dto);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; '),
    };
  }
  try {
    await apiFetch<IProblem>(`/problems/${problemId}`, {
      method: 'PATCH',
      json: parsed.data,
    });
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, error: err.message };
    throw err;
  }
  revalidatePath(`/problems/${problemId}`);
  revalidatePath('/');
  redirect(`/problems/${problemId}`);
}

export async function deleteProblemAction(
  problemId: string,
): Promise<ActionResult> {
  try {
    await apiFetch<undefined>(`/problems/${problemId}`, {
      method: 'DELETE',
    });
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, error: err.message };
    throw err;
  }
  revalidatePath('/');
  redirect('/');
}
