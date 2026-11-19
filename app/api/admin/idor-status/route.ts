export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ enabled: false });
  const workspaceId = (session.user as any)?.workspaceId;
  if (!workspaceId) return NextResponse.json({ enabled: false });
  const settings = await prisma.workspaceSettings.findUnique({ where: { workspaceId } });
  return NextResponse.json({ enabled: settings?.idorVulnerabilityEnabled ?? false });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = (session.user as any)?.role;
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const workspaceId = (session.user as any)?.workspaceId;
  if (!workspaceId) return NextResponse.json({ error: 'No workspace' }, { status: 400 });
  const { enabled } = await req.json();
  const settings = await prisma.workspaceSettings.upsert({
    where: { workspaceId },
    update: { idorVulnerabilityEnabled: !!enabled },
    create: { workspaceId, idorVulnerabilityEnabled: !!enabled },
  });
  return NextResponse.json({ enabled: settings.idorVulnerabilityEnabled });
}
