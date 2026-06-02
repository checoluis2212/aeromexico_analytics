'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, PlusCircle, BarChart3, Columns3, MessageCircle, Inbox,
  LayoutGrid, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ACC_NAV_PRIMARY } from '@/types/command-center';
import { siteConfig } from '@/lib/constants';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const iconMap: Record<string, React.ReactNode> = {
  Home: <Home className="h-[18px] w-[18px]" strokeWidth={1.75} />,
  PlusCircle: <PlusCircle className="h-[18px] w-[18px]" strokeWidth={1.75} />,
  BarChart3: <BarChart3 className="h-[18px] w-[18px]" strokeWidth={1.75} />,
  Columns3: <Columns3 className="h-[18px] w-[18px]" strokeWidth={1.75} />,
  MessageCircle: <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.75} />,
  Inbox: <Inbox className="h-[18px] w-[18px]" strokeWidth={1.75} />,
};

export function CommandCenterSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isResourcesActive = pathname.startsWith('/command-center/resources') ||
    ['/events', '/dictionary', '/knowledge', '/maturity', '/value', '/workspace']
      .some((p) => pathname.includes(p));

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border/40 bg-card/20 transition-all duration-200 h-screen sticky top-0',
        collapsed ? 'w-[52px]' : 'w-[188px]'
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-3 h-14 border-b border-border/40">
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold tracking-tight truncate">{siteConfig.author}</p>
            <p className="text-[11px] text-muted-foreground truncate">{siteConfig.role}</p>
          </div>
        )}
      </div>

      {/* CTA */}
      {!collapsed && (
        <div className="px-2 pt-3">
          <Link
            href="/command-center/requests"
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary text-primary-foreground text-sm font-medium py-2 hover:bg-primary/90 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            Pedir a Sergio
          </Link>
        </div>
      )}

      {/* Primary nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {ACC_NAV_PRIMARY.filter((item) => item.href !== '/command-center/requests').map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
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
              <span className="shrink-0">{iconMap[item.icon]}</span>
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
          </div>
        )}
      </nav>

      {/* Collapse */}
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
