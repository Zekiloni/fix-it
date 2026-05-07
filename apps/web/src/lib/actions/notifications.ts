'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch, ApiError } from '../api-client';

export async function markAllReadAction(): Promise<void> {
  try {
    await apiFetch<undefined>('/notifications/mark-all-read', {
      method: 'POST',
    });
  } catch (err) {
    if (!(err instanceof ApiError)) throw err;
  }
  revalidatePath('/notifications');
  revalidatePath('/');
}
