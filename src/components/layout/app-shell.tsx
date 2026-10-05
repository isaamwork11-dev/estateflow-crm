'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Kanban,
  Users,
  Building2,
  CalendarCheck,
  Briefcase,
  BarChart3,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pipeline', label: 'Pipeline', icon: Kanban },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/properties', label: 'Properties', icon: Building2 },
  { href: '/site-visits', label: 'Site Visits', icon: CalendarCheck },
  { href: '/deals', label: 'Deals', icon: Briefcase },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function AppShell({ children, userName }: { children: React.ReactNode; userName: string }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-foreground">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col border-r border-teal-100 bg-white md:flex">
          <div className="border-b border-teal-50 px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">EstateFlow</p>
            <p className="text-sm text-muted-foreground">Property business CRM</p>
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                    active ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-teal-50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t p-4">
            <p className="mb-2 truncate text-sm font-medium">{userName}</p>
            <Button variant="outline" size="sm" className="w-full" onClick={() => signOut({ callbackUrl: '/login' })}>
              Logout
            </Button>
          </div>
        </aside>
        <main className="flex-1">
          <div className="border-b bg-white px-4 py-3 md:hidden">
            <p className="font-semibold text-teal-800">EstateFlow</p>
          </div>
          <div className="mx-auto max-w-6xl p-4 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
