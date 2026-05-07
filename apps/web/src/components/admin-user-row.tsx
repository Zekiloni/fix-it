'use client';

import { useState, useTransition } from 'react';
import { Select } from '@fix-it/ui';
import { type IOrganization, type IUser, UserRole } from '@fix-it/shared';
import {
  setUserOrganizationAction,
  setUserRoleAction,
} from '../lib/actions/users';

const roleLabels: Record<UserRole, string> = {
  [UserRole.User]: 'Citizen',
  [UserRole.Operator]: 'Operator',
  [UserRole.Admin]: 'Admin',
};

interface AdminUserRowProps {
  user: IUser;
  organizations: IOrganization[];
}

export function AdminUserRow({ user, organizations }: AdminUserRowProps) {
  const [role, setRole] = useState(user.role);
  const [orgId, setOrgId] = useState(user.organizationId ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onRoleChange = (next: UserRole) => {
    const prev = role;
    setRole(next);
    setError(null);
    startTransition(async () => {
      const res = await setUserRoleAction(user.id, next);
      if (!res.ok) {
        setRole(prev);
        setError(res.error ?? 'Failed to update role');
      }
    });
  };

  const onOrgChange = (next: string) => {
    const prev = orgId;
    setOrgId(next);
    setError(null);
    startTransition(async () => {
      const res = await setUserOrganizationAction(
        user.id,
        next === '' ? null : next,
      );
      if (!res.ok) {
        setOrgId(prev);
        setError(res.error ?? 'Failed to update organization');
      }
    });
  };

  return (
    <tr className="border-b last:border-b-0">
      <td className="px-3 py-2 text-sm">
        <div className="font-medium">{user.name}</div>
        <div className="text-xs text-muted-foreground">{user.email}</div>
      </td>
      <td className="px-3 py-2">
        <Select
          value={role}
          onChange={(e) => onRoleChange(e.target.value as UserRole)}
          disabled={isPending}
          className="h-9"
        >
          {Object.values(UserRole).map((r) => (
            <option key={r} value={r}>
              {roleLabels[r]}
            </option>
          ))}
        </Select>
      </td>
      <td className="px-3 py-2">
        <Select
          value={orgId}
          onChange={(e) => onOrgChange(e.target.value)}
          disabled={isPending}
          className="h-9"
        >
          <option value="">— None —</option>
          {organizations.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </Select>
      </td>
      <td className="px-3 py-2 text-xs text-destructive">
        {error}
      </td>
    </tr>
  );
}
