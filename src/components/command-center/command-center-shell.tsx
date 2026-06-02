'use client';

import Link from 'next/link';
import { NotificationBell } from '@/components/command-center/notification-bell';
import { AuthButton } from '@/components/auth/auth-button';
import { Button } from '@/components/ui/button';
import { APP_ROLE_LABELS } from '@/lib/auth/access';
import { siteConfig } from '@/lib/constants';
import { Radar, PlusCircle } from 'lucide-react';
import { useCommandCenterRole } from '@/components/command-center/command-center-context';

export function CommandCenterTopChrome() {
  const appRole = useCommandCenterRole();
  const isSergio = appRole === 'sergio_admin';

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border/40 bg-background/80 backdrop-blur-xl px-4 sm:px-5">
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
          <Radar className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 hidden sm:block">
          <p className="text-sm font-semibold truncate">
            {isSergio ? `Panel ${siteConfig.author}` : 'Centro Analytics'}
          </p>
          <p className="text-[10px] text-muted-foreground truncate">
            {APP_ROLE_LABELS[appRole]}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {!isSergio && (
          <Button size="sm" variant="outline" className="h-8 text-xs" asChild>
            <Link href="/request-center">
              <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
              Pedir a Sergio
            </Link>
          </Button>
        )}
        {isSergio && (
          <Button size="sm" className="h-8 text-xs glow-aero" asChild>
            <Link href="/command-center/pedidos">Bandeja</Link>
          </Button>
        )}
        <NotificationBell />
        <AuthButton />
      </div>
    </header>
  );
}
