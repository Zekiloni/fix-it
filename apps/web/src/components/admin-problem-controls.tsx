import {
  type IOrganization,
  type IProblem,
  type IUser,
  UserRole,
} from '@fix-it/shared';
import { ApiError, apiFetch } from '../lib/api-client';
import { getCurrentUser } from '../lib/session';
import { AdminProblemControlsClient } from './admin-problem-controls.client';

async function loadOrganizations(): Promise<IOrganization[]> {
  try {
    return await apiFetch<IOrganization[]>('/organizations');
  } catch (err) {
    if (err instanceof ApiError) return [];
    throw err;
  }
}

async function loadOperators(orgId: string): Promise<IUser[]> {
  try {
    return await apiFetch<IUser[]>(`/organizations/${orgId}/operators`);
  } catch (err) {
    if (err instanceof ApiError) return [];
    throw err;
  }
}

interface AdminProblemControlsProps {
  problem: IProblem;
}

export async function AdminProblemControls({
  problem,
}: AdminProblemControlsProps) {
  const user = await getCurrentUser();
  if (!user) return null;

  const isAdmin = user.role === UserRole.Admin;
  const isAssignee =
    problem.assigneeId !== undefined && problem.assigneeId === user.id;
  if (!isAdmin && !isAssignee) return null;

  const [organizations, operators] = await Promise.all([
    isAdmin ? loadOrganizations() : Promise.resolve<IOrganization[]>([]),
    problem.organizationId
      ? loadOperators(problem.organizationId)
      : Promise.resolve<IUser[]>([]),
  ]);

  return (
    <AdminProblemControlsClient
      problem={problem}
      organizations={organizations}
      operators={operators}
      viewerRole={user.role}
      isAssignee={isAssignee}
    />
  );
}
