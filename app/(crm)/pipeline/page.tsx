'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layouts/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { SafeNumber } from '@/components/safe-format';
import Link from 'next/link';
import { DollarSign, TrendingUp, BarChart3 } from 'lucide-react';

const stageGradients = ['from-blue-500 to-blue-600', 'from-indigo-500 to-indigo-600', 'from-violet-500 to-purple-600', 'from-amber-500 to-orange-600', 'from-emerald-500 to-green-600', 'from-red-500 to-rose-600'];
const stageBars = ['bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-amber-500', 'bg-emerald-500', 'bg-red-500'];

export default function PipelinePage() {
  const [pipeline, setPipeline] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pipeline').then((r) => r.json()).then(setPipeline).catch(() => toast.error('Failed to load pipeline')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  const stages = pipeline?.stages ?? [];
  const totalValue = stages.reduce((s: number, st: any) => s + ((st.deals ?? []).reduce((ds: number, d: any) => ds + (d.value ?? 0), 0)), 0);
  const weightedValue = stages.reduce((s: number, st: any) => s + ((st.deals ?? []).reduce((ds: number, d: any) => ds + (d.value ?? 0) * (st.probability ?? 0), 0)), 0);
  const totalDeals = stages.reduce((s: number, st: any) => s + ((st.deals ?? []).length ?? 0), 0);

  return (
    <div className="space-y-8">
      <PageHeader title="Pipeline" description="Visual pipeline with stage totals and weighted forecast" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Pipeline', value: totalValue, icon: DollarSign, gradient: 'from-blue-500 to-indigo-600' },
          { label: 'Weighted Forecast', value: weightedValue, icon: TrendingUp, gradient: 'from-emerald-500 to-green-600' },
          { label: 'Total Deals', value: totalDeals, icon: BarChart3, gradient: 'from-violet-500 to-purple-600', isCount: true },
        ].map((kpi) => (
          <Card key={kpi.label} className="stat-card card-hover">
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-muted-foreground font-medium">{kpi.label}</div>
                  <div className="text-2xl font-bold font-mono mt-1">
                    {kpi.isCount ? kpi.value : <SafeNumber value={kpi.value} currency="USD" />}
                  </div>
                </div>
                <div className={`flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br ${kpi.gradient} shadow-lg`}>
                  <kpi.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {stages.map((stage: any, idx: number) => {
          const stageValue = (stage.deals ?? []).reduce((s: number, d: any) => s + (d.value ?? 0), 0);
          const pct = totalValue > 0 ? (stageValue / totalValue) * 100 : 0;
          return (
            <Card key={stage.id} className="overflow-hidden">
              <CardContent className="pt-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-1 rounded-full bg-gradient-to-b ${stageGradients[idx] ?? 'from-gray-500 to-gray-600'}`} />
                    <div>
                      <h3 className="font-semibold text-sm">{stage.name}</h3>
                      <span className="text-xs text-muted-foreground">Prob: {Math.round((stage.probability ?? 0) * 100)}%</span>
                    </div>
                    <Badge variant="secondary" className="text-xs font-medium">{(stage.deals ?? []).length} deals</Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold"><SafeNumber value={stageValue} currency="USD" /></div>
                  </div>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${stageBars[idx] ?? 'bg-gray-500'} transition-all duration-500`} style={{ width: `${pct}%` }} />
                </div>
                {(stage.deals ?? []).length > 0 && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {(stage.deals ?? []).slice(0, 6).map((deal: any) => (
                      <Link key={deal.id} href={`/deals/${deal.id}`} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-sm border border-transparent hover:border-border">
                        <div className="font-medium truncate">{deal.title}</div>
                        <div className="text-xs text-muted-foreground flex justify-between mt-1">
                          <span>{deal.company?.name ?? '—'}</span>
                          <span className="font-mono font-medium"><SafeNumber value={deal.value ?? 0} currency="USD" /></span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
