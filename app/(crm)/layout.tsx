import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { CRMLayout } from '@/components/crm/crm-layout';

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  return <CRMLayout>{children}</CRMLayout>;
}
