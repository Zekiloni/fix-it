'use server';

import { revalidatePath } from 'next/cache';
import {
  CreateOrganizationDto,
  IOrganization,
  createOrganizationSchema,
} from '@fix-it/shared';
import { apiFetch, ApiError } from '../api-client';

export interface CreateOrganizationResult {
  ok: boolean;
  error?: string;
  organization?: IOrganization;
}

export async function createOrganizationAction(
  dto: CreateOrganizationDto,
): Promise<CreateOrganizationResult> {
  const parsed = createOrganizationSchema.safeParse(dto);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; '),
    };
  }
  let org: IOrganization;
  try {
    org = await apiFetch<IOrganization>('/organizations', {
      method: 'POST',
      json: parsed.data,
    });
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, error: err.message };
    throw err;
  }
  revalidatePath('/');
  return { ok: true, organization: org };
}
