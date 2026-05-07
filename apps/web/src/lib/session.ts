import { cookies } from 'next/headers';
import type { IUser } from '@fix-it/shared';
import { AUTH_COOKIE } from './config';
import { apiFetch, ApiError } from './api-client';

export async function getCurrentUser(): Promise<IUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  try {
    return await apiFetch<IUser>('/auth/me');
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  return (await getCurrentUser()) !== null;
}
