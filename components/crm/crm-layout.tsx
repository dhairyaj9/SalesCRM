'use client';

import { CRMSidebar } from './sidebar';
import { IdorBanner } from './idor-banner';

export function CRMLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <CRMSidebar />
      <div className="md:ml-[260px] flex flex-col min-h-screen transition-all duration-300">
        <IdorBanner />
        <main className="flex-1 p-5 md:p-8 pt-16 md:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}
