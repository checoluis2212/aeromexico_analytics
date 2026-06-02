import type { EventHealthSummary } from '@/lib/analytics/event-health';

export type OpsStatus = 'operativo' | 'revision' | 'atencion';

export interface RequestOpsRow {
  id: string;
  priority: string;
  delivery_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientKpis {
  dataTrust: number;
  criticalLabel: string;
  criticalValue: string;
  reportsReady: number;
  pipelineOpen: number;
  stackOk: number;
}

export interface SergioKpis {
  urgent: number;
  queueTotal: number;
  stale: number;
  inDelivery: number;
  eventAlerts: number;
  deliveredThisMonth: number;
}

export interface ExecutiveKpis {
  opsStatus: OpsStatus;
  opsLabel: string;
  opsDetail: string;
  client: ClientKpis;
  sergio: SergioKpis;
}

const OPS_CONFIG: Record<OpsStatus, { label: string; className: string }> = {
  operativo: { label: 'Operativo', className: 'border-radar/40 bg-radar/10 text-radar' },
  revision: { label: 'En revisión', className: 'border-signal/40 bg-signal/10 text-signal' },
  atencion: { label: 'Requiere atención', className: 'border-destructive/40 bg-destructive/10 text-destructive' },
};

export function opsStatusConfig(status: OpsStatus) {
  return OPS_CONFIG[status];
}

export function deriveOpsStatus(
  events: EventHealthSummary,
  stackHealthy: boolean
): { status: OpsStatus; detail: string } {
  if (events.broken > 0 || !stackHealthy) {
    return {
      status: 'atencion',
      detail:
        events.broken > 0
          ? `${events.broken} evento(s) con falla — revisar antes del próximo release.`
          : 'Un componente del stack (GA4, GTM o BigQuery) necesita revisión.',
    };
  }
  if (events.warning > 0 || events.pendingQa > 0) {
    return {
      status: 'revision',
      detail: `${events.warning + events.pendingQa} evento(s) pendientes de validación QA.`,
    };
  }
  return {
    status: 'operativo',
    detail: 'Medición validada — puedes confiar en los reportes de booking, compra y app.',
  };
}

export function countCriticalEvents(
  events: { event_name: string; category: string | null; health_status: string | null; is_active: boolean }[]
) {
  const active = events.filter((e) => e.is_active);
  const critical = active.filter(
    (e) =>
      e.category === 'conversion' ||
      ['purchase', 'sign_up', 'begin_checkout', 'add_to_cart', 'generate_lead', 'flight_search', 'booking_complete'].includes(
        e.event_name
      )
  );
  const pool = critical.length > 0 ? critical : active;
  const healthy = pool.filter((e) => (e.health_status ?? 'pending_qa') === 'healthy').length;
  return {
    total: pool.length,
    healthy,
    poolLabel: critical.length > 0 ? 'Booking y compra' : 'Eventos activos',
  };
}

const OPEN_STATUSES = new Set(['done', 'cancelled']);
const DELIVERY_STATUSES = new Set(['development', 'analytics_qa', 'ready_for_release']);
const URGENT_PRIORITIES = new Set(['p0_critical', 'p1_high']);
const STALE_MS = 7 * 24 * 60 * 60 * 1000;

export function computeSergioOps(
  requests: RequestOpsRow[],
  events: EventHealthSummary
): SergioKpis {
  const open = requests.filter((r) => !OPEN_STATUSES.has(r.delivery_status ?? ''));
  const now = Date.now();

  return {
    urgent: open.filter((r) => URGENT_PRIORITIES.has(r.priority)).length,
    queueTotal: open.length,
    stale: open.filter((r) => now - new Date(r.updated_at).getTime() > STALE_MS).length,
    inDelivery: open.filter((r) => DELIVERY_STATUSES.has(r.delivery_status ?? '')).length,
    eventAlerts: events.warning + events.broken + events.pendingQa,
    deliveredThisMonth: 0,
  };
}

export function buildExecutiveKpis(input: {
  events: EventHealthSummary;
  stackHealthy: boolean;
  stackOkCount: number;
  openRequests: RequestOpsRow[];
  reportCount: number;
  criticalTotal: number;
  criticalHealthy: number;
  criticalLabel: string;
  deliveredThisMonth: number;
}): ExecutiveKpis {
  const { status, detail } = deriveOpsStatus(input.events, input.stackHealthy);
  const sergio = computeSergioOps(input.openRequests, input.events);
  sergio.deliveredThisMonth = input.deliveredThisMonth;

  return {
    opsStatus: status,
    opsLabel: OPS_CONFIG[status].label,
    opsDetail: detail,
    client: {
      dataTrust: input.events.coveragePercent,
      criticalLabel: input.criticalLabel,
      criticalValue: `${input.criticalHealthy}/${input.criticalTotal}`,
      reportsReady: input.reportCount,
      pipelineOpen: sergio.queueTotal,
      stackOk: input.stackOkCount,
    },
    sergio,
  };
}

export function startOfMonthIso() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
