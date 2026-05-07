import { buttonVariants, cn } from '@fix-it/ui';
import { API_BASE_URL } from '../lib/config';

interface GoogleSignInButtonProps {
  label?: string;
}

export function GoogleSignInButton({
  label = 'Continue with Google',
}: GoogleSignInButtonProps) {
  return (
    <a
      href={`${API_BASE_URL}/auth/google`}
      className={cn(buttonVariants({ variant: 'outline' }), 'w-full gap-2')}
    >
      <svg
        aria-hidden
        viewBox="0 0 48 48"
        className="h-4 w-4"
      >
        <path
          fill="#FFC107"
          d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.5-5.9 8-11.3 8a12 12 0 0 1 0-24 12 12 0 0 1 8.5 3.5l5.7-5.7A20 20 0 1 0 44 24c0-1.2-.1-2.4-.4-3.5z"
        />
        <path
          fill="#FF3D00"
          d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12a12 12 0 0 1 8.5 3.5l5.7-5.7A20 20 0 0 0 6.3 14.7z"
        />
        <path
          fill="#4CAF50"
          d="M24 44a20 20 0 0 0 13.5-5.2l-6.2-5.3A12 12 0 0 1 12.7 28l-6.5 5A20 20 0 0 0 24 44z"
        />
        <path
          fill="#1976D2"
          d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4 5.5l6.2 5.3A19.5 19.5 0 0 0 44 24c0-1.2-.1-2.4-.4-3.5z"
        />
      </svg>
      {label}
    </a>
  );
}
