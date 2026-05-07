import { redirect } from 'next/navigation';
import { type IProblem, UserRole } from '@fix-it/shared';
import { ApiError, apiFetch } from '../../lib/api-client';
import { getCurrentUser } from '../../lib/session';
import { KanbanBoard } from '../../components/kanban-board';

export const metadata = { title: 'Board · CityFix' };

async function loadProblems(query: string): Promise<IProblem[]> {
  try {
    return await apiFetch<IProblem[]>(`/problems${query}`);
  } catch (err) {
    if (err instanceof ApiError) return [];
    throw err;
  }
}

export default async function BoardPage() {
  const me = await getCurrentUser();
  if (!me) redirect('/login');
  if (me.role !== UserRole.Admin && me.role !== UserRole.Operator) {
    redirect('/');
  }

  const query =
    me.role === UserRole.Operator && me.organizationId
      ? `?organizationId=${me.organizationId}`
      : '';
  const problems = await loadProblems(query);

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

      <KanbanBoard initialProblems={problems} />
    </div>
  );
}
