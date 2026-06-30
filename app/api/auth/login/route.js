import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { ROLE_PERMISSIONS } from '@/lib/roles';

const SESSION_COOKIE = 'ss_session';
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    await dbConnect();
    const user = await User.findOne({ username: username.trim().toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    const sessionPayload = {
      id: user._id.toString(),
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      initials: user.initials,
      permissions: ROLE_PERMISSIONS[user.role] || [],
      loginTime: Date.now(),
    };

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, JSON.stringify(sessionPayload), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });

    return NextResponse.json({ success: true, user: sessionPayload });
  } catch (err) {
    console.error('[login] error:', err);
    return NextResponse.json(
      { success: false, error: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}