export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { checkWorkspaceAccess } from '@/lib/idor-check';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const workspaceId = (session.user as any)?.workspaceId;
  if (!workspaceId) return NextResponse.json({ error: 'No workspace' }, { status: 400 });
  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      stage: true,
      owner: { select: { id: true, name: true, email: true } },
      company: true,
      contact: true,
      activities: { orderBy: { date: 'desc' }, take: 20, include: { user: { select: { id: true, name: true } } } },
      notes: { orderBy: { createdAt: 'desc' }, take: 20, include: { user: { select: { id: true, name: true } } } },
      quotes: { take: 10 },
    },
  });
  if (!deal) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const hasAccess = await checkWorkspaceAccess(deal.workspaceId, workspaceId);
  if (!hasAccess) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json(deal);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const workspaceId = (session.user as any)?.workspaceId;
  const deal = await prisma.deal.findUnique({ where: { id } });
  if (!deal || deal.workspaceId !== workspaceId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  const { workspaceId: _ws, id: _id, ...data } = body;
  const updated = await prisma.deal.update({ where: { id }, data });
  return NextResponse.json(updated);
}
