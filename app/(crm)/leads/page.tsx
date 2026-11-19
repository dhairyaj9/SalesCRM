'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/layouts/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Search } from 'lucide-react';
import { SafeDate } from '@/components/safe-format';

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  source: string | null;
  status: string;
  score: number;
  owner: { id: string; name: string | null } | null;
  createdAt: string;
}

const statusConfig: Record<string, { bg: string; text: string }> = {
  new: { bg: 'bg-blue-50 dark:bg-blue-950/50', text: 'text-blue-700 dark:text-blue-300' },
  contacted: { bg: 'bg-amber-50 dark:bg-amber-950/50', text: 'text-amber-700 dark:text-amber-300' },
  qualified: { bg: 'bg-emerald-50 dark:bg-emerald-950/50', text: 'text-emerald-700 dark:text-emerald-300' },
  unqualified: { bg: 'bg-red-50 dark:bg-red-950/50', text: 'text-red-700 dark:text-red-300' },
  converted: { bg: 'bg-violet-50 dark:bg-violet-950/50', text: 'text-violet-700 dark:text-violet-300' },
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', source: 'web', status: 'new' });

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch { toast.error('Failed to load leads'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleCreate = async () => {
    if (!form.name) { toast.error('Name is required'); return; }
    try {
      const res = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { toast.success('Lead created'); setOpen(false); setForm({ name: '', email: '', phone: '', company: '', source: 'web', status: 'new' }); fetchLeads(); }
      else toast.error('Failed to create lead');
    } catch { toast.error('Error creating lead'); }
  };

  const filtered = (leads ?? []).filter((l: Lead) =>
    (l?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (l?.company ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (l?.email ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description="Track and manage sales leads"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md shadow-blue-500/15"><Plus className="h-4 w-4 mr-2" />New Lead</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Lead</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Name *</Label><Input value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e: any) => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={(e: any) => setForm({ ...form, phone: e.target.value })} /></div>
                <div><Label>Company</Label><Input value={form.company} onChange={(e: any) => setForm({ ...form, company: e.target.value })} /></div>
                <div><Label>Source</Label>
                  <Select value={form.source} onValueChange={(v: string) => setForm({ ...form, source: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['web', 'referral', 'cold-call', 'event', 'social'].map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreate} className="w-full">Create Lead</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search leads..." value={search} onChange={(e: any) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Company</TableHead>
                <TableHead className="font-semibold">Source</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Score</TableHead>
                <TableHead className="font-semibold">Owner</TableHead>
                <TableHead className="font-semibold">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No leads found</TableCell></TableRow>
              ) : filtered.map((lead: Lead) => {
                const sc = statusConfig[lead.status] ?? { bg: '', text: '' };
                return (
                  <TableRow key={lead.id} className="table-row-hover">
                    <TableCell className="font-medium">
                      <div>{lead.name}</div>
                      <div className="text-xs text-muted-foreground"><span suppressHydrationWarning>{lead.email}</span></div>
                    </TableCell>
                    <TableCell>{lead.company ?? '—'}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize font-normal">{lead.source ?? '—'}</Badge></TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}>{lead.status}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all" style={{ width: `${lead.score}%` }} />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">{lead.score}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{lead.owner?.name ?? '—'}</TableCell>
                    <TableCell><SafeDate date={lead.createdAt} options={{ dateStyle: 'short' }} className="text-sm text-muted-foreground" /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
