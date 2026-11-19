'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/layouts/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Phone, Mail, Users, FileText, CheckSquare } from 'lucide-react';
import { SafeDate } from '@/components/safe-format';

const typeIcons: Record<string, any> = { call: Phone, email: Mail, meeting: Users, note: FileText, task: CheckSquare };
const typeStyles: Record<string, { bg: string; text: string }> = {
  call: { bg: 'bg-blue-50 dark:bg-blue-950/50', text: 'text-blue-600 dark:text-blue-400' },
  email: { bg: 'bg-emerald-50 dark:bg-emerald-950/50', text: 'text-emerald-600 dark:text-emerald-400' },
  meeting: { bg: 'bg-violet-50 dark:bg-violet-950/50', text: 'text-violet-600 dark:text-violet-400' },
  note: { bg: 'bg-amber-50 dark:bg-amber-950/50', text: 'text-amber-600 dark:text-amber-400' },
  task: { bg: 'bg-orange-50 dark:bg-orange-950/50', text: 'text-orange-600 dark:text-orange-400' },
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: 'call', subject: '', description: '' });

  const fetchActivities = useCallback(async () => {
    try {
      const url = filter ? `/api/activities?type=${filter}` : '/api/activities';
      const r = await fetch(url); const d = await r.json(); setActivities(Array.isArray(d) ? d : []);
    } catch { toast.error('Failed'); } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  const handleCreate = async () => {
    if (!form.subject) { toast.error('Subject required'); return; }
    try {
      const res = await fetch('/api/activities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { toast.success('Activity logged'); setOpen(false); setForm({ type: 'call', subject: '', description: '' }); fetchActivities(); }
    } catch { toast.error('Error'); }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Activities" description="Track all sales activities and interactions" actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md shadow-blue-500/15"><Plus className="h-4 w-4 mr-2" />Log Activity</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Log Activity</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Type</Label>
                <Select value={form.type} onValueChange={(v: string) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['call', 'email', 'meeting', 'note', 'task'].map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Subject *</Label><Input value={form.subject} onChange={(e: any) => setForm({ ...form, subject: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e: any) => setForm({ ...form, description: e.target.value })} /></div>
              <Button onClick={handleCreate} className="w-full">Log Activity</Button>
            </div>
          </DialogContent>
        </Dialog>
      } />

      <div className="flex gap-2 flex-wrap">
        <Button variant={!filter ? 'default' : 'outline'} size="sm" onClick={() => setFilter('')} className={!filter ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-sm' : ''}>All</Button>
        {['call', 'email', 'meeting', 'note', 'task'].map((t) => (
          <Button key={t} variant={filter === t ? 'default' : 'outline'} size="sm" onClick={() => setFilter(t)} className={`capitalize ${filter === t ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-sm' : ''}`}>{t}</Button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? <div className="text-center py-12 text-muted-foreground">Loading...</div>
        : (activities ?? []).length === 0 ? <div className="text-center py-12 text-muted-foreground">No activities found</div>
        : (activities ?? []).map((a: any) => {
          const Icon = typeIcons[a.type] ?? FileText;
          const style = typeStyles[a.type] ?? { bg: 'bg-muted', text: 'text-muted-foreground' };
          return (
            <Card key={a.id} className="card-hover">
              <CardContent className="pt-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl ${style.bg}`}><Icon className={`h-4 w-4 ${style.text}`} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{a.subject}</span>
                      <Badge variant="outline" className="capitalize text-xs font-normal">{a.type}</Badge>
                    </div>
                    {a.description && <p className="text-sm text-muted-foreground leading-relaxed">{a.description}</p>}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {a.user?.name && <span className="font-medium">By {a.user.name}</span>}
                      {a.company?.name && <span>· {a.company.name}</span>}
                      {a.deal?.title && <span>· {a.deal.title}</span>}
                      <SafeDate date={a.date} options={{ dateStyle: 'medium' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
