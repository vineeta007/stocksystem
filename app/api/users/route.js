import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getSession } from '@/lib/session';
import { hasPermission } from '@/lib/roles';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }
  if (!hasPermission(session.role, 'edit_settings')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();
  const users = await User.find({}, '-passwordHash').sort({ displayName: 1 });

  return NextResponse.json({ users });
}