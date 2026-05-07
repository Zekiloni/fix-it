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
import { FilterChips } from '../components/filter-chips';
import { ProblemStatusBadge } from '../components/problem-status-badge';
import { ProblemsMap } from '../components/problems-map';
import { SearchBar } from '../components/search-bar';
import { StatusLegend } from '../components/status-legend';

interface HomeSearchParams {
  status?: string;
  category?: string;
  q?: string;
}

async function loadProblems(params: HomeSearchParams): Promise<IProblem[]> {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.category) qs.set('category', params.category);
  if (params.q) qs.set('q', params.q);
  const query = qs.toString();
  try {
    return await apiFetch<IProblem[]>(
      `/problems${query ? `?${query}` : ''}`,
    );
  } catch (err) {
    if (err instanceof ApiError) return [];
    throw err;
  }
}

interface HomePageProps {
  searchParams: Promise<HomeSearchParams>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const problems = await loadProblems(params);
  const isFiltered = Boolean(params.status || params.category || params.q);

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

      <div className="mb-6 space-y-4">
        <SearchBar />
        <FilterChips />
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
            <CardTitle>
              {isFiltered ? 'No matches' : 'No problems yet'}
            </CardTitle>
            <CardDescription>
              {isFiltered
                ? 'Try clearing or adjusting the filters.'
                : 'Be the first to report something that needs fixing.'}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {problems.map((p) => {
            const days = Math.max(
              0,
              Math.floor(
                (Date.now() - new Date(p.createdAt).getTime()) / 86_400_000,
              ),
            );
            return (
              <Link key={p.id} href={`/problems/${p.id}`} className="block">
                <Card className="overflow-hidden transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="line-clamp-1">{p.title}</CardTitle>
                      <ProblemStatusBadge status={p.status} />
                    </div>
                    <CardDescription className="capitalize">
                      {p.category}
                      {' · '}
                      <span className="lowercase">
                        {days === 0 ? 'today' : `${days}d ago`}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {p.description}
                    </p>
                    {p.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {p.tags.slice(0, 4).map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
