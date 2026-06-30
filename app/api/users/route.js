import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  await dbConnect();
  const users = await User.find({}, '-passwordHash').sort({ displayName: 1 });

  return NextResponse.json({ users });
}

export async function POST(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const { username, displayName, role, password } = await request.json();

  if (!username || !displayName || !role || !password) {
    return NextResponse.json(
      { error: 'Username, display name, role, and password are all required.' },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: 'Password must be at least 6 characters.' },
      { status: 400 }
    );
  }

  await dbConnect();

  const clean = username.trim().toLowerCase();
  const exists = await User.findOne({ username: clean });
  if (exists) {
    return NextResponse.json({ error: 'Username already taken.' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  const user = await User.create({
    username: clean,
    displayName: displayName.trim(),
    role,
    passwordHash,
    initials,
  });

  const { passwordHash: _omit, ...safeUser } = user.toObject();

  return NextResponse.json({ success: true, user: safeUser }, { status: 201 });
}