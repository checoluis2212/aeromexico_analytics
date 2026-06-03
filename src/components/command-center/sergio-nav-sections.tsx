'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { navIcon } from '@/lib/command-center/nav-icons';
import type { CommandCenterNavSection } from '@/lib/command-center/nav';

type Props = {
  sections: CommandCenterNavSection[];
  collapsed?: boolean;
  linkClassName?: string;
  activeLinkClassName?: string;
  inactiveLinkClassName?: string;
};

export function SergioNavSections({
  sections,
  collapsed = false,
  linkClassName,
  activeLinkClassName = 'bg-primary/10 text-primary font-medium',
  inactiveLinkClassName = 'text-muted-foreground hover:text-foreground hover:bg-secondary/40',
}: Props) {
  const pathname = usePathname();

  return (
    <>
      {sections.map((section, sectionIndex) => (
        <div
          key={section.id}
          className={cn(sectionIndex > 0 && !collapsed && 'pt-3 mt-1 border-t border-border/30')}
        >
          {!collapsed && (
            <p className="px-2.5 pb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {section.label}
            </p>
          )}
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : item.hint}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors',
                    active ? activeLinkClassName : inactiveLinkClassName,
                    linkClassName
                  )}
                >
                  <span className="shrink-0">{navIcon(item.icon)}</span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
