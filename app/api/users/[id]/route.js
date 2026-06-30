import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getSession } from '@/lib/session';

export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const { id } = await params;

  // Users can only edit their own account
  if (session.id !== id) {
    return NextResponse.json(
      { error: 'You can only edit your own account.' },
      { status: 403 }
    );
  }

  const { username, password } = await request.json();
  const update = {};

  await dbConnect();

  if (username) {
    const clean = username.trim().toLowerCase();
    const taken = await User.findOne({ username: clean, _id: { $ne: id } });
    if (taken) {
      return NextResponse.json({ error: 'Username already taken.' }, { status: 409 });
    }
    update.username = clean;
  }

  if (password) {
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }
    update.passwordHash = await bcrypt.hash(password, 10);
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
  }

  const user = await User.findByIdAndUpdate(id, update, { new: true, select: '-passwordHash' });

  if (!user) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  // If they changed their own username, update the session cookie too
  if (update.username) {
    session.username = update.username;
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    cookieStore.set('ss_session', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/',
    });
  }

  return NextResponse.json({ success: true, user });
}