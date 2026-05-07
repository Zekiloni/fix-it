import { redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@fix-it/ui';
import {
  type IOrganization,
  type IUser,
  UserRole,
} from '@fix-it/shared';
import { ApiError, apiFetch } from '../../lib/api-client';
import { getCurrentUser } from '../../lib/session';
import { AdminUserRow } from '../../components/admin-user-row';
import { CreateOrganizationForm } from '../../components/create-organization-form';

export const metadata = { title: 'Admin · CityFix' };

async function loadAll(): Promise<{
  users: IUser[];
  organizations: IOrganization[];
}> {
  const [users, organizations] = await Promise.all([
    apiFetch<IUser[]>('/users').catch((err) =>
      err instanceof ApiError ? [] : Promise.reject(err),
    ),
    apiFetch<IOrganization[]>('/organizations').catch((err) =>
      err instanceof ApiError ? [] : Promise.reject(err),
    ),
  ]);
  return { users, organizations };
}

export default async function AdminPage() {
  const me = await getCurrentUser();
  if (!me) redirect('/login');
  if (me.role !== UserRole.Admin) redirect('/');

  const { users, organizations } = await loadAll();

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
        <p className="text-sm text-muted-foreground">
          Manage users and organizations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Promote citizens to operators and assign them to an organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                  <tr className="border-b">
                    <th className="px-3 py-2 font-medium">User</th>
                    <th className="px-3 py-2 font-medium">Role</th>
                    <th className="px-3 py-2 font-medium">Organization</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <AdminUserRow
                      key={u.id}
                      user={u}
                      organizations={organizations}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organizations</CardTitle>
          <CardDescription>
            Departments that handle reported problems.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {organizations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No organizations yet.
            </p>
          ) : (
            <ul className="divide-y rounded-md border">
              {organizations.map((o) => (
                <li
                  key={o.id}
                  className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                >
                  <div>
                    <div className="font-medium">{o.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {o.slug} · {o.contactEmail}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 text-xs text-muted-foreground capitalize">
                    {o.categories.join(', ')}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t pt-4">
            <h3 className="mb-3 text-sm font-medium">Create new</h3>
            <CreateOrganizationForm />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
