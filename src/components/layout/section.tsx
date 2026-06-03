import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SectionProps {
  title?: string;
  description?: string;
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
  id?: string;
}

export function Section({
  title,
  description,
  className,
  containerClassName,
  children,
  id,
}: SectionProps) {
  return (
    <section id={id} className={cn('py-16 sm:py-24', className)}>
      <div className={cn('mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', containerClassName)}>
        {(title || description) && (
          <div className="mb-12 max-w-2xl">
            {title && <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h2>}
            {description && <p className="mt-3 text-muted-foreground leading-relaxed">{description}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
}

export function FeatureCard({ title, description, icon, className }: FeatureCardProps) {
  return (
    <Card className={cn(
      'glass-card premium-border h-full transition-all duration-300 group',
      'hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5',
      className
    )}>
      <CardHeader>
        {icon && (
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
            {icon}
          </div>
        )}
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
