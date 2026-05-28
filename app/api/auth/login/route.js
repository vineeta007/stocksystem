// app/api/auth/login/route.js
// POST /api/auth/login
// Body: { username, password }
// Returns: { success, user: { username, displayName, role } }

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { findUserByUsername } from '@/lib/users';
import { ROLE_PERMISSIONS } from '@/lib/roles';

const SESSION_COOKIE = 'ss_session';
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    const user = findUserByUsername(username.trim());

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    // Direct comparison (replace with bcrypt.compare in production)
    // const isMatch = await bcrypt.compare(password, user.password);
    const isMatch = password === user.password;

    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    // Build session payload (never include password)
    const sessionPayload = {
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      initials: user.initials,
      permissions: ROLE_PERMISSIONS[user.role] || [],
      loginTime: Date.now(),
    };

    // Set session cookie
    // In production, encrypt this with jose or iron-session
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, JSON.stringify(sessionPayload), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: sessionPayload,
    });
  } catch (err) {
    console.error('[login] error:', err);
    return NextResponse.json(
      { success: false, error: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}