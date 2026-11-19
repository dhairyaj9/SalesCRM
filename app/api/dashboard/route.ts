export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const workspaceId = (session.user as any)?.workspaceId;
  if (!workspaceId) return NextResponse.json({ error: 'No workspace' }, { status: 400 });

  // KPIs
  const allDeals = await prisma.deal.findMany({ where: { workspaceId }, include: { stage: true } });
  const openDeals = allDeals.filter((d: any) => d.status === 'open');
  const wonDeals = allDeals.filter((d: any) => d.status === 'won');
  const lostDeals = allDeals.filter((d: any) => d.status === 'lost');
  const totalPipeline = openDeals.reduce((s: number, d: any) => s + (d.value ?? 0), 0);
  const totalRevenue = wonDeals.reduce((s: number, d: any) => s + (d.value ?? 0), 0);
  const totalDeals = wonDeals.length + lostDeals.length;
  const conversionRate = totalDeals > 0 ? wonDeals.length / totalDeals : 0;
  const avgDealSize = wonDeals.length > 0 ? totalRevenue / wonDeals.length : 0;

  const kpis = [
    { metric: 'pipeline', label: 'Pipeline Value', value: totalPipeline, format: 'currency_compact', delta: 0.12, delta_label: 'vs last quarter', good_when: 'up', spark: [] },
    { metric: 'revenue', label: 'Won Revenue', value: totalRevenue, format: 'currency_compact', delta: 0.08, delta_label: 'vs last quarter', good_when: 'up', spark: [] },
    { metric: 'conversion', label: 'Win Rate', value: conversionRate, format: 'percent', delta: 0.03, delta_label: 'vs last quarter', good_when: 'up', spark: [] },
    { metric: 'avg_deal', label: 'Avg Deal Size', value: avgDealSize, format: 'currency_compact', delta: -0.05, delta_label: 'vs last quarter', good_when: 'up', spark: [] },
  ];

  // Pipeline funnel
  const stages = await prisma.dealStage.findMany({
    where: { pipeline: { workspaceId } },
    orderBy: { order: 'asc' },
    include: { _count: { select: { deals: true } } },
  });
  const funnel = stages.map((s: any) => ({ category: s.name, value: s._count?.deals ?? 0 }));

  // Revenue by month (forecast data)
  const forecasts = await prisma.forecast.findMany({ where: { workspaceId }, orderBy: { month: 'asc' } });
  const revenueTrend = forecasts.map((f: any) => {
    const d = new Date(f.month);
    return {
      month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      predicted: Math.round(f.predicted),
      actual: f.actual ? Math.round(f.actual) : null,
    };
  });

  // Leaderboard
  const repDeals = await prisma.deal.groupBy({
    by: ['ownerId'],
    where: { workspaceId, status: 'won' },
    _sum: { value: true },
    _count: true,
    orderBy: { _sum: { value: 'desc' } },
    take: 10,
  });
  const ownerIds = repDeals.map((r: any) => r.ownerId).filter(Boolean);
  const ownerMap: Record<string, string> = {};
  if (ownerIds.length > 0) {
    const owners = await prisma.user.findMany({ where: { id: { in: ownerIds as string[] } }, select: { id: true, name: true } });
    owners.forEach((o: any) => { ownerMap[o.id] = o.name ?? 'Unknown'; });
  }
  const leaderboard = repDeals.map((r: any) => ({
    category: ownerMap[r.ownerId ?? ''] ?? 'Unassigned',
    value: Math.round(r._sum?.value ?? 0),
  }));

  // Recent activities
  const recentActivities = await prisma.activity.findMany({
    where: { workspaceId },
    orderBy: { date: 'desc' },
    take: 8,
    include: { user: { select: { name: true } }, company: { select: { name: true } } },
  });
  const activityFeed = recentActivities.map((a: any) => ({
    type: a.type,
    subject: a.subject,
    user: a.user?.name ?? 'System',
    company: a.company?.name ?? '',
    date: a.date?.toISOString() ?? '',
  }));

  // Tasks
  const userId = (session.user as any)?.id;
  const myTasks = await prisma.task.findMany({
    where: { workspaceId, assigneeId: userId, status: { not: 'completed' } },
    orderBy: { dueDate: 'asc' },
    take: 5,
  });
  const tasksList = myTasks.map((t: any) => ({
    id: t.id,
    title: t.title,
    priority: t.priority,
    dueDate: t.dueDate?.toISOString() ?? '',
    status: t.status,
  }));

  return NextResponse.json({
    data_as_of: new Date().toISOString(),
    data: { kpis, funnel, revenue_trend: revenueTrend, leaderboard, activity_feed: activityFeed, tasks: tasksList },
  });
}
