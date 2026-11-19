'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layouts/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Search, ExternalLink, User } from 'lucide-react';

interface ContactItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  company: { id: string; name: string } | null;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', title: '' });

  const fetchContacts = useCallback(async () => {
    try {
      const res = await fetch(`/api/contacts?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setContacts(Array.isArray(data) ? data : []);
    } catch { toast.error('Failed to load contacts'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { const t = setTimeout(fetchContacts, 300); return () => clearTimeout(t); }, [fetchContacts]);

  const handleCreate = async () => {
    if (!form.firstName || !form.lastName) { toast.error('Name is required'); return; }
    try {
      const res = await fetch('/api/contacts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { toast.success('Contact created'); setOpen(false); setForm({ firstName: '', lastName: '', email: '', phone: '', title: '' }); fetchContacts(); }
      else toast.error('Failed to create contact');
    } catch { toast.error('Error'); }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Contacts" description="Manage contacts across all accounts" actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md shadow-blue-500/15"><Plus className="h-4 w-4 mr-2" />New Contact</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Contact</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>First Name *</Label><Input value={form.firstName} onChange={(e: any) => setForm({ ...form, firstName: e.target.value })} /></div>
                <div><Label>Last Name *</Label><Input value={form.lastName} onChange={(e: any) => setForm({ ...form, lastName: e.target.value })} /></div>
              </div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e: any) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={(e: any) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>Title</Label><Input value={form.title} onChange={(e: any) => setForm({ ...form, title: e.target.value })} /></div>
              <Button onClick={handleCreate} className="w-full">Create Contact</Button>
            </div>
          </DialogContent>
        </Dialog>
      } />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search contacts..." value={search} onChange={(e: any) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <Card className="overflow-hidden"><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow className="bg-muted/30"><TableHead className="font-semibold">Name</TableHead><TableHead className="font-semibold">Title</TableHead><TableHead className="font-semibold">Email</TableHead><TableHead className="font-semibold">Phone</TableHead><TableHead className="font-semibold">Company</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Loading...</TableCell></TableRow>
            : (contacts ?? []).length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No contacts found</TableCell></TableRow>
            : (contacts ?? []).map((c: ContactItem) => (
              <TableRow key={c.id} className="table-row-hover">
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50">
                      <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-medium">{c.firstName} {c.lastName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{c.title ?? '—'}</TableCell>
                <TableCell><span suppressHydrationWarning className="text-muted-foreground">{c.email ?? '—'}</span></TableCell>
                <TableCell><span suppressHydrationWarning className="text-muted-foreground">{c.phone ?? '—'}</span></TableCell>
                <TableCell>{c.company ? <Link href={`/accounts/${c.company.id}`} className="text-primary hover:text-primary/80 transition-colors">{c.company.name}</Link> : '—'}</TableCell>
                <TableCell><Link href={`/contacts/${c.id}`}><Button variant="ghost" size="icon-sm" className="hover:bg-primary/10"><ExternalLink className="h-4 w-4" /></Button></Link></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
