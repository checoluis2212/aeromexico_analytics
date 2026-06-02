'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, BarChart3, Columns3, MessageCircle, Inbox, Zap,
  LayoutGrid, ChevronLeft, ChevronRight, Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SERGIO_NAV_PRIMARY, STAKEHOLDER_NAV_PRIMARY, ACC_NAV_RESOURCES } from '@/types/command-center';
import { siteConfig } from '@/lib/constants';
import { useCommandCenterRole } from '@/components/command-center/command-center-context';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const iconMap: Record<string, React.ReactNode> = {
  Home: <Home className="h-[18px] w-[18px]" strokeWidth={1.75} />,
  Inbox: <Inbox className="h-[18px] w-[18px]" strokeWidth={1.75} />,
  BarChart3: <BarChart3 className="h-[18px] w-[18px]" strokeWidth={1.75} />,
  Columns3: <Columns3 className="h-[18px] w-[18px]" strokeWidth={1.75} />,
  MessageCircle: <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.75} />,
  Zap: <Zap className="h-[18px] w-[18px]" strokeWidth={1.75} />,
};

export function CommandCenterSidebar() {
  const pathname = usePathname();
  const appRole = useCommandCenterRole();
  const isSergio = appRole === 'sergio_admin';
  const [collapsed, setCollapsed] = useState(false);

  const nav = isSergio ? SERGIO_NAV_PRIMARY : STAKEHOLDER_NAV_PRIMARY;

  const isResourcesActive = pathname.startsWith('/command-center/resources') ||
    ACC_NAV_RESOURCES.some((r) => pathname.startsWith(r.href));

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border/40 bg-card/20 transition-all duration-200 sticky top-14 self-start',
        collapsed ? 'w-[52px]' : 'w-[200px]',
        'h-[calc(100vh-3.5rem)]'
      )}
    >
      <div className="flex items-center gap-2.5 px-3 h-12 border-b border-border/40">
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold tracking-tight truncate">{siteConfig.author}</p>
            <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
              {isSergio ? (
                <>
                  <Shield className="h-3 w-3 text-primary" />
                  Admin analytics
                </>
              ) : (
                'Vista stakeholder'
              )}
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
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
              <span className="shrink-0">{iconMap[item.icon] ?? iconMap.Home}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}

        {!collapsed && (
          <div className="pt-4 mt-2 border-t border-border/30">
            <Link
              href="/command-center/resources"
              className={cn(
                'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors',
                isResourcesActive
                  ? 'bg-secondary/60 text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              )}
            >
              <LayoutGrid className="h-[18px] w-[18px]" strokeWidth={1.75} />
              <span>Más recursos</span>
            </Link>
            {!isSergio && (
              <Link
                href="/mis-pedidos"
                className="flex items-center gap-2.5 rounded-md px-2.5 py-2 mt-1 text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              >
                <Inbox className="h-[18px] w-[18px]" strokeWidth={1.75} />
                <span>Mis pedidos</span>
              </Link>
            )}
          </div>
        )}
      </nav>

      <div className="p-2 border-t border-border/40">
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
