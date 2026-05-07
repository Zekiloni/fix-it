import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { Button, buttonVariants, cn } from '@fix-it/ui';
import { UserRole } from '@fix-it/shared';
import { logoutAction } from '../lib/actions/auth';
import { getCurrentUser } from '../lib/session';
import { NotificationDot } from './notification-dot';

export async function SiteHeader() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <MapPin className="h-5 w-5" />
          <span>CityFix</span>
        </Link>
        <nav className="flex flex-1 items-center gap-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Problems
          </Link>
          {(user?.role === UserRole.Operator ||
            user?.role === UserRole.Admin) && (
            <>
              <Link href="/board" className="hover:text-foreground">
                Board
              </Link>
              <Link href="/work" className="hover:text-foreground">
                My work
              </Link>
            </>
          )}
          {user?.role === UserRole.Admin && (
            <Link href="/admin" className="hover:text-foreground">
              Admin
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <NotificationDot />
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user.name}
              </span>
              <form action={logoutAction}>
                <Button type="submit" variant="ghost" size="sm">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className={cn(buttonVariants({ size: 'sm' }))}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
