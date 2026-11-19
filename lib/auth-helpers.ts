import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function getAuthSession() {
  return await auth();
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    return { session: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { session, error: null };
}

export function isAdmin(role: string | null | undefined): boolean {
  return role === 'admin';
}

export function isManagerOrAbove(role: string | null | undefined): boolean {
  return role === 'admin' || role === 'manager';
}
