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
  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      company: true,
      deals: { include: { stage: true }, take: 20 },
      activities: { orderBy: { date: 'desc' }, take: 20, include: { user: { select: { id: true, name: true } } } },
      notes: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  });
  if (!contact) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const hasAccess = await checkWorkspaceAccess(contact.workspaceId, workspaceId);
  if (!hasAccess) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json(contact);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const workspaceId = (session.user as any)?.workspaceId;
  const contact = await prisma.contact.findUnique({ where: { id } });
  if (!contact || contact.workspaceId !== workspaceId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  const { workspaceId: _ws, id: _id, ...data } = body;
  const updated = await prisma.contact.update({ where: { id }, data });
  return NextResponse.json(updated);
}
