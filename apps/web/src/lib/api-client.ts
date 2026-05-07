import { cookies } from 'next/headers';
import { API_BASE_URL, AUTH_COOKIE } from './config';

interface ApiOptions extends RequestInit {
  json?: unknown;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body: unknown,
  ) {
    super(message);
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  opts: ApiOptions = {},
): Promise<T> {
  const headers = new Headers(opts.headers);

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let body = opts.body;
  if (opts.json !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(opts.json);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...opts,
    headers,
    body,
    cache: 'no-store',
  });

  if (!res.ok) {
    let payload: unknown = null;
    try {
      payload = await res.json();
    } catch {
      payload = await res.text().catch(() => null);
    }
    const message =
      (payload as { message?: string })?.message ??
      `Request failed with ${res.status}`;
    throw new ApiError(res.status, message, payload);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
