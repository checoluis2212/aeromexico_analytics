'use client';

import { useRouter } from 'next/navigation';
import {
  BarChart3,
  GitBranch,
  Inbox,
  LineChart,
  MessageCircle,
  Plane,
  PlusCircle,
  Search,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ScenarioChip = {
  id: string;
  area: string;
  title: string;
  subtitle: string;
  /** Envía mensaje al chat */
  message?: string;
  /** Navega a otra ruta del portal */
  href?: string;
};

const ICONS: Record<string, React.ReactNode> = {
  my_orders: <Inbox className="h-4 w-4" />,
  order_status: <Sparkles className="h-4 w-4" />,
  analytics_doubt: <MessageCircle className="h-4 w-4" />,
  numbers_dont_match: <Search className="h-4 w-4" />,
  pedir_trabajo: <PlusCircle className="h-4 w-4" />,
  pedir_hub: <BarChart3 className="h-4 w-4" />,
  checkout_funnel: <GitBranch className="h-4 w-4" />,
  campaign_dashboard: <BarChart3 className="h-4 w-4" />,
  new_flow_tracking: <Plane className="h-4 w-4" />,
  bigquery_report: <LineChart className="h-4 w-4" />,
};

type Props = {
  scenarios: ScenarioChip[];
  onSelect: (scenario: ScenarioChip) => void;
  disabled?: boolean;
  className?: string;
  compact?: boolean;
};

export function PreguntaleScenarios({
  scenarios,
  onSelect,
  disabled,
  className,
  compact = false,
}: Props) {
  const router = useRouter();

  function handleClick(s: ScenarioChip) {
    if (disabled) return;
    if (s.href) {
      router.push(s.href);
      return;
    }
    if (s.message) onSelect(s);
  }

  return (
    <div className={cn('space-y-2.5', className)}>
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        Qué puedes hacer aquí
      </p>
      <div className={cn('grid gap-2', compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 gap-2.5')}>
        {scenarios.map((s) => (
          <button
            key={s.id}
            type="button"
            disabled={disabled}
            onClick={() => handleClick(s)}
            className={cn(
              'group text-left rounded-xl border border-border/50 bg-card/60',
              compact ? 'p-3' : 'p-4',
              'hover:border-primary/35 hover:bg-primary/[0.04] hover:shadow-sm',
              'transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none'
            )}
          >
            <div className="flex items-start gap-2.5">
              <div
                className={cn(
                  'flex shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors',
                  compact ? 'h-8 w-8' : 'h-9 w-9'
                )}
              >
                {ICONS[s.id] ?? <BarChart3 className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-medium text-primary/80 uppercase tracking-wide">
                  {s.area}
                </p>
                <p className={cn('font-semibold leading-snug mt-0.5', compact ? 'text-xs' : 'text-sm')}>
                  {s.title}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{s.subtitle}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
