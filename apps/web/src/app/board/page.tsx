import { redirect } from 'next/navigation';
import { type IProblem, UserRole } from '@fix-it/shared';
import { ApiError, apiFetch } from '../../lib/api-client';
import { getCurrentUser } from '../../lib/session';
import { FilterChips } from '../../components/filter-chips';
import { KanbanBoard } from '../../components/kanban-board';
import { SearchBar } from '../../components/search-bar';

export const metadata = { title: 'Board · CityFix' };

interface BoardSearchParams {
  category?: string;
  q?: string;
}

async function loadProblems(query: string): Promise<IProblem[]> {
  try {
    return await apiFetch<IProblem[]>(`/problems${query}`);
  } catch (err) {
    if (err instanceof ApiError) return [];
    throw err;
  }
}

interface BoardPageProps {
  searchParams: Promise<BoardSearchParams>;
}

export default async function BoardPage({ searchParams }: BoardPageProps) {
  const me = await getCurrentUser();
  if (!me) redirect('/login');
  if (me.role !== UserRole.Admin && me.role !== UserRole.Operator) {
    redirect('/');
  }

  const params = await searchParams;
  const qs = new URLSearchParams();
  if (me.role === UserRole.Operator && me.organizationId) {
    qs.set('organizationId', me.organizationId);
  }
  if (params.category) qs.set('category', params.category);
  if (params.q) qs.set('q', params.q);
  const queryString = qs.toString();
  const problems = await loadProblems(queryString ? `?${queryString}` : '');

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Board</h1>
        <p className="text-sm text-muted-foreground">
          {me.role === UserRole.Admin
            ? 'All reported problems across organizations.'
            : 'Problems routed to your organization. Drag a card to update status.'}
        </p>
      </div>

      <div className="space-y-4">
        <SearchBar />
        <FilterChips showStatus={false} />
      </div>

      <KanbanBoard initialProblems={problems} />
    </div>
  );
}
