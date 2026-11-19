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
  const contract = await prisma.contract.findUnique({
    where: { id },
    include: { company: true, documents: true },
  });
  if (!contract) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const hasAccess = await checkWorkspaceAccess(contract.workspaceId, workspaceId);
  if (!hasAccess) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json(contract);
}
