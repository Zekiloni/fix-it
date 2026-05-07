import { notFound } from 'next/navigation';
import { MapPin, Phone } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@fix-it/ui';
import {
  type IProblem,
  UserRole,
} from '@fix-it/shared';
import { apiFetch, ApiError } from '../../../lib/api-client';
import { getCurrentUser } from '../../../lib/session';
import { AdminProblemControls } from '../../../components/admin-problem-controls';
import { AttachmentGrid } from '../../../components/attachment-grid';
import { AttachmentUploader } from '../../../components/attachment-uploader';
import { ProblemDisplayMap } from '../../../components/problem-display-map';
import { ProblemStatusBadge } from '../../../components/problem-status-badge';

async function loadProblem(id: string): Promise<IProblem | null> {
  try {
    return await apiFetch<IProblem>(`/problems/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

interface ProblemDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProblemDetailPage({
  params,
}: ProblemDetailPageProps) {
  const { id } = await params;
  const [problem, user] = await Promise.all([
    loadProblem(id),
    getCurrentUser(),
  ]);
  if (!problem) notFound();

  const canEdit =
    user !== null &&
    (user.role === UserRole.Admin || user.id === problem.authorId);
  const showWorkflow =
    user !== null &&
    (user.role === UserRole.Admin || user.id === problem.assigneeId);

  const [lng, lat] = problem.location.coordinates;
  const formattedDate = new Date(problem.createdAt).toLocaleString();

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-2xl">{problem.title}</CardTitle>
              <CardDescription className="capitalize">
                {problem.category} · reported {formattedDate}
              </CardDescription>
            </div>
            <ProblemStatusBadge status={problem.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="whitespace-pre-line text-sm leading-relaxed">
            {problem.description}
          </p>

          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            {problem.address && (
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <dt className="text-muted-foreground">Address</dt>
                  <dd>{problem.address}</dd>
                </div>
              </div>
            )}
            {problem.contactPhone && canEdit && (
              <div className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <dt className="text-muted-foreground">Contact</dt>
                  <dd>{problem.contactPhone}</dd>
                </div>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
          <CardDescription>
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProblemDisplayMap lng={lng} lat={lat} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attachments</CardTitle>
          <CardDescription>
            Photos and documents related to this report.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AttachmentGrid
            problemId={problem.id}
            attachments={problem.attachments}
            canDelete={canEdit}
          />
          {canEdit && <AttachmentUploader problemId={problem.id} />}
        </CardContent>
      </Card>

      {showWorkflow && (
        <Card>
          <CardHeader>
            <CardTitle>Workflow</CardTitle>
            <CardDescription>
              Route, assign, and update status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminProblemControls problem={problem} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
