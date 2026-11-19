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
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      contacts: { take: 50 },
      deals: { include: { stage: true, owner: { select: { id: true, name: true } } }, take: 50 },
      activities: { orderBy: { date: 'desc' }, take: 20, include: { user: { select: { id: true, name: true } } } },
      notes: { orderBy: { createdAt: 'desc' }, take: 20, include: { user: { select: { id: true, name: true } } } },
      contracts: { take: 20 },
      transactions: { orderBy: { date: 'desc' }, take: 20 },
    },
  });
  if (!company) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const hasAccess = await checkWorkspaceAccess(company.workspaceId, workspaceId);
  if (!hasAccess) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json(company);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const workspaceId = (session.user as any)?.workspaceId;
  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (company.workspaceId !== workspaceId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  const { workspaceId: _ws, id: _id, ...updateData } = body;
  const updated = await prisma.company.update({ where: { id }, data: updateData });
  return NextResponse.json(updated);
}
