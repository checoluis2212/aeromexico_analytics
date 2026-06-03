'use client';

import { Clock, Inbox } from 'lucide-react';
import type { HomeStatsData } from '@/lib/home-stats';

export function HomeStatsBar({ total, active }: HomeStatsData) {
  if (total === 0 && active === 0) return null;

  const items = [
    { label: 'Pedidos que hemos atendido', value: total, icon: Inbox },
    { label: 'Abiertos ahora mismo', value: active, icon: Clock },
  ];

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {items.map((s) => (
        <div
          key={s.label}
          className="inline-flex items-center gap-2.5 rounded-full border border-border/50 bg-card/40 px-4 py-2"
        >
          <s.icon className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="text-sm font-semibold tabular-nums">{s.value}</span>
          <span className="text-xs text-muted-foreground">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
