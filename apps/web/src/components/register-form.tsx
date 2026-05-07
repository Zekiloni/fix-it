'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { Button, Input, Label } from '@fix-it/ui';
import { registerAction, type AuthFormState } from '../lib/actions/auth';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Creating account…' : 'Create account'}
    </Button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useActionState<AuthFormState | undefined, FormData>(
    registerAction,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" autoComplete="name" required />
        {state?.fieldErrors?.['name'] && (
          <p className="text-sm text-destructive">{state.fieldErrors['name']}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
        {state?.fieldErrors?.['email'] && (
          <p className="text-sm text-destructive">{state.fieldErrors['email']}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
        {state?.fieldErrors?.['password'] && (
          <p className="text-sm text-destructive">{state.fieldErrors['password']}</p>
        )}
      </div>
      {state?.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      <SubmitButton />
      <p className="text-sm text-muted-foreground text-center">
        Already have an account?{' '}
        <Link href="/login" className="font-medium underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
