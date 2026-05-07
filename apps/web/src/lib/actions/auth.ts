'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  IAuthResponse,
  loginSchema,
  registerSchema,
} from '@fix-it/shared';
import { API_BASE_URL, AUTH_COOKIE } from '../config';

export interface AuthFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

const SEVEN_DAYS = 60 * 60 * 24 * 7;

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  if (!res.ok) {
    const payload = (await res.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw new Error(payload?.message ?? `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SEVEN_DAYS,
  });
}

export async function loginAction(
  _prev: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return {
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((i) => [i.path.join('.'), i.message]),
      ),
    };
  }
  let result: IAuthResponse;
  try {
    result = await postJson<IAuthResponse>('/auth/login', parsed.data);
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Login failed' };
  }
  await setSessionCookie(result.accessToken);
  redirect('/');
}

export async function registerAction(
  _prev: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    email: formData.get('email'),
    name: formData.get('name'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return {
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((i) => [i.path.join('.'), i.message]),
      ),
    };
  }
  let result: IAuthResponse;
  try {
    result = await postJson<IAuthResponse>('/auth/register', parsed.data);
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Registration failed' };
  }
  await setSessionCookie(result.accessToken);
  redirect('/');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
  redirect('/login');
}
