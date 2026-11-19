'use client';

import { useEffect, useState, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layouts/page-header';
import { toast } from 'sonner';
import { SafeDate, SafeNumber } from '@/components/safe-format';
import { Mail, Phone, Building2, Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [contact, setContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/contacts/${id}`)
      .then((r) => r.json())
      .then(setContact)
      .catch(() => toast.error('Failed to load contact'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  if (!contact || contact?.error) return <div className="flex items-center justify-center h-64 text-muted-foreground">Contact not found</div>;

  return (
    <div className="space-y-6">
      <PageHeader title={`${contact.firstName ?? ''} ${contact.lastName ?? ''}`} description={contact.title ?? 'Contact'} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-4 flex items-center gap-3"><Mail className="h-5 w-5 text-primary" /><div><div className="text-xs text-muted-foreground">Email</div><span suppressHydrationWarning>{contact.email ?? 'N/A'}</span></div></CardContent></Card>
        <Card><CardContent className="pt-4 flex items-center gap-3"><Phone className="h-5 w-5 text-primary" /><div><div className="text-xs text-muted-foreground">Phone</div><span suppressHydrationWarning>{contact.phone ?? 'N/A'}</span></div></CardContent></Card>
        <Card><CardContent className="pt-4 flex items-center gap-3"><Building2 className="h-5 w-5 text-primary" /><div><div className="text-xs text-muted-foreground">Company</div>{contact.company ? <Link href={`/accounts/${contact.company.id}`} className="text-primary hover:underline">{contact.company.name}</Link> : 'N/A'}</div></CardContent></Card>
      </div>

      {(contact.deals ?? []).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Briefcase className="h-4 w-4" />Deals</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(contact.deals ?? []).map((d: any) => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div><Link href={`/deals/${d.id}`} className="font-medium text-primary hover:underline">{d.title}</Link><div className="text-sm text-muted-foreground"><SafeNumber value={d.value ?? 0} currency="USD" /></div></div>
                  <Badge variant={d.status === 'won' ? 'default' : d.status === 'lost' ? 'destructive' : 'secondary'} className="capitalize">{d.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {(contact.activities ?? []).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(contact.activities ?? []).map((a: any) => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Badge variant="outline" className="capitalize shrink-0">{a.type}</Badge>
                  <div><p className="font-medium text-sm">{a.subject}</p><SafeDate date={a.date} options={{ dateStyle: 'medium' }} className="text-xs text-muted-foreground" /></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
