export type EventHealthStatus = 'healthy' | 'warning' | 'broken' | 'pending_qa';

export interface EventHealthRow {
  id: string;
  event_name: string;
  health_status: EventHealthStatus;
  last_validated_at: string | null;
  validation_notes: string | null;
  category: string | null;
  is_active: boolean;
}

export interface EventHealthSummary {
  total: number;
  healthy: number;
  warning: number;
  broken: number;
  pendingQa: number;
  coveragePercent: number;
  score: number;
  issues: EventHealthRow[];
}

const STATUS_LABELS: Record<EventHealthStatus, string> = {
  healthy: 'OK',
  warning: 'Revisar',
  broken: 'Roto',
  pending_qa: 'Sin validar',
};

const STATUS_COLORS: Record<EventHealthStatus, string> = {
  healthy: 'text-radar border-radar/40 bg-radar/10',
  warning: 'text-signal border-signal/40 bg-signal/10',
  broken: 'text-destructive border-destructive/40 bg-destructive/10',
  pending_qa: 'text-muted-foreground border-border/60 bg-secondary/30',
};

export function eventHealthLabel(status: EventHealthStatus) {
  return STATUS_LABELS[status] ?? status;
}

export function eventHealthColor(status: EventHealthStatus) {
  return STATUS_COLORS[status] ?? STATUS_COLORS.pending_qa;
}

export function computeEventHealth(events: EventHealthRow[]): EventHealthSummary {
  const active = events
    .filter((e) => e.is_active)
    .map((e) => ({
      ...e,
      health_status: (e.health_status ?? 'pending_qa') as EventHealthStatus,
    }));
  const total = active.length;
  const healthy = active.filter((e) => e.health_status === 'healthy').length;
  const warning = active.filter((e) => e.health_status === 'warning').length;
  const broken = active.filter((e) => e.health_status === 'broken').length;
  const pendingQa = active.filter((e) => e.health_status === 'pending_qa').length;

  const coveragePercent = total > 0 ? Math.round((healthy / total) * 1000) / 10 : 0;
  const penalty = warning * 5 + broken * 15 + pendingQa * 8;
  const score = Math.max(0, Math.min(100, Math.round(coveragePercent - penalty / Math.max(total, 1))));

  const issues = active
    .filter((e) => e.health_status !== 'healthy')
    .sort((a, b) => {
      const order: Record<EventHealthStatus, number> = { broken: 0, warning: 1, pending_qa: 2, healthy: 3 };
      return order[a.health_status] - order[b.health_status];
    });

  return { total, healthy, warning, broken, pendingQa, coveragePercent, score, issues };
}

export function stackStatusLabel(status: string | null | undefined) {
  if (!status || status === 'healthy') return 'Funcionando';
  if (status === 'degraded') return 'Degradado';
  if (status === 'down') return 'Caído';
  return status;
}

export function computeOverallHealthScore(
  eventSummary: EventHealthSummary,
  stackHealthy: boolean
): number {
  if (eventSummary.total === 0) return stackHealthy ? 76 : 60;
  const base = Math.round(eventSummary.coveragePercent * 0.55 + eventSummary.score * 0.45);
  const stackPenalty = stackHealthy ? 0 : 12;
  const brokenPenalty = eventSummary.broken * 8;
  return Math.max(0, Math.min(100, base - stackPenalty - brokenPenalty));
}
