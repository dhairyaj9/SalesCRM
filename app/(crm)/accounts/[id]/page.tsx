'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layouts/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Building2, Users, Briefcase, Activity, FileText, DollarSign } from 'lucide-react';
import { SafeDate, SafeNumber } from '@/components/safe-format';

export default function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/companies/${id}`)
      .then((r) => r.json())
      .then((d) => setCompany(d))
      .catch(() => toast.error('Failed to load account'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  if (!company || company?.error) return <div className="flex items-center justify-center h-64 text-muted-foreground">Account not found</div>;

  return (
    <div className="space-y-6">
      <PageHeader title={company.name ?? 'Account'} description={company.industry ? `${company.industry} · ${company.size ?? ''}` : 'Customer Account'} />

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><div className="text-sm text-muted-foreground">Revenue</div><div className="text-2xl font-bold font-mono">{company.revenue ? <SafeNumber value={company.revenue} currency="USD" /> : 'N/A'}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-sm text-muted-foreground">Contacts</div><div className="text-2xl font-bold font-mono">{company.contacts?.length ?? 0}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-sm text-muted-foreground">Active Deals</div><div className="text-2xl font-bold font-mono">{(company.deals ?? []).filter((d: any) => d?.status === 'open').length}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-sm text-muted-foreground">Location</div><div className="text-lg font-medium">{[company.city, company.country].filter(Boolean).join(', ') || 'N/A'}</div></CardContent></Card>
      </div>

      <Tabs defaultValue="contacts">
        <TabsList>
          <TabsTrigger value="contacts"><Users className="h-4 w-4 mr-1" />Contacts</TabsTrigger>
          <TabsTrigger value="deals"><Briefcase className="h-4 w-4 mr-1" />Deals</TabsTrigger>
          <TabsTrigger value="activities"><Activity className="h-4 w-4 mr-1" />Activities</TabsTrigger>
          <TabsTrigger value="transactions"><DollarSign className="h-4 w-4 mr-1" />Transactions</TabsTrigger>
          <TabsTrigger value="notes"><FileText className="h-4 w-4 mr-1" />Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts">
          <Card><CardContent className="p-0">
            <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Title</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead></TableRow></TableHeader>
              <TableBody>
                {(company.contacts ?? []).map((c: any) => (
                  <TableRow key={c.id}><TableCell className="font-medium">{c.firstName} {c.lastName}</TableCell><TableCell>{c.title ?? '-'}</TableCell><TableCell><span suppressHydrationWarning>{c.email ?? '-'}</span></TableCell><TableCell><span suppressHydrationWarning>{c.phone ?? '-'}</span></TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="deals">
          <Card><CardContent className="p-0">
            <Table><TableHeader><TableRow><TableHead>Deal</TableHead><TableHead>Value</TableHead><TableHead>Stage</TableHead><TableHead>Owner</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {(company.deals ?? []).map((d: any) => (
                  <TableRow key={d.id}><TableCell className="font-medium">{d.title}</TableCell><TableCell><SafeNumber value={d.value ?? 0} currency="USD" /></TableCell><TableCell><Badge variant="outline">{d.stage?.name ?? '-'}</Badge></TableCell><TableCell>{d.owner?.name ?? '-'}</TableCell><TableCell><Badge variant={d.status === 'won' ? 'default' : d.status === 'lost' ? 'destructive' : 'secondary'} className="capitalize">{d.status}</Badge></TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="activities">
          <Card><CardContent className="pt-4">
            <div className="space-y-4">
              {(company.activities ?? []).map((a: any) => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Badge variant="outline" className="capitalize shrink-0">{a.type}</Badge>
                  <div><p className="font-medium">{a.subject}</p><p className="text-sm text-muted-foreground">{a.description}</p><SafeDate date={a.date} options={{ dateStyle: 'medium' }} className="text-xs text-muted-foreground" /></div>
                </div>
              ))}
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card><CardContent className="p-0">
            <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Amount</TableHead><TableHead>Description</TableHead></TableRow></TableHeader>
              <TableBody>
                {(company.transactions ?? []).map((t: any) => (
                  <TableRow key={t.id}><TableCell><SafeDate date={t.date} options={{ dateStyle: 'short' }} /></TableCell><TableCell><Badge variant={t.type === 'payment' ? 'default' : 'destructive'} className="capitalize">{t.type}</Badge></TableCell><TableCell><SafeNumber value={t.amount ?? 0} currency="USD" /></TableCell><TableCell>{t.description ?? '-'}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card><CardContent className="pt-4">
            <div className="space-y-3">
              {(company.notes ?? []).map((n: any) => (
                <div key={n.id} className="p-3 rounded-lg bg-muted/50">
                  {n.confidential && <Badge variant="destructive" className="mb-2 text-xs">Confidential</Badge>}
                  <p className="text-sm">{n.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">By {n.user?.name ?? 'Unknown'} · <SafeDate date={n.createdAt} options={{ dateStyle: 'medium' }} /></p>
                </div>
              ))}
            </div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
