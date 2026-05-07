import Link from 'next/link';
import { Bell } from 'lucide-react';
import { ApiError, apiFetch } from '../lib/api-client';

async function loadCount(): Promise<number> {
  try {
    const res = await apiFetch<{ count: number }>('/notifications/unread-count');
    return res.count;
  } catch (err) {
    if (err instanceof ApiError) return 0;
    throw err;
  }
}

export async function NotificationDot() {
  const count = await loadCount();
  return (
    <Link
      href="/notifications"
      aria-label={`Notifications (${count} unread)`}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
    >
      <Bell className="h-4 w-4" />
      {count > 0 && (
        <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}
