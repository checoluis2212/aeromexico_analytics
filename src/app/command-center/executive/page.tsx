import { createClient } from '@/lib/supabase/server';
import { CommandCenterTopBar } from '@/components/command-center/top-bar';
import { StatCard } from '@/components/command-center/stat-card';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, ArrowUpRight, Zap } from 'lucide-react';
import type { AnalyticsHealth, Report } from '@/types/command-center';

export const metadata = { title: 'Executive Dashboard' };

export default async function ExecutiveDashboardPage() {
  const supabase = await createClient();

  const [
    { count: openCount },
    { count: doneCount },
    { data: topReports },
  ] = await Promise.all([
    supabase.from('requests').select('*', { count: 'exact', head: true }).not('delivery_status', 'eq', 'done'),
    supabase.from('requests').select('*', { count: 'exact', head: true }).eq('delivery_status', 'done'),
    supabase.from('reports').select('*').order('popularity_score', { ascending: false }).limit(5),
  ]);

  const { data: health } = await supabase.from('analytics_health').select('*').order('recorded_at', { ascending: false }).limit(1).single();
  const { data: recentActivity } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(8);
  const h = health as AnalyticsHealth | null;
  const healthScore = h?.health_score ?? 76;

  return (
    <>
      <CommandCenterTopBar
        title="Executive Dashboard"
        subtitle="Visibilidad del programa de Analytics · Aerolínea global"
        badge="Live"
      />

      <div className="p-6 space-y-8">
        {/* Health Score Hero */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card/50 to-card/30 p-8">
          <div className="absolute inset-0 grid-pattern opacity-20" />
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-primary font-semibold">Analytics Health Score</p>
              <div className="flex items-end gap-3 mt-2">
                <span className="text-6xl font-bold tabular-nums">{healthScore}</span>
                <span className="text-2xl text-muted-foreground mb-2">/100</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2 max-w-md">
                Score compuesto de tracking, gobernanza, reporting, calidad de datos y autoservicio.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'GA4', status: h?.ga4_status ?? 'healthy' },
                { label: 'BigQuery', status: h?.bigquery_status ?? 'healthy' },
                { label: 'GTM', status: h?.gtm_status ?? 'healthy' },
              ].map((s) => (
                <div key={s.label} className="text-center p-3 rounded-xl bg-background/50 border border-border/40">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <Badge variant="outline" className="mt-1 text-[10px] border-radar/40 text-radar capitalize">
                    {s.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Solicitudes abiertas" value={openCount ?? 12} icon="inbox" delay={0} />
          <StatCard label="Completadas (Q2)" value={doneCount ?? 34} icon="checkCircle2" trend="up" change="+18% vs Q1" delay={0.05} />
          <StatCard label="Lead Time prom." value="4.2d" icon="clock" trend="down" change="-12% mejora" delay={0.1} />
          <StatCard label="Cycle Time prom." value="2.8d" icon="activity" trend="down" change="-8% mejora" delay={0.15} />
          <StatCard label="Tracking Coverage" value={`${h?.tracking_coverage ?? 84.5}%`} icon="target" delay={0.2} />
          <StatCard label="Horas ahorradas" value={`${(h?.hours_saved ?? 1240).toLocaleString()}h`} icon="trendUp" trend="up" change="YTD 2026" delay={0.25} />
          <StatCard label="ROI Analytics" value={`$${((h?.roi_estimate ?? 485000) / 1000).toFixed(0)}K`} icon="dollarSign" trend="up" change="Estimado anual" delay={0.3} />
          <StatCard label="Reportes activos" value={(topReports ?? []).length > 0 ? '15+' : '15'} icon="barChart3" delay={0.35} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Reports */}
          <Card className="bg-card/50 border-border/60">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Top Reportes Solicitados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(topReports as Report[] ?? []).map((r, i) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-primary w-5">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium">{r.title}</p>
                      <p className="text-xs text-muted-foreground">{r.view_count.toLocaleString()} views</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{r.popularity_score}%</Badge>
                </div>
              ))}
              {(!topReports || topReports.length === 0) && (
                <p className="text-sm text-muted-foreground py-4 text-center">Ejecuta migración 004 para datos seed.</p>
              )}
            </CardContent>
          </Card>

          {/* Próximas iniciativas */}
          <Card className="bg-card/50 border-border/60">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Próximas Iniciativas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { title: 'Checkout funnel — app móvil', status: 'Development', pts: 8 },
                { title: 'BigQuery mart — revenue attribution', status: 'Requirements', pts: 13 },
                { title: 'Consent Mode v2 — validación', status: 'Analytics QA', pts: 5 },
                { title: 'Report marketplace — self-service', status: 'Ready for Release', pts: 3 },
              ].map((item) => (
                <div key={item.title} className="flex items-center justify-between p-3 rounded-lg border border-border/40">
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.pts} story points</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{item.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-card/50 border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(recentActivity ?? []).length > 0 ? (
                recentActivity!.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 text-sm py-2 border-b border-border/30 last:border-0">
                    <ArrowUpRight className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{a.action}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{a.entity_type}</span>
                  </div>
                ))
              ) : (
                [
                  'Dashboard ROAS publicado en Report Marketplace',
                  'Evento purchase_validated completó Analytics QA',
                  'Sprint 12 — 78% capacity utilizada',
                  'Nueva solicitud: Funnel checkout mobile',
                ].map((a) => (
                  <div key={a} className="flex items-center gap-3 text-sm py-2 border-b border-border/30 last:border-0">
                    <ArrowUpRight className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{a}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
