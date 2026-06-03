'use client';

import { commandCenterContentClass } from '@/lib/layout/command-center';
import { cn } from '@/lib/utils';

interface TopBarProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function CommandCenterTopBar({ title, subtitle, className }: TopBarProps) {
  return (
    <header className="app-chrome-header shrink-0 border-b border-border/40">
      <div
        className={cn(
          commandCenterContentClass,
          'flex min-h-14 flex-col justify-center py-4 sm:py-5',
          className
        )}
      >
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-3xl">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}
