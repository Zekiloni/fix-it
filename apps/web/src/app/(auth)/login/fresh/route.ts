import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AUTH_COOKIE } from '../../../../lib/config';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
  const url = new URL('/login', request.url);
  return NextResponse.redirect(url);
}
