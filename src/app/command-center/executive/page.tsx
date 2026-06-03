import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { CommandCenterTopBar } from '@/components/command-center/top-bar';
import { CommandCenterPageContent } from '@/components/command-center/command-center-page-content';
import { KpiSection } from '@/components/command-center/kpi-section';
import { EventHealthPanel, ReportsPanel } from '@/components/command-center/executive-panels';
import { BusinessMetricsPanel } from '@/components/command-center/business-metrics-panel';
import { SergioQuickActions } from '@/components/command-center/sergio-quick-actions';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { computeEventHealth, stackStatusLabel, type EventHealthRow } from '@/lib/analytics/event-health';
import {
  buildExecutiveKpis,
  countCriticalEvents,
  opsStatusConfig,
  startOfMonthIso,
  type RequestOpsRow,
} from '@/lib/analytics/executive-kpis';
import { mapDeliveryStatusForUser } from '@/lib/integrations/external-sync';
import { isSergioAdmin } from '@/lib/auth/access';

export const metadata = { title: 'Resumen' };

export default async function ExecutiveDashboardPage() {
  const supabase = await createClient();
  const monthStart = startOfMonthIso();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from('profiles').select('role, acc_role, email').eq('id', user.id).single()
    : { data: null };
  const sergioView = isSergioAdmin(profile);

  const [
    { data: openRequests },
    { count: doneThisMonth },
    { data: reports },
    { data: events },
    { data: inProgress },
    { data: healthRow },
    { data: businessMetrics },
  ] = await Promise.all([
    supabase
      .from('requests')
      .select('id, priority, delivery_status, created_at, updated_at')
      .not('delivery_status', 'in', '("done","cancelled")'),
    supabase
      .from('requests')
      .select('*', { count: 'exact', head: true })
      .eq('delivery_status', 'done')
      .gte('updated_at', monthStart),
    supabase
      .from('reports')
      .select('id, title, refresh_frequency, dashboard_url, category, popularity_score')
      .order('popularity_score', { ascending: false })
      .limit(6),
    supabase
      .from('event_catalog')
      .select('id, event_name, health_status, last_validated_at, validation_notes, category, is_active'),
    supabase
      .from('requests')
      .select('id, title, delivery_status, company, updated_at')
      .not('delivery_status', 'in', '("done","cancelled")')
      .order('updated_at', { ascending: false })
      .limit(5),
    supabase.from('analytics_health').select('ga4_status, bigquery_status, gtm_status').order('recorded_at', { ascending: false }).limit(1).maybeSingle(),
    supabase
      .from('metrics')
      .select('name, business_definition, type, examples')
      .eq('type', 'kpi')
      .limit(4),
  ]);

  const eventRows = (events ?? []) as EventHealthRow[];
  const eventSummary = computeEventHealth(eventRows);
  const critical = countCriticalEvents(eventRows);

  const ga4Status = healthRow?.ga4_status ?? 'healthy';
  const bqStatus = healthRow?.bigquery_status ?? 'healthy';
  const gtmStatus = healthRow?.gtm_status ?? 'healthy';
  const stackStatuses = [ga4Status, bqStatus, gtmStatus];
  const stackHealthy = stackStatuses.every((s) => s === 'healthy');
  const stackOk = stackStatuses.filter((s) => s === 'healthy').length;

  const kpis = buildExecutiveKpis({
    events: eventSummary,
    stackHealthy,
    stackOkCount: stackOk,
    openRequests: (openRequests ?? []) as RequestOpsRow[],
    reportCount: (reports ?? []).length,
    criticalTotal: critical.total,
    criticalHealthy: critical.healthy,
    criticalLabel: critical.poolLabel,
    deliveredThisMonth: doneThisMonth ?? 0,
  });

  const ops = opsStatusConfig(kpis.opsStatus);

  const clientKpiItems = [
    {
      label: 'Confianza en datos',
      value: `${kpis.client.dataTrust}%`,
      change: 'Eventos validados en GA4/GTM',
      icon: 'target' as const,
    },
    {
      label: kpis.client.criticalLabel,
      value: kpis.client.criticalValue,
      change: 'Purchase, sign_up, checkout',
      icon: 'checkCircle2' as const,
      trend: 'up' as const,
    },
    {
      label: 'Dashboards listos',
      value: kpis.client.reportsReady,
      change: 'Looker · self-service',
      icon: 'barChart3' as const,
    },
    {
      label: 'Pedidos en pipeline',
      value: kpis.client.pipelineOpen,
      change: 'Solicitudes abiertas al equipo',
      icon: 'inbox' as const,
    },
  ];

  const sergioKpiItems = [
    {
      label: 'Urgentes P0/P1',
      value: kpis.sergio.urgent,
      change: 'Atender primero',
      icon: 'shieldAlert' as const,
      trend: kpis.sergio.urgent > 0 ? ('down' as const) : ('neutral' as const),
    },
    {
      label: 'Cola total',
      value: kpis.sergio.queueTotal,
      change: 'Pedidos abiertos',
      icon: 'inbox' as const,
    },
    {
      label: 'Sin movimiento +7d',
      value: kpis.sergio.stale,
      change: 'Requieren follow-up',
      icon: 'clock' as const,
      trend: kpis.sergio.stale > 0 ? ('down' as const) : ('up' as const),
    },
    {
      label: 'En desarrollo / QA',
      value: kpis.sergio.inDelivery,
      change: `${kpis.sergio.deliveredThisMonth} entregados este mes`,
      icon: 'activity' as const,
    },
  ];

  return (
    <>
      <CommandCenterTopBar
        title="Resumen"
        subtitle="Cómo va el negocio y la operación del equipo"
      />

      <CommandCenterPageContent className="space-y-6">
        <div className="rounded-xl border border-border/50 glass-card p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={`text-xs ${ops.className}`}>
                  {kpis.opsLabel}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Stack {stackOk}/3 · {eventSummary.coveragePercent}% eventos OK
                </span>
              </div>
              <p className="text-sm text-muted-foreground max-w-lg">{kpis.opsDetail}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              {[
                { label: 'GA4', status: ga4Status },
                { label: 'GTM', status: gtmStatus },
                { label: 'BigQuery', status: bqStatus },
              ].map((s) => (
                <div key={s.label} className="text-center px-3 py-2 rounded-lg bg-secondary/30 border border-border/30 min-w-[72px]">
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  <p className={`text-[11px] font-medium mt-0.5 ${s.status === 'healthy' ? 'text-radar' : 'text-signal'}`}>
                    {stackStatusLabel(s.status)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <KpiSection
          title="Para quien pide"
          subtitle="¿Puedo confiar en los datos y ver avance?"
          kpis={clientKpiItems}
          accent="client"
        />

        {sergioView && (
          <KpiSection
            title="Para mí"
            subtitle="Urgencias, cola y entregas del mes"
            kpis={sergioKpiItems}
            accent="sergio"
          />
        )}

        {sergioView && kpis.sergio.eventAlerts > 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-signal/30 bg-signal/5 text-sm">
            <span className="text-signal font-medium">{kpis.sergio.eventAlerts} evento(s)</span>
            <span className="text-muted-foreground">pendientes de validación — revisa el catálogo antes del próximo deploy.</span>
          </div>
        )}


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <EventHealthPanel summary={eventSummary} />
          <ReportsPanel reports={reports ?? []} />
        </div>

        <BusinessMetricsPanel metrics={businessMetrics ?? []} />

        <Card className="glass-card border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pedidos activos</CardTitle>
            <p className="text-xs text-muted-foreground">Lo que está en curso ahora mismo</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {(inProgress ?? []).length > 0 ? (
              (inProgress ?? []).map((r) => (
                <Link
                  key={r.id}
                  href={sergioView ? `/command-center/pedidos/${r.id}` : '/command-center/board'}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border/40 hover:border-primary/30 hover:bg-secondary/20 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{r.title}</p>
                    {r.company && (
                      <p className="text-[11px] text-muted-foreground">{r.company}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {mapDeliveryStatusForUser(r.delivery_status ?? 'backlog')}
                  </Badge>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No hay pedidos activos.{' '}
                <Link href="/pedir" className="text-primary hover:underline">
                  Pedir con IA
                </Link>
              </p>
            )}
            {sergioView && <SergioQuickActions />}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
          <Link href="/command-center/reports" className="text-primary hover:underline">
            Reportes publicados
          </Link>
          <Link href="/glosario" className="text-primary hover:underline">
            Glosario de métricas
          </Link>
        </div>
      </CommandCenterPageContent>
    </>
  );
}
