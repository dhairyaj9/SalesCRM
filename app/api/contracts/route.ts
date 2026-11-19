export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const workspaceId = (session.user as any)?.workspaceId;
  if (!workspaceId) return NextResponse.json({ error: 'No workspace' }, { status: 400 });
  const contracts = await prisma.contract.findMany({
    where: { workspaceId },
    include: { company: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return NextResponse.json(contracts);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const workspaceId = (session.user as any)?.workspaceId;
  if (!workspaceId) return NextResponse.json({ error: 'No workspace' }, { status: 400 });
  const body = await req.json();
  const contract = await prisma.contract.create({ data: { ...body, workspaceId } });
  return NextResponse.json(contract, { status: 201 });
}
