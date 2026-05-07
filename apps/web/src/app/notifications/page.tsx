import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
} from '@fix-it/ui';
import { type INotification } from '@fix-it/shared';
import { ApiError, apiFetch } from '../../lib/api-client';
import { markAllReadAction } from '../../lib/actions/notifications';
import { getCurrentUser } from '../../lib/session';

export const metadata = { title: 'Notifications · CityFix' };

async function loadNotifications(): Promise<INotification[]> {
  try {
    return await apiFetch<INotification[]>('/notifications');
  } catch (err) {
    if (err instanceof ApiError) return [];
    throw err;
  }
}

export default async function NotificationsPage() {
  const me = await getCurrentUser();
  if (!me) redirect('/login');

  const items = await loadNotifications();
  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Notifications
          </h1>
          <p className="text-sm text-muted-foreground">
            {unread > 0 ? `${unread} unread` : 'All caught up'}
          </p>
        </div>
        {unread > 0 && (
          <form action={markAllReadAction}>
            <Button type="submit" variant="outline" size="sm">
              Mark all read
            </Button>
          </form>
        )}
      </div>

      {items.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No notifications yet</CardTitle>
            <CardDescription>
              You&apos;ll get pinged here when there&apos;s movement on your
              reports or assignments.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <li key={n.id}>
              <Link href={`/problems/${n.problemId}`} className="block">
                <Card
                  className={`transition-shadow hover:shadow-md ${
                    n.read ? 'opacity-70' : ''
                  }`}
                >
                  <CardContent className="flex items-start justify-between gap-3 p-4">
                    <div>
                      <p className="text-sm font-medium">{n.problemTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {n.message}
                      </p>
                    </div>
                    <span className="whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
