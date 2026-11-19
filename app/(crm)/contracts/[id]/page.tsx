'use client';

import { useEffect, useState, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layouts/page-header';
import { toast } from 'sonner';
import { SafeDate, SafeNumber } from '@/components/safe-format';
import { FileText, Building2, Calendar, DollarSign, Shield } from 'lucide-react';

export default function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/contracts/${id}`).then((r) => r.json()).then(setContract).catch(() => toast.error('Failed')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  if (!contract || contract?.error) return <div className="flex items-center justify-center h-64 text-muted-foreground">Contract not found</div>;

  return (
    <div className="space-y-6">
      <PageHeader title={contract.title ?? 'Contract'} description={`Status: ${(contract.status ?? '').replace('_', ' ')}`} />
      {contract.confidential && <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2 text-sm text-destructive"><Shield className="h-4 w-4" />This contract is marked as confidential</div>}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 flex items-center gap-3"><DollarSign className="h-5 w-5 text-primary" /><div><div className="text-xs text-muted-foreground">Value</div><div className="text-xl font-bold font-mono"><SafeNumber value={contract.value ?? 0} currency="USD" /></div></div></CardContent></Card>
        <Card><CardContent className="pt-4 flex items-center gap-3"><Building2 className="h-5 w-5 text-primary" /><div><div className="text-xs text-muted-foreground">Company</div><div>{contract.company?.name ?? 'N/A'}</div></div></CardContent></Card>
        <Card><CardContent className="pt-4 flex items-center gap-3"><Calendar className="h-5 w-5 text-primary" /><div><div className="text-xs text-muted-foreground">Start</div>{contract.startDate ? <SafeDate date={contract.startDate} options={{ dateStyle: 'medium' }} /> : 'N/A'}</div></CardContent></Card>
        <Card><CardContent className="pt-4 flex items-center gap-3"><Calendar className="h-5 w-5 text-primary" /><div><div className="text-xs text-muted-foreground">End</div>{contract.endDate ? <SafeDate date={contract.endDate} options={{ dateStyle: 'medium' }} /> : 'N/A'}</div></CardContent></Card>
      </div>
      {contract.parties && <Card><CardHeader><CardTitle className="text-base">Parties</CardTitle></CardHeader><CardContent><p className="text-sm">{contract.parties}</p></CardContent></Card>}
      {contract.terms && <Card><CardHeader><CardTitle className="text-base">Terms & Conditions</CardTitle></CardHeader><CardContent><p className="text-sm whitespace-pre-wrap">{contract.terms}</p></CardContent></Card>}
    </div>
  );
}
