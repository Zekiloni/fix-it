'use client';

import { useState, useTransition } from 'react';
import { Button, Select } from '@fix-it/ui';
import {
  type IOrganization,
  type IProblem,
  type IUser,
  ProblemStatus,
  UserRole,
} from '@fix-it/shared';
import {
  assignProblemAction,
  routeProblemAction,
  updateProblemStatusAction,
} from '../lib/actions/problems';

const statusOptions: { value: ProblemStatus; label: string }[] = [
  { value: ProblemStatus.Reported, label: 'Reported' },
  { value: ProblemStatus.Acknowledged, label: 'Acknowledged' },
  { value: ProblemStatus.InProgress, label: 'In progress' },
  { value: ProblemStatus.Resolved, label: 'Resolved' },
  { value: ProblemStatus.Rejected, label: 'Rejected' },
];

interface AdminProblemControlsClientProps {
  problem: IProblem;
  organizations: IOrganization[];
  operators: IUser[];
  viewerRole: UserRole;
  isAssignee: boolean;
}

export function AdminProblemControlsClient({
  problem,
  organizations,
  operators,
  viewerRole,
  isAssignee,
}: AdminProblemControlsClientProps) {
  const isAdmin = viewerRole === UserRole.Admin;
  const canChangeStatus = isAdmin || isAssignee;

  const [orgId, setOrgId] = useState(problem.organizationId ?? '');
  const [assigneeId, setAssigneeId] = useState(problem.assigneeId ?? '');
  const [status, setStatus] = useState<ProblemStatus>(problem.status);
  const [error, setError] = useState<string | null>(null);
  const [pendingKind, setPendingKind] = useState<
    'route' | 'assign' | 'status' | null
  >(null);
  const [isPending, startTransition] = useTransition();

  const wrap = (
    kind: 'route' | 'assign' | 'status',
    fn: () => Promise<{ ok: boolean; error?: string }>,
  ) => {
    setError(null);
    setPendingKind(kind);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error ?? 'Action failed');
      setPendingKind(null);
    });
  };

  const onRoute = () => {
    if (!orgId) {
      setError('Pick an organization first.');
      return;
    }
    wrap('route', () => routeProblemAction(problem.id, orgId));
  };

  const onAssign = () => {
    if (!assigneeId) {
      setError('Pick an assignee first.');
      return;
    }
    wrap('assign', () => assignProblemAction(problem.id, assigneeId));
  };

  const onStatus = () => {
    wrap('status', () => updateProblemStatusAction(problem.id, status));
  };

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Route to organization</p>
          <div className="flex gap-2">
            <Select
              value={orgId}
              onChange={(e) => setOrgId(e.target.value)}
              disabled={isPending}
            >
              <option value="">— Select —</option>
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </Select>
            <Button
              type="button"
              onClick={onRoute}
              disabled={isPending && pendingKind === 'route'}
              variant="outline"
            >
              {pendingKind === 'route' ? 'Routing…' : 'Route'}
            </Button>
          </div>
        </div>
      )}

      {isAdmin && problem.organizationId && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Assign to operator</p>
          {operators.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No operators in this organization yet.
            </p>
          ) : (
            <div className="flex gap-2">
              <Select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                disabled={isPending}
              >
                <option value="">— Select —</option>
                {operators.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </Select>
              <Button
                type="button"
                onClick={onAssign}
                disabled={isPending && pendingKind === 'assign'}
                variant="outline"
              >
                {pendingKind === 'assign' ? 'Assigning…' : 'Assign'}
              </Button>
            </div>
          )}
        </div>
      )}

      {canChangeStatus && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Update status</p>
          <div className="flex gap-2">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProblemStatus)}
              disabled={isPending}
            >
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
            <Button
              type="button"
              onClick={onStatus}
              disabled={isPending && pendingKind === 'status'}
              variant="outline"
            >
              {pendingKind === 'status' ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
