'use client';

import { useEffect, useState, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layouts/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { SafeDate, SafeNumber } from '@/components/safe-format';
import { DollarSign, Building2, User, TrendingUp, Activity, FileText } from 'lucide-react';
import Link from 'next/link';

export default function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [deal, setDeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/deals/${id}`).then((r) => r.json()).then(setDeal).catch(() => toast.error('Failed')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  if (!deal || deal?.error) return <div className="flex items-center justify-center h-64 text-muted-foreground">Deal not found</div>;

  return (
    <div className="space-y-6">
      <PageHeader title={deal.title ?? 'Deal'} description={`${deal.stage?.name ?? ''} · ${deal.status?.toUpperCase() ?? ''}`} />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 flex items-center gap-3"><DollarSign className="h-5 w-5 text-primary" /><div><div className="text-xs text-muted-foreground">Value</div><div className="text-xl font-bold font-mono"><SafeNumber value={deal.value ?? 0} currency="USD" /></div></div></CardContent></Card>
        <Card><CardContent className="pt-4 flex items-center gap-3"><TrendingUp className="h-5 w-5 text-primary" /><div><div className="text-xs text-muted-foreground">Probability</div><div className="text-xl font-bold">{Math.round((deal.probability ?? 0) * 100)}%</div></div></CardContent></Card>
        <Card><CardContent className="pt-4 flex items-center gap-3"><Building2 className="h-5 w-5 text-primary" /><div><div className="text-xs text-muted-foreground">Company</div>{deal.company ? <Link href={`/accounts/${deal.company.id}`} className="text-primary hover:underline">{deal.company.name}</Link> : 'N/A'}</div></CardContent></Card>
        <Card><CardContent className="pt-4 flex items-center gap-3"><User className="h-5 w-5 text-primary" /><div><div className="text-xs text-muted-foreground">Owner</div><div>{deal.owner?.name ?? 'Unassigned'}</div></div></CardContent></Card>
      </div>

      <Tabs defaultValue="activities">
        <TabsList>
          <TabsTrigger value="activities"><Activity className="h-4 w-4 mr-1" />Activities</TabsTrigger>
          <TabsTrigger value="notes"><FileText className="h-4 w-4 mr-1" />Notes</TabsTrigger>
          <TabsTrigger value="quotes"><DollarSign className="h-4 w-4 mr-1" />Quotes</TabsTrigger>
        </TabsList>
        <TabsContent value="activities">
          <Card><CardContent className="pt-4">
            <div className="space-y-3">
              {(deal.activities ?? []).map((a: any) => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Badge variant="outline" className="capitalize">{a.type}</Badge>
                  <div><p className="font-medium text-sm">{a.subject}</p><p className="text-xs text-muted-foreground">{a.description}</p><SafeDate date={a.date} options={{ dateStyle: 'medium' }} className="text-xs text-muted-foreground" /></div>
                </div>
              ))}
              {(deal.activities ?? []).length === 0 && <p className="text-muted-foreground text-sm">No activities logged</p>}
            </div>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="notes">
          <Card><CardContent className="pt-4">
            <div className="space-y-3">
              {(deal.notes ?? []).map((n: any) => (
                <div key={n.id} className="p-3 rounded-lg bg-muted/50">
                  {n.confidential && <Badge variant="destructive" className="mb-1 text-xs">Confidential</Badge>}
                  <p className="text-sm">{n.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">By {n.user?.name ?? 'Unknown'} · <SafeDate date={n.createdAt} options={{ dateStyle: 'medium' }} /></p>
                </div>
              ))}
              {(deal.notes ?? []).length === 0 && <p className="text-muted-foreground text-sm">No notes</p>}
            </div>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="quotes">
          <Card><CardContent className="pt-4">
            <div className="space-y-3">
              {(deal.quotes ?? []).map((q: any) => (
                <div key={q.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div><p className="font-medium">{q.number}</p><SafeNumber value={q.total ?? 0} currency="USD" className="text-sm text-muted-foreground" /></div>
                  <Badge variant={q.status === 'accepted' ? 'default' : q.status === 'rejected' ? 'destructive' : 'secondary'} className="capitalize">{q.status}</Badge>
                </div>
              ))}
              {(deal.quotes ?? []).length === 0 && <p className="text-muted-foreground text-sm">No quotes</p>}
            </div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
