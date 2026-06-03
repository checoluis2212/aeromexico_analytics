'use client';

import Link from 'next/link';
import { NotificationBell } from '@/components/command-center/notification-bell';
import { AuthButton } from '@/components/auth/auth-button';
import { InternalWorkspaceMenu } from '@/components/layout/internal-workspace-menu';
import { Button, buttonVariants } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { APP_ROLE_LABELS } from '@/lib/auth/access';
import { siteConfig } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Menu, Radar, PlusCircle } from 'lucide-react';
import { useCommandCenterRole } from '@/components/command-center/command-center-context';

export function CommandCenterTopChrome() {
  const appRole = useCommandCenterRole();
  const isSergio = appRole === 'sergio_admin';

  return (
    <header className="app-chrome-header top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-4 px-4 sm:px-5">
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

      <div className="flex items-center gap-2 shrink-0 ml-auto">
        {!isSergio && (
          <Button size="sm" variant="outline" className="h-8 text-xs" asChild>
            <Link href="/pedir">
              <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
              Pedir a Sergio
            </Link>
          </Button>
        )}
        <div className="hidden md:flex items-center gap-2">
          <NotificationBell />
          <AuthButton />
        </div>
        <div className="flex md:hidden items-center gap-2">
          <NotificationBell />
          <Sheet>
            <SheetTrigger
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-8 w-8')}
            >
              <Menu className="h-4 w-4" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-background/95 backdrop-blur-xl">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-6 mb-2">
                Menú
              </p>
              <InternalWorkspaceMenu />
            </SheetContent>
          </Sheet>
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
