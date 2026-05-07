'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { Button, Input, Label } from '@fix-it/ui';
import { loginAction, type AuthFormState } from '../lib/actions/auth';
import { GoogleSignInButton } from './google-sign-in-button';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Signing in…' : 'Sign in'}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState<AuthFormState | undefined, FormData>(
    loginAction,
    undefined,
  );

  return (
    <div className="space-y-4">
      <GoogleSignInButton />
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">or</span>
        </div>
      </div>
      <form action={formAction} className="space-y-4">
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
            autoComplete="current-password"
            required
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
      </form>
      <p className="text-sm text-muted-foreground text-center">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium underline-offset-4 hover:underline">
          Sign up
        </Link>
      </p>
      <p className="text-xs text-muted-foreground text-center">
        Trouble signing in?{' '}
        <a href="/login/fresh" className="underline-offset-4 hover:underline">
          Reset session
        </a>
      </p>
    </div>
  );
}
