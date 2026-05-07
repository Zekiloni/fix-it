import { notFound, redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@fix-it/ui';
import { type IProblem, UserRole } from '@fix-it/shared';
import { ApiError, apiFetch } from '../../../../lib/api-client';
import { getCurrentUser } from '../../../../lib/session';
import { ReportProblemForm } from '../../../../components/report-problem-form';
import { updateProblemAction } from '../../../../lib/actions/problems';

export const metadata = { title: 'Edit problem · CityFix' };

async function loadProblem(id: string): Promise<IProblem | null> {
  try {
    return await apiFetch<IProblem>(`/problems/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

interface EditProblemPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProblemPage({ params }: EditProblemPageProps) {
  const { id } = await params;
  const [problem, user] = await Promise.all([
    loadProblem(id),
    getCurrentUser(),
  ]);
  if (!problem) notFound();
  if (!user) redirect('/login');

  const canEdit =
    user.role === UserRole.Admin || user.id === problem.authorId;
  if (!canEdit) redirect(`/problems/${id}`);

  const update = updateProblemAction.bind(null, id);
  const [lng, lat] = problem.location.coordinates;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Edit problem</CardTitle>
          <CardDescription>
            Update title, description, location, or contact info.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportProblemForm
            initialValues={{
              title: problem.title,
              description: problem.description,
              category: problem.category,
              address: problem.address,
              contactPhone: problem.contactPhone,
              tags: problem.tags,
            }}
            initialPicked={{ lng, lat }}
            onSubmit={update}
            submitLabel="Save changes"
            pendingLabel="Saving…"
            autosave={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
