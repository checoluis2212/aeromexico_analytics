'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { InternalWorkspaceMenu } from '@/components/layout/internal-workspace-menu';
import { siteConfig } from '@/lib/constants';

export function InternalSidebar() {
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
            <p className="text-sm font-semibold tracking-tight truncate">Operación</p>
            <p className="text-[10px] text-muted-foreground truncate">{siteConfig.author}</p>
          </div>
        )}
      </div>

      <div className={cn('flex-1 py-3 overflow-y-auto', collapsed ? 'px-1' : 'px-2')}>
        <InternalWorkspaceMenu />
      </div>

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
