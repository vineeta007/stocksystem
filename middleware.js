// middleware.js  (place at project root, same level as package.json)
// Protects all routes under /dashboard — redirects to /login if no session.

import { NextResponse } from 'next/server';

const SESSION_COOKIE = 'ss_session';

// Routes that do NOT require authentication
const PUBLIC_PATHS = ['/login', '/api/auth/login'];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public paths through
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  // Check for session cookie
  const session = request.cookies.get(SESSION_COOKIE)?.value;

  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Optionally validate session shape here
  try {
    const parsed = JSON.parse(session);
    if (!parsed.username || !parsed.role) throw new Error('bad session');
  } catch {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except static files and _next internals
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)'],
};