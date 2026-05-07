import { redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@fix-it/ui';
import { RegisterForm } from '../../../components/register-form';
import { isAuthenticated } from '../../../lib/session';

export const metadata = { title: 'Create account · CityFix' };

export default async function RegisterPage() {
  if (await isAuthenticated()) redirect('/');
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Report and follow problems in your city.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}
