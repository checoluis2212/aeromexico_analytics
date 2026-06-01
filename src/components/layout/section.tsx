import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SectionProps {
  title?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
  id?: string;
}

export function Section({ title, description, className, children, id }: SectionProps) {
  return (
    <section id={id} className={cn('py-16 sm:py-24', className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
    <Card className={cn('bg-card/50 border-border/60 hover:border-primary/30 transition-all duration-300 group', className)}>
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
