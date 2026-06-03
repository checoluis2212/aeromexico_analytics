'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  SERGIO_NAV,
  SERGIO_NAV_SECTIONS,
  getSergioFooterNav,
  getStakeholderNav,
  getStakeholderFooterNav,
} from '@/lib/command-center/nav';
import { SergioNavSections } from '@/components/command-center/sergio-nav-sections';
import { navIcon } from '@/lib/command-center/nav-icons';
import { useCommandCenterRole, useAccRole } from '@/components/command-center/command-center-context';

export function InternalWorkspaceMenu({ className }: { className?: string }) {
  const pathname = usePathname();
  const appRole = useCommandCenterRole();
  const accRole = useAccRole();
  const isSergio = appRole === 'sergio_admin';

  const nav = isSergio ? SERGIO_NAV : getStakeholderNav(accRole);
  const footerNav = isSergio ? getSergioFooterNav() : getStakeholderFooterNav(accRole);

  return (
    <nav className={cn('flex flex-col gap-0.5', className)}>
      {isSergio ? (
        <SergioNavSections
          sections={SERGIO_NAV_SECTIONS}
          linkClassName="px-3"
          activeLinkClassName="bg-primary/10 text-primary font-medium"
          inactiveLinkClassName="hover:bg-secondary/60 text-foreground"
        />
      ) : (
        nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-3 py-2.5 text-sm rounded-md transition-colors',
                active ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-secondary/60'
              )}
            >
              {item.label}
              <span className="block text-[11px] text-muted-foreground font-normal">{item.hint}</span>
            </Link>
          );
        })
      )}
      {footerNav.length > 0 && (
        <>
          <div className="my-3 h-px bg-border/50" />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Más
          </p>
          {footerNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-colors',
                  active ? 'bg-secondary/60 font-medium' : 'hover:bg-secondary/60 text-muted-foreground'
                )}
              >
                <span className="shrink-0">{navIcon(item.icon)}</span>
                {item.label}
              </Link>
            );
          })}
        </>
      )}
      <div className="my-3 h-px bg-border/50" />
      <Link href="/" className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
        Inicio del sitio →
      </Link>
    </nav>
  );
}
