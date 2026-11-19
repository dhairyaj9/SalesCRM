'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layouts/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ExternalLink } from 'lucide-react';
import { SafeNumber, SafeDate } from '@/components/safe-format';

export default function ContractsPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_contracts = useCallback(async () => {
    try { const r = await fetch('/api/contracts'); const d = await r.json(); setContracts(Array.isArray(d) ? d : []); }
    catch { toast.error('Failed'); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch_contracts(); }, [fetch_contracts]);

  const statusConfig: Record<string, { variant: any; className: string }> = {
    draft: { variant: 'secondary', className: '' },
    under_review: { variant: 'outline', className: 'border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-300' },
    signed: { variant: 'default', className: 'bg-emerald-500 hover:bg-emerald-600' },
    expired: { variant: 'destructive', className: '' },
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Contracts" description="Manage contracts with status tracking" />
      <Card className="overflow-hidden"><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow className="bg-muted/30">
            <TableHead className="font-semibold">Title</TableHead><TableHead className="font-semibold">Company</TableHead><TableHead className="font-semibold">Value</TableHead><TableHead className="font-semibold">Status</TableHead><TableHead className="font-semibold">Start</TableHead><TableHead className="font-semibold">End</TableHead><TableHead></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">Loading...</TableCell></TableRow>
            : (contracts ?? []).length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No contracts found</TableCell></TableRow>
            : (contracts ?? []).map((c: any) => {
              const sc = statusConfig[c.status] ?? statusConfig.draft;
              return (
                <TableRow key={c.id} className="table-row-hover">
                  <TableCell className="font-medium max-w-xs truncate">{c.title}</TableCell>
                  <TableCell className="text-muted-foreground">{c.company?.name ?? '—'}</TableCell>
                  <TableCell className="font-mono font-semibold"><SafeNumber value={c.value ?? 0} currency="USD" /></TableCell>
                  <TableCell><Badge variant={sc.variant} className={`capitalize ${sc.className}`}>{(c.status ?? '').replace('_', ' ')}</Badge></TableCell>
                  <TableCell>{c.startDate ? <SafeDate date={c.startDate} options={{ dateStyle: 'short' }} className="text-muted-foreground" /> : '—'}</TableCell>
                  <TableCell>{c.endDate ? <SafeDate date={c.endDate} options={{ dateStyle: 'short' }} className="text-muted-foreground" /> : '—'}</TableCell>
                  <TableCell><Link href={`/contracts/${c.id}`}><Button variant="ghost" size="icon-sm" className="hover:bg-primary/10"><ExternalLink className="h-4 w-4" /></Button></Link></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
