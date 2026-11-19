'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layouts/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Building2, Plus, Search, ExternalLink } from 'lucide-react';
import { SafeNumber } from '@/components/safe-format';

interface Company {
  id: string;
  name: string;
  industry: string | null;
  size: string | null;
  revenue: number | null;
  city: string | null;
  country: string | null;
  _count: { contacts: number; deals: number };
}

export default function AccountsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', industry: '', size: '', website: '', email: '', phone: '' });

  const fetchCompanies = useCallback(async () => {
    try {
      const res = await fetch(`/api/companies?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setCompanies(Array.isArray(data) ? data : []);
    } catch { toast.error('Failed to load accounts'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { const t = setTimeout(fetchCompanies, 300); return () => clearTimeout(t); }, [fetchCompanies]);

  const handleCreate = async () => {
    if (!form.name) { toast.error('Name is required'); return; }
    try {
      const res = await fetch('/api/companies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { toast.success('Account created'); setOpen(false); setForm({ name: '', industry: '', size: '', website: '', email: '', phone: '' }); fetchCompanies(); }
      else toast.error('Failed to create account');
    } catch { toast.error('Error creating account'); }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Accounts" description="Manage customer companies and organizations" actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md shadow-blue-500/15"><Plus className="h-4 w-4 mr-2" />New Account</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Account</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Company Name *</Label><Input value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Industry</Label><Input value={form.industry} onChange={(e: any) => setForm({ ...form, industry: e.target.value })} /></div>
              <div><Label>Size</Label><Input value={form.size} onChange={(e: any) => setForm({ ...form, size: e.target.value })} placeholder="e.g. 51-200" /></div>
              <div><Label>Website</Label><Input value={form.website} onChange={(e: any) => setForm({ ...form, website: e.target.value })} /></div>
              <Button onClick={handleCreate} className="w-full">Create Account</Button>
            </div>
          </DialogContent>
        </Dialog>
      } />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search accounts..." value={search} onChange={(e: any) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold">Company</TableHead>
                <TableHead className="font-semibold">Industry</TableHead>
                <TableHead className="font-semibold">Size</TableHead>
                <TableHead className="font-semibold">Revenue</TableHead>
                <TableHead className="font-semibold">Contacts</TableHead>
                <TableHead className="font-semibold">Deals</TableHead>
                <TableHead className="font-semibold">Location</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : (companies ?? []).length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">No accounts found</TableCell></TableRow>
              ) : (companies ?? []).map((c: Company) => (
                <TableRow key={c.id} className="table-row-hover">
                  <TableCell>
                    <Link href={`/accounts/${c.id}`} className="font-medium text-primary hover:text-primary/80 flex items-center gap-2 transition-colors">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/50">
                        <Building2 className="h-4 w-4 text-blue-500" />
                      </div>
                      {c.name}
                    </Link>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="font-normal">{c.industry ?? '—'}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{c.size ?? '—'}</TableCell>
                  <TableCell className="font-mono text-sm">{c.revenue ? <SafeNumber value={c.revenue} currency="USD" /> : '—'}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center justify-center h-6 min-w-[24px] rounded-full bg-blue-50 dark:bg-blue-950/50 text-xs font-medium text-blue-600 dark:text-blue-400">{c._count?.contacts ?? 0}</span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center justify-center h-6 min-w-[24px] rounded-full bg-green-50 dark:bg-green-950/50 text-xs font-medium text-green-600 dark:text-green-400">{c._count?.deals ?? 0}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{[c.city, c.country].filter(Boolean).join(', ') || '—'}</TableCell>
                  <TableCell><Link href={`/accounts/${c.id}`}><Button variant="ghost" size="icon-sm" className="hover:bg-primary/10"><ExternalLink className="h-4 w-4" /></Button></Link></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
