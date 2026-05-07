import { redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@fix-it/ui';
import { ProblemStatus, UserRole } from '@fix-it/shared';
import { ApiError, apiFetch } from '../../../lib/api-client';
import { getCurrentUser } from '../../../lib/session';
import { statusVisuals } from '../../../lib/status-colors';

interface Stats {
  total: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  medianResolutionHours: number | null;
}

async function loadStats(): Promise<Stats | null> {
  try {
    return await apiFetch<Stats>('/problems/stats');
  } catch (err) {
    if (err instanceof ApiError) return null;
    throw err;
  }
}

export const metadata = { title: 'Analytics · CityFix' };

export default async function AnalyticsPage() {
  const me = await getCurrentUser();
  if (!me) redirect('/login');
  if (me.role !== UserRole.Admin) redirect('/');

  const stats = await loadStats();
  if (!stats) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-sm text-muted-foreground">
          Unable to load analytics.
        </p>
      </div>
    );
  }

  const statusEntries = Object.entries(statusVisuals).map(([status, v]) => ({
    status,
    label: v.label,
    color: v.bg,
    count: stats.byStatus[status] ?? 0,
  }));
  const maxStatus = Math.max(...statusEntries.map((e) => e.count), 1);

  const categoryEntries = Object.entries(stats.byCategory).sort(
    (a, b) => b[1] - a[1],
  );
  const maxCategory = Math.max(...categoryEntries.map(([, n]) => n), 1);

  const medianHours = stats.medianResolutionHours;
  const medianLabel =
    medianHours === null
      ? '—'
      : medianHours < 24
        ? `${medianHours.toFixed(1)}h`
        : `${(medianHours / 24).toFixed(1)}d`;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Overview of all reported problems.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Total reports</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Resolved</CardDescription>
            <CardTitle className="text-3xl">
              {stats.byStatus[ProblemStatus.Resolved] ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Median time to resolve</CardDescription>
            <CardTitle className="text-3xl">{medianLabel}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>By status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {statusEntries.map((e) => (
            <div key={e.status} className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>{e.label}</span>
                <span className="text-muted-foreground">{e.count}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${(e.count / maxStatus) * 100}%`,
                    backgroundColor: e.color,
                  }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>By category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {categoryEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          ) : (
            categoryEntries.map(([category, count]) => (
              <div key={category} className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="capitalize">{category}</span>
                  <span className="text-muted-foreground">{count}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-foreground"
                    style={{ width: `${(count / maxCategory) * 100}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
