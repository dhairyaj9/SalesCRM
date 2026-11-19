export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }
    const hashed = await bcrypt.hash(password, 12);
    const displayName = (name && typeof name === 'string' && name.trim()) ? name.trim() : email.split('@')[0];
    const baseSlug = displayName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'workspace';
    const slug = `${baseSlug}-${randomBytes(4).toString('hex')}`;

    const workspace = await prisma.workspace.create({
      data: {
        name: `${displayName}'s Workspace`,
        slug,
        settings: {
          create: {
            idorVulnerabilityEnabled: false,
          },
        },
        pipelines: {
          create: {
            name: 'Sales Pipeline',
            stages: {
              create: [
                { name: 'Prospecting', order: 1, probability: 0.1 },
                { name: 'Qualification', order: 2, probability: 0.25 },
                { name: 'Proposal', order: 3, probability: 0.5 },
                { name: 'Negotiation', order: 4, probability: 0.75 },
                { name: 'Closed Won', order: 5, probability: 1.0 },
                { name: 'Closed Lost', order: 6, probability: 0.0 },
              ],
            },
          },
        },
      },
    });

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name: displayName,
        role: 'admin',
        workspaceId: workspace.id,
      },
    });
    return NextResponse.json({ id: user.id, email: user.email, name: user.name }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Server error' }, { status: 500 });
  }
}
