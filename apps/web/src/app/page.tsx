import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  buttonVariants,
  cn,
} from '@fix-it/ui';
import type { IProblem } from '@fix-it/shared';
import { apiFetch, ApiError } from '../lib/api-client';
import { ProblemStatusBadge } from '../components/problem-status-badge';
import { ProblemsMap } from '../components/problems-map';
import { StatusLegend } from '../components/status-legend';

async function loadProblems(): Promise<IProblem[]> {
  try {
    return await apiFetch<IProblem[]>('/problems');
  } catch (err) {
    if (err instanceof ApiError) return [];
    throw err;
  }
}

export default async function HomePage() {
  const problems = await loadProblems();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Reported problems
          </h1>
          <p className="text-sm text-muted-foreground">
            Latest infrastructure issues reported by citizens.
          </p>
        </div>
        <Link
          href="/problems/new"
          className={cn(buttonVariants({ size: 'lg' }))}
        >
          Report a problem
        </Link>
      </div>

      {problems.length > 0 && (
        <div className="mb-8 space-y-3">
          <ProblemsMap problems={problems} />
          <StatusLegend />
        </div>
      )}

      {problems.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No problems yet</CardTitle>
            <CardDescription>
              Be the first to report something that needs fixing.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {problems.map((p) => (
            <Link key={p.id} href={`/problems/${p.id}`} className="block">
              <Card className="overflow-hidden transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="line-clamp-1">{p.title}</CardTitle>
                    <ProblemStatusBadge status={p.status} />
                  </div>
                  <CardDescription className="capitalize">
                    {p.category}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {p.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
