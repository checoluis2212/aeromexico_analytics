'use client';

import Link from 'next/link';
import {
  BarChart3,
  Bot,
  Columns3,
  Database,
  ExternalLink,
  Inbox,
  ListChecks,
  Settings2,
  TrafficCone,
  Users,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ScenarioChip } from '@/components/assistant/preguntale-scenarios';

const QUERY_ICONS: Record<string, React.ReactNode> = {
  pending: <ListChecks className="h-5 w-5" />,
  all_requests: <Inbox className="h-5 w-5" />,
  requesters: <Users className="h-5 w-5" />,
  in_progress: <Columns3 className="h-5 w-5" />,
  semaphore: <TrafficCone className="h-5 w-5" />,
  events: <Zap className="h-5 w-5" />,
  bigquery: <Database className="h-5 w-5" />,
};

type Props = {
  queries: ScenarioChip[];
  panelLinks?: ScenarioChip[];
  onSelect: (scenario: ScenarioChip) => void;
  disabled?: boolean;
  className?: string;
};

export function AdminAgentScenarios({
  queries,
  panelLinks = [],
  onSelect,
  disabled,
  className,
}: Props) {
  return (
    <div className={cn('space-y-5', className)}>
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Bot className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Consultas al agente
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {queries.map((s) => (
            <button
              key={s.id}
              type="button"
              disabled={disabled || !s.message}
              onClick={() => s.message && onSelect(s)}
              className={cn(
                'group text-left rounded-2xl border border-border/50 bg-card/70 p-4 sm:p-5',
                'hover:border-primary/40 hover:bg-primary/[0.05] hover:shadow-md hover:shadow-primary/[0.04]',
                'transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none w-full'
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary h-11 w-11 group-hover:bg-primary/15 transition-colors">
                  {QUERY_ICONS[s.id] ?? <BarChart3 className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium text-primary/90 uppercase tracking-wide">
                    {s.area}
                  </p>
                  <p className="text-base font-semibold leading-snug mt-1">{s.title}</p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {s.subtitle}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {panelLinks.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
            Ir al panel
          </p>
          <div className="flex flex-wrap gap-2">
            {panelLinks.map((s) => (
              <Link
                key={s.id}
                href={s.href!}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border border-border/60',
                  'bg-secondary/30 px-4 py-2 text-sm font-medium',
                  'hover:border-primary/40 hover:bg-primary/[0.06] transition-colors'
                )}
              >
                {s.title}
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
