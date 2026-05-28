// app/api/auth/logout/route.js
// POST /api/auth/logout — clears the session cookie

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('ss_session');
  return NextResponse.json({ success: true });
}