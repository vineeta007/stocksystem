// lib/session.js
// Server-side helper to read and validate the session cookie.
// Use this in Server Components, API routes, and middleware.

import { cookies } from 'next/headers';

const SESSION_COOKIE = 'ss_session';

/**
 * Get the current session from the cookie.
 * Returns null if no session or session is invalid.
 * @returns {object|null} session payload
 */
export async function getSession() {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(SESSION_COOKIE)?.value;
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session.username || !session.role) return null;
    return session;
  } catch {
    return null;
  }
}

/**
 * Require a session — call from Server Components or route handlers.
 * Throws a redirect if no session found.
 * @returns {object} session
 */
export async function requireSession() {
  const session = await getSession();
  if (!session) {
    // In a Server Component, use redirect() from next/navigation instead
    throw new Error('Unauthenticated');
  }
  return session;
}