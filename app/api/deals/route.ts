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
  const status = searchParams.get('status');
  const stageId = searchParams.get('stageId');
  const deals = await prisma.deal.findMany({
    where: {
      workspaceId,
      ...(status ? { status } : {}),
      ...(stageId ? { stageId } : {}),
    },
    include: {
      stage: true,
      owner: { select: { id: true, name: true, email: true } },
      company: { select: { id: true, name: true } },
      contact: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 300,
  });
  return NextResponse.json(deals);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const workspaceId = (session.user as any)?.workspaceId;
  if (!workspaceId) return NextResponse.json({ error: 'No workspace' }, { status: 400 });
  const body = await req.json();
  const deal = await prisma.deal.create({ data: { ...body, workspaceId } });
  return NextResponse.json(deal, { status: 201 });
}
