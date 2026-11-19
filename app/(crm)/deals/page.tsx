'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layouts/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Search, LayoutGrid, List, ExternalLink, GripVertical } from 'lucide-react';
import { SafeNumber, SafeDate } from '@/components/safe-format';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Deal {
  id: string;
  title: string;
  value: number;
  probability: number;
  status: string;
  stageId: string | null;
  stage: { id: string; name: string; order: number } | null;
  owner: { id: string; name: string | null } | null;
  company: { id: string; name: string } | null;
  expectedCloseDate: string | null;
  createdAt: string;
}

const stageGradients: Record<string, string> = {
  'Prospecting': 'from-blue-500 to-blue-600',
  'Qualification': 'from-indigo-500 to-indigo-600',
  'Proposal': 'from-violet-500 to-purple-600',
  'Negotiation': 'from-amber-500 to-orange-600',
  'Closed Won': 'from-emerald-500 to-green-600',
  'Closed Lost': 'from-red-500 to-rose-600',
};

function SortableDealCard({ deal }: { deal: Deal }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: deal.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes} className="bg-card rounded-xl p-3.5 shadow-sm border border-border hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-start gap-2">
        <button {...listeners} className="mt-1 cursor-grab text-muted-foreground/40 hover:text-muted-foreground"><GripVertical className="h-3 w-3" /></button>
        <div className="flex-1 min-w-0">
          <Link href={`/deals/${deal.id}`} className="font-medium text-sm hover:text-primary truncate block transition-colors">{deal.title}</Link>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{deal.company?.name ?? 'No company'}</p>
          <div className="flex items-center justify-between mt-2.5">
            <span className="text-sm font-mono font-bold"><SafeNumber value={deal.value ?? 0} currency="USD" /></span>
            {deal.owner && (
              <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{deal.owner.name}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', value: '' });
  const [stages, setStages] = useState<any[]>([]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor));

  const fetchDeals = useCallback(async () => {
    try {
      const [dealsRes, pipelineRes] = await Promise.all([fetch('/api/deals'), fetch('/api/pipeline')]);
      const dealsData = await dealsRes.json();
      const pipelineData = await pipelineRes.json();
      setDeals(Array.isArray(dealsData) ? dealsData : []);
      setStages(pipelineData?.stages ?? []);
    } catch { toast.error('Failed to load deals'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  const handleCreate = async () => {
    if (!form.title) { toast.error('Title is required'); return; }
    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, value: parseFloat(form.value) || 0, stageId: stages[0]?.id }),
      });
      if (res.ok) { toast.success('Deal created'); setOpen(false); setForm({ title: '', value: '' }); fetchDeals(); }
    } catch { toast.error('Error'); }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const targetStageId = (over.id as string).startsWith('stage-') ? (over.id as string).replace('stage-', '') : null;
    if (targetStageId) {
      try {
        await fetch(`/api/deals/${active.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stageId: targetStageId }),
        });
        fetchDeals();
      } catch { toast.error('Failed to move deal'); }
    }
  };

  const filtered = (deals ?? []).filter((d: Deal) =>
    (d?.title ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (d?.company?.name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Deals" description="Manage your sales pipeline and deals" actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md shadow-blue-500/15"><Plus className="h-4 w-4 mr-2" />New Deal</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Deal</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Title *</Label><Input value={form.title} onChange={(e: any) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Value ($)</Label><Input type="number" value={form.value} onChange={(e: any) => setForm({ ...form, value: e.target.value })} /></div>
              <Button onClick={handleCreate} className="w-full">Create Deal</Button>
            </div>
          </DialogContent>
        </Dialog>
      } />

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search deals..." value={search} onChange={(e: any) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      <Tabs defaultValue="kanban">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="kanban" className="gap-1.5"><LayoutGrid className="h-4 w-4" />Kanban</TabsTrigger>
          <TabsTrigger value="list" className="gap-1.5"><List className="h-4 w-4" />List</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-4">
          {loading ? <div className="text-center py-12 text-muted-foreground">Loading...</div> : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {(stages ?? []).map((stage: any) => {
                  const stageDeals = filtered.filter((d: Deal) => d.stageId === stage.id);
                  const stageTotal = stageDeals.reduce((s: number, d: Deal) => s + (d.value ?? 0), 0);
                  const gradient = stageGradients[stage.name] ?? 'from-gray-500 to-gray-600';
                  return (
                    <div key={stage.id} id={`stage-${stage.id}`} className="flex-shrink-0 w-[280px] rounded-xl overflow-hidden bg-muted/20 border border-border/50">
                      <div className={`bg-gradient-to-r ${gradient} px-4 py-3`}>
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm text-white">{stage.name}</h3>
                          <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-white/20 text-[11px] font-bold text-white px-1.5">{stageDeals.length}</span>
                        </div>
                        <p className="text-xs text-white mt-0.5 font-mono font-semibold"><SafeNumber value={stageTotal} currency="USD" /></p>
                      </div>
                      <div className="p-2.5 space-y-2 min-h-[200px]">
                        <SortableContext items={stageDeals.map((d: Deal) => d.id)} strategy={verticalListSortingStrategy}>
                          {stageDeals.map((deal: Deal) => <SortableDealCard key={deal.id} deal={deal} />)}
                        </SortableContext>
                      </div>
                    </div>
                  );
                })}
              </div>
            </DndContext>
          )}
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <Card className="overflow-hidden"><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow className="bg-muted/30"><TableHead className="font-semibold">Deal</TableHead><TableHead className="font-semibold">Company</TableHead><TableHead className="font-semibold">Value</TableHead><TableHead className="font-semibold">Stage</TableHead><TableHead className="font-semibold">Owner</TableHead><TableHead className="font-semibold">Close Date</TableHead><TableHead className="font-semibold">Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {loading ? <TableRow><TableCell colSpan={8} className="text-center py-12">Loading...</TableCell></TableRow>
                : filtered.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">No deals found</TableCell></TableRow>
                : filtered.map((d: Deal) => (
                  <TableRow key={d.id} className="table-row-hover">
                    <TableCell className="font-medium">{d.title}</TableCell>
                    <TableCell className="text-muted-foreground">{d.company?.name ?? '—'}</TableCell>
                    <TableCell className="font-mono font-semibold"><SafeNumber value={d.value ?? 0} currency="USD" /></TableCell>
                    <TableCell><Badge variant="outline" className="font-normal">{d.stage?.name ?? '—'}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{d.owner?.name ?? '—'}</TableCell>
                    <TableCell>{d.expectedCloseDate ? <SafeDate date={d.expectedCloseDate} options={{ dateStyle: 'short' }} className="text-muted-foreground" /> : '—'}</TableCell>
                    <TableCell><Badge variant={d.status === 'won' ? 'default' : d.status === 'lost' ? 'destructive' : 'secondary'} className="capitalize">{d.status}</Badge></TableCell>
                    <TableCell><Link href={`/deals/${d.id}`}><Button variant="ghost" size="icon-sm" className="hover:bg-primary/10"><ExternalLink className="h-4 w-4" /></Button></Link></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
