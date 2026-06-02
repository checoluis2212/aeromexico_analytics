'use client';

import { AuthButton } from '@/components/auth/auth-button';
import { NotificationBell } from '@/components/command-center/notification-bell';

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export function CommandCenterTopBar({ title, subtitle }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b border-border/40 bg-background/90 backdrop-blur-md px-5">
      <div className="min-w-0">
        <h1 className="text-base font-semibold tracking-tight truncate">{title}</h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <NotificationBell />
        <AuthButton />
      </div>
    </header>
  );
}
