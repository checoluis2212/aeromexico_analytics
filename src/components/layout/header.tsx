'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  siteConfig,
  navPrimary,
  navResources,
  clientNavPrimary,
  clientNavResources,
} from '@/lib/constants';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, Radar, ChevronDown, Sparkles } from 'lucide-react';
import { AuthButton } from '@/components/auth/auth-button';
import { NotificationBell } from '@/components/command-center/notification-bell';
import { InternalWorkspaceMenu } from '@/components/layout/internal-workspace-menu';
import { useAppRole } from '@/hooks/use-app-role';
import { APP_ROLE_LABELS } from '@/lib/auth/access';
import type { SiteChromeBootstrap } from '@/lib/navigation/site-chrome-server';
import { pedirHubHref } from '@/lib/ai/assistant-modes';
import { guestEntryHref } from '@/lib/access-requests/guest-entry';
import { useTrackEvent } from '@/components/analytics/analytics-context';
import { isClientNavItemActive } from '@/lib/navigation/client-nav';
import { cn } from '@/lib/utils';

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'px-3 py-1.5 text-[13px] rounded-md transition-colors',
        active
          ? 'text-foreground font-medium bg-secondary/60'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
      )}
    >
      {label}
    </Link>
  );
}

interface HeaderProps {
  /** Cliente autenticado en Mis pedidos / Pedir / Perfil — header compacto + sidebar */
  clientWorkspace?: boolean;
  /** Sergio / stakeholders en sitio con sidebar de operación */
  internalWorkspace?: boolean;
  bootstrap?: SiteChromeBootstrap;
}

