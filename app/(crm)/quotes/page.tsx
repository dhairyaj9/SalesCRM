'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/layouts/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { SafeNumber, SafeDate } from '@/components/safe-format';

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ number: '', notes: '' });

  const fetchQuotes = useCallback(async () => {
    try { const r = await fetch('/api/quotes'); const d = await r.json(); setQuotes(Array.isArray(d) ? d : []); }
    catch { toast.error('Failed to load quotes'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchQuotes(); }, [fetchQuotes]);

  const handleCreate = async () => {
    if (!form.number) { toast.error('Quote number required'); return; }
    try {
      const res = await fetch('/api/quotes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { toast.success('Quote created'); setOpen(false); fetchQuotes(); }
    } catch { toast.error('Error'); }
  };

  const statusConfig: Record<string, { variant: any; className: string }> = {
    draft: { variant: 'secondary', className: '' },
    sent: { variant: 'outline', className: 'border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300' },
    accepted: { variant: 'default', className: 'bg-emerald-500 hover:bg-emerald-600' },
    rejected: { variant: 'destructive', className: '' },
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Quotes & Proposals" description="Create, manage and track sales quotes" actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md shadow-blue-500/15"><Plus className="h-4 w-4 mr-2" />New Quote</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Quote</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Quote Number *</Label><Input value={form.number} onChange={(e: any) => setForm({ ...form, number: e.target.value })} placeholder="Q-2024-0001" /></div>
              <div><Label>Notes</Label><Input value={form.notes} onChange={(e: any) => setForm({ ...form, notes: e.target.value })} /></div>
              <Button onClick={handleCreate} className="w-full">Create Quote</Button>
            </div>
          </DialogContent>
        </Dialog>
      } />

      <Card className="overflow-hidden"><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow className="bg-muted/30">
            <TableHead className="font-semibold">Quote #</TableHead><TableHead className="font-semibold">Company</TableHead><TableHead className="font-semibold">Deal</TableHead><TableHead className="font-semibold">Subtotal</TableHead><TableHead className="font-semibold">Discount</TableHead><TableHead className="font-semibold">Total</TableHead><TableHead className="font-semibold">Status</TableHead><TableHead className="font-semibold">Valid Until</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">Loading...</TableCell></TableRow>
            : (quotes ?? []).length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">No quotes found</TableCell></TableRow>
            : (quotes ?? []).map((q: any) => {
              const sc = statusConfig[q.status] ?? statusConfig.draft;
              return (
                <TableRow key={q.id} className="table-row-hover">
                  <TableCell className="font-medium font-mono">{q.number}</TableCell>
                  <TableCell className="text-muted-foreground">{q.company?.name ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{q.deal?.title ?? '—'}</TableCell>
                  <TableCell className="font-mono text-sm"><SafeNumber value={q.subtotal ?? 0} currency="USD" /></TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground"><SafeNumber value={q.discount ?? 0} currency="USD" /></TableCell>
                  <TableCell className="font-mono font-bold"><SafeNumber value={q.total ?? 0} currency="USD" /></TableCell>
                  <TableCell><Badge variant={sc.variant} className={`capitalize ${sc.className}`}>{q.status}</Badge></TableCell>
                  <TableCell>{q.validUntil ? <SafeDate date={q.validUntil} options={{ dateStyle: 'short' }} className="text-muted-foreground" /> : '—'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
