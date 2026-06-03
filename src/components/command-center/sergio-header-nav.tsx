'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SERGIO_HEADER_NAV } from '@/lib/command-center/nav';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};

/** Enlaces de operación en la barra superior — visibles en desktop para Sergio */
export function SergioHeaderNav({ className }: Props) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'hidden lg:flex items-center gap-0.5 min-w-0 flex-1 justify-center px-2 overflow-x-auto',
        className
      )}
      aria-label="Operación Sergio"
    >
      {SERGIO_HEADER_NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.hint}
            className={cn(
              'shrink-0 px-2.5 py-1.5 text-[12px] rounded-md whitespace-nowrap transition-colors',
              active
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