export function Header({
  clientWorkspace = false,
  internalWorkspace = false,
  bootstrap,
}: HeaderProps) {
  const pathname = usePathname();
  const { isSergioAdmin, appRole, isAuthenticated, loading: roleLoading } = useAppRole();
  const track = useTrackEvent();

  function trackNav(linkId: string, destination: string, navZone: 'header' | 'footer' | 'hero' = 'header') {
    track('nav_click', { link_id: linkId, destination, nav_zone: navZone });
  }

  const resolvedRole = roleLoading && bootstrap?.appRole ? bootstrap.appRole : appRole;
  const resolvedSergio = resolvedRole === 'sergio_admin';
  const resolvedAuth = roleLoading && bootstrap ? bootstrap.isAuthenticated : isAuthenticated;
  const resourcesActive = navResources.some((r) => pathname.startsWith(r.href));
  const isClientUser = resolvedAuth && resolvedRole === 'client';
  const showInternalCcLink =
    (roleLoading ? bootstrap?.isAuthenticated : isAuthenticated) &&
    (roleLoading ? bootstrap?.appRole !== 'client' : appRole !== 'client');

  const primaryActionHref = resolvedSergio
    ? '/command-center/admin'
    : resolvedAuth
      ? pedirHubHref()
      : guestEntryHref('pedir');

  const primaryActionLabel = resolvedSergio ? 'Panel Sergio' : 'Pedir con IA';

  if (internalWorkspace) {
    return (
      <header className="app-chrome-header top-0 z-50 shrink-0">
        <div className="mx-auto flex h-14 w-full min-w-0 max-w-none items-center justify-between gap-4 px-4 sm:px-5">
          <Link
            href={resolvedSergio ? '/command-center/admin' : '/command-center/executive'}
            className="flex items-center gap-2 min-w-0 shrink-0 group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
              <Radar className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 hidden sm:block">
              <p className="text-sm font-semibold truncate">
                {resolvedSergio ? `Panel ${siteConfig.author}` : 'Centro Analytics'}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {resolvedRole ? APP_ROLE_LABELS[resolvedRole] : '…'}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 shrink-0 ml-auto">
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
                    Operación
                  </p>
                  <InternalWorkspaceMenu />
                </SheetContent>
              </Sheet>
              <AuthButton />
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="app-chrome-header top-0 z-50 shrink-0">
      <div
        className={cn(
          'mx-auto flex h-14 w-full min-w-0 items-center justify-between gap-4 px-4 sm:px-6',
          clientWorkspace || internalWorkspace ? 'max-w-none' : 'max-w-6xl'
        )}
      >
        <Link href={isClientUser ? '/mis-pedidos' : '/'} className="flex items-center gap-2 shrink-0 group">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 ring-1 ring-primary/20 group-hover:ring-primary/40 transition-all">
            <Radar className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="min-w-0 hidden sm:block">
            <span className="text-sm font-semibold tracking-tight">{siteConfig.name}</span>
            {clientWorkspace ? (
              <p className="text-[10px] text-muted-foreground truncate -mt-0.5">Portal de pedidos</p>
            ) : (
              <span className="text-[10px] text-muted-foreground hidden lg:inline -ml-1">
                · {siteConfig.role}
              </span>
            )}
          </div>
        </Link>

        {!clientWorkspace && (
          <nav className="hidden md:flex items-center gap-0.5">
            {navPrimary.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                active={item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)}
              />
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 text-[13px] rounded-md outline-none transition-colors',
                  resourcesActive
                    ? 'text-foreground font-medium bg-secondary/60'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                )}
              >
                Recursos
                <ChevronDown className="h-3 w-3 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 p-1.5 bg-popover/95 backdrop-blur-xl border-border/50">
                {navResources.map((item) => (
                  <DropdownMenuItem key={item.href} className="p-0 focus:bg-transparent">
                    <Link
                      href={item.href}
                      className="flex flex-col w-full rounded-md px-2.5 py-2 hover:bg-secondary/60 transition-colors"
                    >
                      <span className="text-sm flex items-center gap-2">
                        {item.label}
                        {'badge' in item && item.badge && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-primary/30 text-primary">
                            {item.badge}
                          </Badge>
                        )}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{item.hint}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        )}

        <div className="hidden md:flex items-center gap-2 shrink-0">
          {showInternalCcLink && (
            <Button variant="ghost" size="sm" asChild className="text-[13px] h-8 text-muted-foreground">
              <Link href="/command-center">Centro Analytics</Link>
            </Button>
          )}
          {!clientWorkspace && !resolvedSergio && (
            <Button variant="ghost" size="sm" asChild className="text-[13px] h-8 text-muted-foreground">
              <Link
                href={resolvedAuth ? '/mis-pedidos' : guestEntryHref()}
                onClick={() =>
                  trackNav('mis_pedidos', resolvedAuth ? '/mis-pedidos' : guestEntryHref())
                }
              >
                Mis pedidos
              </Link>
            </Button>
          )}
          {!clientWorkspace && (
            <Button size="sm" asChild className="h-8 text-[13px] bg-primary text-primary-foreground hover:bg-primary/90 glow-aero gap-1.5">
              <Link
                href={primaryActionHref}
                onClick={() => trackNav('pedir_ia', primaryActionHref)}
              >
                {!resolvedSergio && <Sparkles className="h-3.5 w-3.5" />}
                {primaryActionLabel}
              </Link>
            </Button>
          )}
          <NotificationBell />
          <AuthButton />
        </div>

        <div className="flex md:hidden items-center gap-2">
          {!clientWorkspace && (
            <Button size="sm" asChild className="h-8 text-xs gap-1">
              <Link href={primaryActionHref}>
                {!resolvedSergio && <Sparkles className="h-3 w-3" />}
                {resolvedSergio ? 'Panel' : 'Pedir IA'}
              </Link>
            </Button>
          )}
          <Sheet>
            <SheetTrigger
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-8 w-8')}
            >
              <Menu className="h-4 w-4" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-background/95 backdrop-blur-xl">
              {isClientUser || clientWorkspace ? (
                <>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-6 mb-2">
                    Portal de pedidos
                  </p>
                  <nav className="flex flex-col gap-0.5">
                    {clientNavPrimary.map((item) => {
                      const active = isClientNavItemActive(pathname, item);
                      return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2.5 text-sm rounded-md transition-colors',
                          active
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'hover:bg-secondary/60',
                          'featured' in item && item.featured && !active
                            ? 'border border-primary/20 bg-primary/[0.04]'
                            : ''
                        )}
                      >
                        <span className="flex-1">{item.label}</span>
                        {'badge' in item && item.badge && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-primary/30 text-primary">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    );
                    })}
                  </nav>
                  <div className="my-4 h-px bg-border/50" />
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Recursos
                  </p>
                  <nav className="flex flex-col gap-0.5">
                    {clientNavResources.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="px-3 py-2 text-sm rounded-md hover:bg-secondary/60 transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                  <div className="my-4 h-px bg-border/50" />
                  <Link href="/" className="block px-3 py-2 text-sm text-muted-foreground">
                    Inicio del sitio →
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-6 mb-2">
                    Menú
                  </p>
                  <nav className="flex flex-col gap-0.5">
                    {navPrimary.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="px-3 py-2.5 text-sm rounded-md hover:bg-secondary/60 transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                  <div className="my-4 h-px bg-border/50" />
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Recursos
                  </p>
                  <nav className="flex flex-col gap-0.5">
                    {navResources.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="px-3 py-2 text-sm rounded-md hover:bg-secondary/60 transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                  {!resolvedSergio && (
                    <>
                      <div className="my-4 h-px bg-border/50" />
                      <Link
                        href={primaryActionHref}
                        className="flex items-center gap-2 px-3 py-2.5 text-sm rounded-md bg-primary/10 text-primary font-medium"
                      >
                        <Sparkles className="h-4 w-4" />
                        Pedir con IA
                      </Link>
                    </>
                  )}
                  {showInternalCcLink && (
                    <>
                      <div className="my-4 h-px bg-border/50" />
                      <Link href="/command-center" className="block px-3 py-2 text-sm text-primary">
                        Centro Analytics →
                      </Link>
                    </>
                  )}
                </>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
