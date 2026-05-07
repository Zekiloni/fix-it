import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AUTH_COOKIE } from '../../../lib/config';

const SEVEN_DAYS = 60 * 60 * 24 * 7;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SEVEN_DAYS,
  });
  return NextResponse.redirect(new URL('/', request.url));
}
