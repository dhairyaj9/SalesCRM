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
  const search = searchParams.get('search') ?? '';
  const companies = await prisma.company.findMany({
    where: {
      workspaceId,
      ...(search ? { name: { contains: search, mode: 'insensitive' as any } } : {}),
    },
    orderBy: { name: 'asc' },
    take: 100,
    include: { _count: { select: { contacts: true, deals: true } } },
  });
  return NextResponse.json(companies);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const workspaceId = (session.user as any)?.workspaceId;
  if (!workspaceId) return NextResponse.json({ error: 'No workspace' }, { status: 400 });
  const body = await req.json();
  const company = await prisma.company.create({
    data: { ...body, workspaceId },
  });
  return NextResponse.json(company, { status: 201 });
}
