'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard, Users, Building2, Contact, Target, Briefcase, FileText,
  ClipboardList, Activity, CheckSquare, BarChart3, Settings, LogOut,
  ChevronLeft, ChevronRight, TrendingUp, Menu, X, Zap
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'rep'] },
  { href: '/leads', label: 'Leads', icon: Target, roles: ['admin', 'manager', 'rep'] },
  { href: '/accounts', label: 'Accounts', icon: Building2, roles: ['admin', 'manager', 'rep'] },
  { href: '/contacts', label: 'Contacts', icon: Contact, roles: ['admin', 'manager', 'rep'] },
  { href: '/deals', label: 'Deals', icon: Briefcase, roles: ['admin', 'manager', 'rep'] },
  { href: '/pipeline', label: 'Pipeline', icon: TrendingUp, roles: ['admin', 'manager', 'rep'] },
  { href: '/quotes', label: 'Quotes', icon: FileText, roles: ['admin', 'manager', 'rep'] },
  { href: '/contracts', label: 'Contracts', icon: ClipboardList, roles: ['admin', 'manager', 'rep'] },
  { href: '/activities', label: 'Activities', icon: Activity, roles: ['admin', 'manager', 'rep'] },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare, roles: ['admin', 'manager', 'rep'] },
  { href: '/reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'manager'] },
  { href: '/admin', label: 'Admin', icon: Settings, roles: ['admin'] },
];

function UserAvatar({ name, collapsed }: { name: string; collapsed: boolean }) {
  const initials = (name ?? 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className={cn(
      'flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white font-semibold shrink-0',
      collapsed ? 'h-8 w-8 text-xs' : 'h-9 w-9 text-sm'
    )}>
      {initials}
    </div>
  );
}

export function CRMSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = (session?.user as any)?.role ?? 'rep';
  const workspaceName = (session?.user as any)?.workspaceName ?? 'Workspace';
  const userName = session?.user?.name ?? 'User';

  const filteredNav = navItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-3 left-3 z-50 md:hidden p-2 rounded-lg bg-card shadow-lg border border-border"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-full sidebar-gradient flex flex-col transition-all duration-300 shadow-xl',
          collapsed ? 'w-[68px]' : 'w-[260px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Header */}
        <div className={cn(
          'flex items-center h-16 px-4 border-b border-white/10',
          collapsed ? 'justify-center' : 'justify-between'
        )}>
          {!collapsed && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-display font-bold text-sm text-white tracking-tight">Sales CRM</span>
                <span className="text-[11px] text-blue-200/60 truncate">{workspaceName}</span>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
          )}
          <button
            className="hidden md:flex p-1.5 rounded-lg hover:bg-white/10 text-blue-200/60 transition-colors"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-0.5">
          {filteredNav.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200',
                  active
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-blue-100/60 hover:bg-white/8 hover:text-white'
                )}
              >
                <item.icon className={cn(
                  'h-[18px] w-[18px] shrink-0 transition-colors',
                  active ? 'text-blue-300' : 'text-blue-200/40 group-hover:text-blue-200/70'
                )} />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {active && !collapsed && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400 shadow-sm shadow-blue-400/50" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-3">
          {!collapsed && session?.user && (
            <div className="flex items-center gap-3 px-2 py-2 mb-2 rounded-lg bg-white/5">
              <UserAvatar name={userName} collapsed={false} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{userName}</p>
                <p className="text-[11px] text-blue-200/50 truncate">{session.user.email}</p>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-medium capitalize">{role}</span>
            </div>
          )}
          {collapsed && session?.user && (
            <div className="flex justify-center mb-2">
              <UserAvatar name={userName} collapsed={true} />
            </div>
          )}
          <Button
            variant="ghost"
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-blue-100/50 hover:bg-white/8 hover:text-white transition-colors',
              collapsed && 'justify-center'
            )}
            onClick={() => signOut({ redirectTo: '/login' })}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && 'Sign Out'}
          </Button>
        </div>
      </aside>
    </>
  );
}
