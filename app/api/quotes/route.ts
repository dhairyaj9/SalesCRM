export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const workspaceId = (session.user as any)?.workspaceId;
  if (!workspaceId) return NextResponse.json({ error: 'No workspace' }, { status: 400 });
  const quotes = await prisma.quote.findMany({
    where: { workspaceId },
    include: {
      company: { select: { id: true, name: true } },
      deal: { select: { id: true, title: true } },
      lineItems: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return NextResponse.json(quotes);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const workspaceId = (session.user as any)?.workspaceId;
  if (!workspaceId) return NextResponse.json({ error: 'No workspace' }, { status: 400 });
  const body = await req.json();
  const { lineItems, ...quoteData } = body;
  const quote = await prisma.quote.create({
    data: {
      ...quoteData,
      workspaceId,
      lineItems: lineItems ? { create: lineItems } : undefined,
    },
    include: { lineItems: true },
  });
  return NextResponse.json(quote, { status: 201 });
}
