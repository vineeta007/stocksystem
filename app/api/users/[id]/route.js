import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getSession } from '@/lib/session';
import { hasPermission } from '@/lib/roles';

export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }
  if (!hasPermission(session.role, 'edit_settings')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const { username, password } = await request.json();

  const update = {};

  if (username) {
    const clean = username.trim().toLowerCase();
    const taken = await dbConnect().then(() =>
      User.findOne({ username: clean, _id: { $ne: id } })
    );
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

  await dbConnect();
  const user = await User.findByIdAndUpdate(id, update, { new: true, select: '-passwordHash' });

  if (!user) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, user });
}