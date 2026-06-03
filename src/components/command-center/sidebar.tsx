'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SERGIO_NAV,
  SERGIO_NAV_SECTIONS,
  getSergioFooterNav,
  getStakeholderNav,
  getStakeholderFooterNav,
} from '@/lib/command-center/nav';
import { navIcon } from '@/lib/command-center/nav-icons';
import { SergioNavSections } from '@/components/command-center/sergio-nav-sections';
import { ACC_ROLES, type AccRole } from '@/types/command-center';
import { useCommandCenterRole, useAccRole } from '@/components/command-center/command-center-context';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

function stakeholderSubtitle(accRole: string | null): string {
  if (!accRole) return 'Consulta interna';
  const meta = ACC_ROLES[accRole as AccRole];
  return meta?.label ?? 'Consulta interna';
}

function NavFooterLinks({
  items,
  pathname,
  collapsed,
}: {
  items: { href: string; label: string; hint: string; icon: string }[];
  pathname: string;
  collapsed: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <div className={cn(!collapsed && 'pt-4 mt-2 border-t border-border/30 space-y-0.5')}>
      {!collapsed && (
        <p className="px-2.5 pb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Más
        </p>
      )}
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : item.hint}
            className={cn(
              'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors',
              active
                ? 'bg-secondary/60 text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
            )}
          >
            <span className="shrink-0">{navIcon(item.icon)}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </div>
  );
}

export function CommandCenterSidebar() {
  const pathname = usePathname();
  const appRole = useCommandCenterRole();
  const accRole = useAccRole();
  const isSergio = appRole === 'sergio_admin';
  const [collapsed, setCollapsed] = useState(false);

  const nav = isSergio ? SERGIO_NAV : getStakeholderNav(accRole);
  const footerNav = isSergio ? getSergioFooterNav() : getStakeholderFooterNav(accRole);

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col app-sidebar transition-all duration-200 sticky top-14 self-start',
        collapsed ? 'w-[52px]' : 'w-[200px]',
        'h-[calc(100vh-3.5rem)]'
      )}
    >
      <nav className="flex-1 py-3 px-2 overflow-y-auto">
        {isSergio ? (
          <>
            <SergioNavSections sections={SERGIO_NAV_SECTIONS} collapsed={collapsed} />
            <NavFooterLinks items={footerNav} pathname={pathname} collapsed={collapsed} />
          </>
        ) : (
          <>
            {!collapsed && (
              <p className="px-2.5 pb-2 text-[10px] text-muted-foreground">
                {stakeholderSubtitle(accRole)}
              </p>
            )}
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : item.hint}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors',
                    active
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                  )}
                >
                  <span className="shrink-0">{navIcon(item.icon)}</span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
            <NavFooterLinks items={footerNav} pathname={pathname} collapsed={collapsed} />
          </>
        )}
      </nav>

      <div className="p-2 border-t border-border/40 space-y-1 shrink-0">
        <Link
          href="/"
          title="Ir al inicio"
          className={cn(
            'flex items-center justify-center rounded-md h-8 text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary/40',
            !collapsed && 'justify-start gap-2.5 px-2.5'
          )}
        >
          <Home className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
          {!collapsed && <span className="text-[13px]">Inicio</span>}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="w-full h-8 text-muted-foreground"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </aside>
  );
}
