export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const workspaceId = (session.user as any)?.workspaceId;
  if (!workspaceId) return NextResponse.json({ error: 'No workspace' }, { status: 400 });
  const pipeline = await prisma.pipeline.findFirst({
    where: { workspaceId },
    include: {
      stages: {
        orderBy: { order: 'asc' },
        include: {
          deals: {
            include: {
              company: { select: { id: true, name: true } },
              owner: { select: { id: true, name: true } },
              contact: { select: { id: true, firstName: true, lastName: true } },
            },
          },
          _count: { select: { deals: true } },
        },
      },
    },
  });
  return NextResponse.json(pipeline);
}
