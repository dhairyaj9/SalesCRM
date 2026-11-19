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
  const contacts = await prisma.contact.findMany({
    where: {
      workspaceId,
      ...(search ? { OR: [{ firstName: { contains: search, mode: 'insensitive' as any } }, { lastName: { contains: search, mode: 'insensitive' as any } }, { email: { contains: search, mode: 'insensitive' as any } }] } : {}),
    },
    include: { company: { select: { id: true, name: true } } },
    orderBy: { firstName: 'asc' },
    take: 200,
  });
  return NextResponse.json(contacts);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const workspaceId = (session.user as any)?.workspaceId;
  if (!workspaceId) return NextResponse.json({ error: 'No workspace' }, { status: 400 });
  const body = await req.json();
  const contact = await prisma.contact.create({ data: { ...body, workspaceId } });
  return NextResponse.json(contact, { status: 201 });
}
