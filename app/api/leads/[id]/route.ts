export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const workspaceId = (session.user as any)?.workspaceId;
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead || lead.workspaceId !== workspaceId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  const { workspaceId: _ws, id: _id, ...data } = body;
  const updated = await prisma.lead.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const workspaceId = (session.user as any)?.workspaceId;
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead || lead.workspaceId !== workspaceId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await prisma.lead.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
