'use client';

import { AbacusDashboard, useDashboardData } from '@/components/viz/abacus-dashboard';
import { manifest } from '@/lib/dashboard-manifest';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckSquare, Clock, Sparkles } from 'lucide-react';
import { SafeDate } from '@/components/safe-format';
import { useEffect, useState } from 'react';

interface ActivityItem {
  type: string;
  subject: string;
  user: string;
  company: string;
  date: string;
}

interface TaskItem {
  id: string;
  title: string;
  priority: string;
  dueDate: string;
  status: string;
}

export default function DashboardPage() {
  const { data, dataAsOf } = useDashboardData('/api/dashboard', 60_000);
  const { data: session } = useSession();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  useEffect(() => {
    if (data?.activity_feed) setActivities(data.activity_feed as unknown as ActivityItem[]);
    if (data?.tasks) setTasks(data.tasks as unknown as TaskItem[]);
  }, [data]);

  const priorityColor: Record<string, string> = {
    urgent: 'destructive',
    high: 'destructive',
    medium: 'secondary',
    low: 'outline',
  };

  const activityIcon: Record<string, string> = {
    call: '📞', email: '📧', meeting: '🤝', note: '📝', task: '✅',
  };

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Welcome back{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}</h1>
          <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening with your sales pipeline today.</p>
        </div>
      </div>

      <AbacusDashboard manifest={manifest as any} data={data} dataAsOf={dataAsOf} className="" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card className="card-hover">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-blue-500/10">
                <Activity className="h-3.5 w-3.5 text-blue-500" />
              </div>
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(activities ?? []).map((a: ActivityItem, i: number) => (
                <div key={i} className="flex items-start gap-3 text-sm p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                  <span className="text-lg mt-0.5">{activityIcon[a?.type] ?? '📋'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{a?.subject ?? 'Activity'}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {a?.user ?? 'Unknown'} {a?.company ? `· ${a.company}` : ''}
                    </p>
                  </div>
                  {a?.date && <SafeDate date={a.date} options={{ dateStyle: 'short' }} className="text-xs text-muted-foreground shrink-0 mt-0.5" />}
                </div>
              ))}
              {(activities ?? []).length === 0 && <p className="text-muted-foreground text-sm py-4 text-center">No recent activities</p>}
            </div>
          </CardContent>
        </Card>

        {/* My Tasks */}
        <Card className="card-hover">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-green-500/10">
                <CheckSquare className="h-3.5 w-3.5 text-green-500" />
              </div>
              My Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(tasks ?? []).map((t: TaskItem, tIdx: number) => (
                <div key={t?.id ?? `task-${tIdx}`} className="flex items-center gap-3 text-sm p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{t?.title ?? 'Task'}</p>
                    {t?.dueDate && <SafeDate date={t.dueDate} options={{ dateStyle: 'short' }} className="text-xs text-muted-foreground" />}
                  </div>
                  <Badge variant={(priorityColor[t?.priority ?? ''] ?? 'secondary') as any} className="text-xs capitalize">
                    {t?.priority ?? 'medium'}
                  </Badge>
                </div>
              ))}
              {(tasks ?? []).length === 0 && <p className="text-muted-foreground text-sm py-4 text-center">No pending tasks</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
