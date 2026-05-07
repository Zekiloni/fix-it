import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@fix-it/ui';
import { type IProblem, UserRole } from '@fix-it/shared';
import { ApiError, apiFetch } from '../../lib/api-client';
import { getCurrentUser } from '../../lib/session';
import { OperatorStatusSelect } from '../../components/operator-status-select';

export const metadata = { title: 'My work · CityFix' };

async function loadAssigned(userId: string): Promise<IProblem[]> {
  try {
    return await apiFetch<IProblem[]>(`/problems?assigneeId=${userId}`);
  } catch (err) {
    if (err instanceof ApiError) return [];
    throw err;
  }
}

export default async function WorkPage() {
  const me = await getCurrentUser();
  if (!me) redirect('/login');
  if (me.role !== UserRole.Operator && me.role !== UserRole.Admin) {
    redirect('/');
  }

  const problems = await loadAssigned(me.id);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">My work</h1>
        <p className="text-sm text-muted-foreground">
          Problems assigned to you. Update status as you make progress.
        </p>
      </div>

      {problems.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nothing assigned</CardTitle>
            <CardDescription>
              Problems will appear here once an admin routes them to your
              organization and assigns them to you.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ul className="space-y-3">
          {problems.map((p) => (
            <li key={p.id}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap">
                  <div className="flex-1 space-y-1">
                    <Link
                      href={`/problems/${p.id}`}
                      className="text-base font-semibold underline-offset-4 hover:underline"
                    >
                      {p.title}
                    </Link>
                    <p className="text-xs text-muted-foreground capitalize">
                      {p.category}
                      {p.address ? ` · ${p.address}` : ''}
                    </p>
                  </div>
                  <OperatorStatusSelect problemId={p.id} status={p.status} />
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
