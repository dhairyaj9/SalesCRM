'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { PageHeader } from '@/components/layouts/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Plus, Users, Shield, AlertTriangle, User } from 'lucide-react';
import { SafeDate } from '@/components/safe-format';

export default function AdminPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const [users, setUsers] = useState<any[]>([]);
  const [idorEnabled, setIdorEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: 'password123', role: 'rep' });

  const fetchData = useCallback(async () => {
    try {
      const [usersRes, idorRes] = await Promise.all([fetch('/api/users'), fetch('/api/admin/idor-status')]);
      const usersData = await usersRes.json();
      const idorData = await idorRes.json();
      setUsers(Array.isArray(usersData) ? usersData : []);
      setIdorEnabled(idorData?.enabled === true);
    } catch { toast.error('Failed to load admin data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreateUser = async () => {
    if (!form.email || !form.name) { toast.error('Name and email required'); return; }
    try {
      const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { toast.success('User created'); setOpen(false); setForm({ name: '', email: '', password: 'password123', role: 'rep' }); fetchData(); }
      else { const d = await res.json(); toast.error(d?.error ?? 'Failed'); }
    } catch { toast.error('Error'); }
  };

  const toggleIdor = async (enabled: boolean) => {
    try {
      const res = await fetch('/api/admin/idor-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled }) });
      const data = await res.json();
      setIdorEnabled(data?.enabled === true);
      toast.success(enabled ? 'IDOR vulnerability enabled' : 'IDOR vulnerability disabled');
    } catch { toast.error('Failed to toggle'); }
  };

  if (role !== 'admin') return <div className="flex items-center justify-center h-64 text-muted-foreground">Access denied. Admin role required.</div>;

  const roleBadge: Record<string, { variant: any; className: string }> = {
    admin: { variant: 'default', className: 'bg-gradient-to-r from-blue-500 to-indigo-600' },
    manager: { variant: 'secondary', className: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300' },
    rep: { variant: 'outline', className: 'font-normal' },
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Admin" description="Manage users, workspace settings and security testing" />

      {/* Security Testing Section */}
      <Card className="border-red-200/50 dark:border-red-900/50 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-red-500 to-orange-500" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-red-50 dark:bg-red-950/50">
              <Shield className="h-4 w-4 text-red-500" />
            </div>
            Security Testing Environment
          </CardTitle>
          <CardDescription>Enable or disable the IDOR vulnerability for security testing. When enabled, API endpoints skip workspace ownership checks.</CardDescription>
        </CardHeader>
        <CardContent>
          {idorEnabled && (
            <Alert variant="destructive" className="mb-5 border-red-200 dark:border-red-900">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="font-semibold">Warning</AlertTitle>
              <AlertDescription>IDOR vulnerability is currently ACTIVE. API routes for companies, deals, contracts, and contacts will not enforce workspace isolation. Any authenticated user can access records from other workspaces by guessing record IDs.</AlertDescription>
            </Alert>
          )}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border">
            <div>
              <p className="font-semibold text-sm">IDOR Vulnerability Toggle</p>
              <p className="text-sm text-muted-foreground mt-0.5">Skip workspace ownership check on record API routes</p>
            </div>
            <Switch checked={idorEnabled} onCheckedChange={toggleIdor} />
          </div>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/50">
                <Users className="h-4 w-4 text-blue-500" />
              </div>
              User Management
            </CardTitle>
            <CardDescription className="mt-1">Manage workspace users and their roles</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-sm"><Plus className="h-4 w-4 mr-1" />Add User</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create User</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Name *</Label><Input value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e: any) => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label>Password</Label><Input value={form.password} onChange={(e: any) => setForm({ ...form, password: e.target.value })} /></div>
                <div><Label>Role</Label>
                  <Select value={form.role} onValueChange={(v: string) => setForm({ ...form, role: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="rep">Sales Rep</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateUser} className="w-full">Create User</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow className="bg-muted/30"><TableHead className="font-semibold">Name</TableHead><TableHead className="font-semibold">Email</TableHead><TableHead className="font-semibold">Role</TableHead><TableHead className="font-semibold">Joined</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground">Loading...</TableCell></TableRow>
              : (users ?? []).map((u: any) => {
                const rb = roleBadge[u.role] ?? roleBadge.rep;
                return (
                  <TableRow key={u.id} className="table-row-hover">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50">
                          <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="font-medium">{u.name ?? '—'}</span>
                      </div>
                    </TableCell>
                    <TableCell><span suppressHydrationWarning className="text-muted-foreground">{u.email}</span></TableCell>
                    <TableCell><Badge variant={rb.variant} className={`capitalize ${rb.className}`}>{u.role}</Badge></TableCell>
                    <TableCell><SafeDate date={u.createdAt} options={{ dateStyle: 'short' }} className="text-muted-foreground" /></TableCell>
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
