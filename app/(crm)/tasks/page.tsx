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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, Clock, Circle, CheckCircle2 } from 'lucide-react';
import { SafeDate } from '@/components/safe-format';

const priorityConfig: Record<string, { bg: string; text: string; dot: string }> = {
  low: { bg: 'bg-slate-50 dark:bg-slate-900/50', text: 'text-slate-700 dark:text-slate-300', dot: 'bg-slate-400' },
  medium: { bg: 'bg-blue-50 dark:bg-blue-950/50', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
  high: { bg: 'bg-amber-50 dark:bg-amber-950/50', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
  urgent: { bg: 'bg-red-50 dark:bg-red-950/50', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '' });

  const fetchTasks = useCallback(async () => {
    try { const r = await fetch('/api/tasks'); const d = await r.json(); setTasks(Array.isArray(d) ? d : []); }
    catch { toast.error('Failed'); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleCreate = async () => {
    if (!form.title) { toast.error('Title required'); return; }
    try {
      const payload: any = { title: form.title, description: form.description, priority: form.priority };
      if (form.dueDate) payload.dueDate = new Date(form.dueDate).toISOString();
      const res = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { toast.success('Task created'); setOpen(false); setForm({ title: '', description: '', priority: 'medium', dueDate: '' }); fetchTasks(); }
    } catch { toast.error('Error'); }
  };

  const toggleComplete = async (task: any) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await fetch(`/api/tasks/${task.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
      fetchTasks();
    } catch { toast.error('Failed'); }
  };

  const pending = (tasks ?? []).filter((t: any) => t.status !== 'completed');
  const completed = (tasks ?? []).filter((t: any) => t.status === 'completed');

  return (
    <div className="space-y-6">
      <PageHeader title="Tasks" description="Manage tasks and follow-ups" actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md shadow-blue-500/15"><Plus className="h-4 w-4 mr-2" />New Task</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Task</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Title *</Label><Input value={form.title} onChange={(e: any) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Description</Label><Input value={form.description} onChange={(e: any) => setForm({ ...form, description: e.target.value })} /></div>
              <div><Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v: string) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['low', 'medium', 'high', 'urgent'].map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={(e: any) => setForm({ ...form, dueDate: e.target.value })} /></div>
              <Button onClick={handleCreate} className="w-full">Create Task</Button>
            </div>
          </DialogContent>
        </Dialog>
      } />

      {loading ? <div className="text-center py-12 text-muted-foreground">Loading...</div> : (
        <>
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <Circle className="h-4 w-4 text-blue-500" />
              <h3 className="font-semibold text-sm">Pending <span className="text-muted-foreground font-normal">({pending.length})</span></h3>
            </div>
            {pending.map((task: any) => {
              const pc = priorityConfig[task.priority] ?? priorityConfig.medium;
              return (
                <Card key={task.id} className="card-hover">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <Checkbox checked={false} onCheckedChange={() => toggleComplete(task)} className="mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{task.title}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${pc.bg} ${pc.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${pc.dot}`} />
                            {task.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
                          {task.assignee?.name && <span>Assigned to {task.assignee.name}</span>}
                          {task.dueDate && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /><SafeDate date={task.dueDate} options={{ dateStyle: 'short' }} /></span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {completed.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <h3 className="font-semibold text-sm">Completed <span className="text-muted-foreground font-normal">({completed.length})</span></h3>
              </div>
              {completed.map((task: any) => (
                <Card key={task.id} className="opacity-50 hover:opacity-70 transition-opacity">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <Checkbox checked={true} onCheckedChange={() => toggleComplete(task)} className="mt-0.5" />
                      <span className="line-through text-muted-foreground text-sm">{task.title}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
