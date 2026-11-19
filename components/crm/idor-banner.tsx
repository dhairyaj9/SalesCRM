'use client';

import { AlertTriangle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export function IdorBanner() {
  const { data: session } = useSession();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!(session?.user as any)?.workspaceId) return;
    fetch('/api/admin/idor-status')
      .then((r) => r.json())
      .then((d) => setEnabled(d?.enabled === true))
      .catch(() => {});
  }, [session]);

  if (!enabled) return null;

  return (
    <div className="bg-gradient-to-r from-red-500/10 via-red-500/5 to-orange-500/10 border-b border-red-500/20 px-5 py-2.5 flex items-center gap-3 text-sm">
      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-red-500/15">
        <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
      </div>
      <span className="font-semibold text-red-600 dark:text-red-400">Security Testing Mode:</span>
      <span className="text-red-600/80 dark:text-red-400/80">IDOR vulnerability is active — workspace isolation is bypassed</span>
    </div>
  );
}
