import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, badge, className, children }: PageHeaderProps) {
  return (
    <div className={cn('relative border-b border-border/40 overflow-hidden', className)}>
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-16">
        {badge && (
          <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary/8 px-2.5 py-0.5 text-[11px] font-medium text-primary mb-3">
            {badge}
          </span>
        )}
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-3 text-base text-muted-foreground max-w-xl leading-relaxed">{description}</p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}
