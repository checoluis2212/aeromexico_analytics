'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { siteConfig, navPrimary, navResources, hubNavItems } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, Radar, ChevronDown } from 'lucide-react';
import { AuthButton } from '@/components/auth/auth-button';
import { NotificationBell } from '@/components/command-center/notification-bell';
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

export function Header() {
  const pathname = usePathname();
  const resourcesActive = navResources.some((r) => pathname.startsWith(r.href));

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 ring-1 ring-primary/20 group-hover:ring-primary/40 transition-all">
            <Radar className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-sm font-semibold tracking-tight hidden sm:block">{siteConfig.name}</span>
          <span className="text-[10px] text-muted-foreground hidden lg:block -ml-1">· {siteConfig.role}</span>
        </Link>

        {/* Desktop nav */}
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

        {/* Actions */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" asChild className="text-[13px] h-8 text-muted-foreground">
            <Link href={hubNavItems[1].href}>Centro Analytics</Link>
          </Button>
          <Button size="sm" asChild className="h-8 text-[13px] bg-primary text-primary-foreground hover:bg-primary/90 glow-aero">
            <Link href="/request-center">Pedir a Sergio</Link>
          </Button>
          <NotificationBell />
          <AuthButton />
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-2">
          <Button size="sm" asChild className="h-8 text-xs">
            <Link href="/request-center">Pedir a Sergio</Link>
          </Button>
          <Sheet>
            <SheetTrigger>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-background/95 backdrop-blur-xl">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-6 mb-2">Menú</p>
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
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Recursos</p>
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
              <div className="my-4 h-px bg-border/50" />
              <Link href="/command-center/executive" className="block px-3 py-2 text-sm text-primary">
                Centro Analytics →
              </Link>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
