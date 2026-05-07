'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import type { IProblem } from '@fix-it/shared';
import { apiFetch, ApiError } from '../api-client';
import { API_BASE_URL, AUTH_COOKIE } from '../config';

export interface AttachmentActionResult {
  ok: boolean;
  error?: string;
}

export async function uploadAttachmentAction(
  problemId: string,
  formData: FormData,
): Promise<AttachmentActionResult> {
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: 'Choose a file first.' };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return { ok: false, error: 'Not authenticated.' };

  const proxied = new FormData();
  proxied.append('file', file, file.name);

  const res = await fetch(
    `${API_BASE_URL}/problems/${problemId}/attachments`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: proxied,
      cache: 'no-store',
    },
  );

  if (!res.ok) {
    const payload = (await res.json().catch(() => null)) as
      | { message?: string }
      | null;
    return {
      ok: false,
      error: payload?.message ?? `Upload failed (${res.status})`,
    };
  }

  revalidatePath(`/problems/${problemId}`);
  return { ok: true };
}

export async function deleteAttachmentAction(
  problemId: string,
  storageId: string,
): Promise<AttachmentActionResult> {
  try {
    await apiFetch<IProblem | undefined>(
      `/problems/${problemId}/attachments/${storageId}`,
      { method: 'DELETE' },
    );
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, error: err.message };
    throw err;
  }
  revalidatePath(`/problems/${problemId}`);
  return { ok: true };
}
