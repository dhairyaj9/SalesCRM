export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const workspaceId = (session.user as any)?.workspaceId;
  if (!workspaceId) return NextResponse.json({ error: 'No workspace' }, { status: 400 });
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const activities = await prisma.activity.findMany({
    where: { workspaceId, ...(type ? { type } : {}) },
    include: {
      user: { select: { id: true, name: true } },
      company: { select: { id: true, name: true } },
      deal: { select: { id: true, title: true } },
    },
    orderBy: { date: 'desc' },
    take: 100,
  });
  return NextResponse.json(activities);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const workspaceId = (session.user as any)?.workspaceId;
  if (!workspaceId) return NextResponse.json({ error: 'No workspace' }, { status: 400 });
  const body = await req.json();
  const userId = (session.user as any)?.id;
  const activity = await prisma.activity.create({ data: { ...body, userId, workspaceId } });
  return NextResponse.json(activity, { status: 201 });
}
