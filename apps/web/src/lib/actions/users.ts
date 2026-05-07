'use server';

import { revalidatePath } from 'next/cache';
import { IUser, UserRole } from '@fix-it/shared';
import { apiFetch, ApiError } from '../api-client';

export interface UserActionResult {
  ok: boolean;
  error?: string;
  user?: IUser;
}

async function patchUser<TBody extends object>(
  userId: string,
  path: string,
  body: TBody,
): Promise<UserActionResult> {
  let user: IUser;
  try {
    user = await apiFetch<IUser>(`/users/${userId}${path}`, {
      method: 'PATCH',
      json: body,
    });
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, error: err.message };
    throw err;
  }
  revalidatePath('/admin');
  return { ok: true, user };
}

export async function setUserRoleAction(
  userId: string,
  role: UserRole,
): Promise<UserActionResult> {
  return patchUser(userId, '/role', { role });
}

export async function setUserOrganizationAction(
  userId: string,
  organizationId: string | null,
): Promise<UserActionResult> {
  return patchUser(userId, '/organization', { organizationId });
}
