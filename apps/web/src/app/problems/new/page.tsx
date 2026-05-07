import { redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@fix-it/ui';
import { ReportProblemForm } from '../../../components/report-problem-form';
import { isAuthenticated } from '../../../lib/session';

export const metadata = { title: 'Report a problem · CityFix' };

export default async function NewProblemPage() {
  if (!(await isAuthenticated())) redirect('/login');
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Report a problem</CardTitle>
          <CardDescription>
            Pin the location on the map. The more accurate, the faster it gets fixed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportProblemForm />
        </CardContent>
      </Card>
    </div>
  );
}
