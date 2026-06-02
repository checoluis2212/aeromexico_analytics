import { StatCard, type StatIconKey } from '@/components/command-center/stat-card';

interface KpiItem {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: StatIconKey;
}

interface KpiSectionProps {
  title: string;
  subtitle: string;
  kpis: KpiItem[];
  accent?: 'client' | 'sergio';
}

export function KpiSection({ title, subtitle, kpis, accent = 'client' }: KpiSectionProps) {
  const borderClass =
    accent === 'sergio'
      ? 'border-l-primary/50'
      : 'border-l-radar/50';

  return (
    <section className={`rounded-xl border border-border/50 glass-card p-4 border-l-[3px] ${borderClass}`}>
      <div className="mb-4">
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi, i) => (
          <StatCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            change={kpi.change}
            trend={kpi.trend}
            icon={kpi.icon}
            delay={i * 0.04}
            className="bg-background/40"
          />
        ))}
      </div>
    </section>
  );
}
