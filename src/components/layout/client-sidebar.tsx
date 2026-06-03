'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Home,
  Inbox,
  PlusCircle,
  BookOpen,
  User,
  Sparkles,
  FolderArchive,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { clientNavPrimary, siteConfig } from '@/lib/constants';
import { isClientNavItemActive } from '@/lib/navigation/client-nav';
import { Button } from '@/components/ui/button';

const iconMap = {
  Inbox: Inbox,
  PlusCircle: PlusCircle,
  BookOpen: BookOpen,
  User: User,
  Sparkles: Sparkles,
  FolderArchive: FolderArchive,
} as const;

interface ClientSidebarProps {
  userLabel?: string | null;
}

export function ClientSidebar({ userLabel }: ClientSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col app-sidebar transition-all duration-200 sticky top-14 self-start shrink-0',
        collapsed ? 'w-[52px]' : 'w-[212px]',
        'h-[calc(100vh-3.5rem)]'
      )}
    >
      <div className="flex items-center gap-2.5 px-3 h-12 border-b border-border/40">
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold tracking-tight truncate">{siteConfig.author}</p>
            <p className="text-[10px] text-muted-foreground truncate">
              {userLabel ? userLabel : 'Portal de pedidos'}
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {clientNavPrimary.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap] ?? Inbox;
          const active = isClientNavItemActive(pathname, item);
          const featured = 'featured' in item && item.featured;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : item.hint}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-all',
                active
                  ? 'bg-primary/12 text-primary font-medium ring-1 ring-primary/20'
                  : featured
                    ? 'text-foreground bg-gradient-to-r from-primary/[0.08] to-transparent border border-primary/15 hover:border-primary/30 hover:bg-primary/[0.06]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              )}
            >
              <Icon
                className={cn(
                  'h-[18px] w-[18px] shrink-0',
                  featured && !active && 'text-primary'
                )}
                strokeWidth={1.75}
              />
              {!collapsed && (
                <>
                  <span className="truncate flex-1">{item.label}</span>
                  {'badge' in item && item.badge && (
                    <span className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide bg-primary/15 text-primary">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border/40 space-y-1">
        <Link
          href="/"
          title="Ir al inicio"
          className={cn(
            'flex items-center justify-center rounded-md h-8 text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary/40',
            !collapsed && 'justify-start gap-2.5 px-2.5'
          )}
        >
          <Home className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
          {!collapsed && <span className="text-[13px]">Sitio público</span>}
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
