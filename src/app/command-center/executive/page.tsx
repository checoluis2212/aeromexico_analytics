import { createClient } from '@/lib/supabase/server';
import { CommandCenterTopBar } from '@/components/command-center/top-bar';
import { StatCard } from '@/components/command-center/stat-card';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, ArrowUpRight, Zap } from 'lucide-react';
import type { AnalyticsHealth, Report } from '@/types/command-center';

export const metadata = { title: 'Resumen' };

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
        title="Así vamos"
        subtitle="Un vistazo rápido — sin jerga técnica"
      />

      <div className="p-5 space-y-6">
        <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card/30 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <p className="text-xs text-muted-foreground">Salud general de Analytics</p>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-5xl font-bold tabular-nums">{healthScore}</span>
                <span className="text-lg text-muted-foreground mb-1">de 100</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2 max-w-md">
                {healthScore >= 75
                  ? 'Vamos bien. Los datos están llegando y el equipo responde a tiempo.'
                  : healthScore >= 50
                    ? 'Hay áreas por mejorar, pero nada crítico. Revisa los reportes más usados abajo.'
                    : 'Necesitamos atención en algunas áreas. Escríbenos si algo te bloquea.'}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'GA4', status: h?.ga4_status ?? 'healthy', ok: 'Funcionando' },
                { label: 'BigQuery', status: h?.bigquery_status ?? 'healthy', ok: 'Funcionando' },
                { label: 'GTM', status: h?.gtm_status ?? 'healthy', ok: 'Funcionando' },
              ].map((s) => (
                <div key={s.label} className="text-center p-2.5 rounded-lg bg-background/60 border border-border/30">
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                  <Badge variant="outline" className="mt-1 text-[10px] border-radar/40 text-radar">
                    {s.status === 'healthy' ? s.ok : s.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Pendientes" value={openCount ?? 12} icon="inbox" delay={0} />
          <StatCard label="Entregados este trimestre" value={doneCount ?? 34} icon="checkCircle2" trend="up" change="Gracias por la paciencia" delay={0.05} />
          <StatCard label="Tiempo de respuesta" value="~4 días" icon="clock" trend="down" change="Mejorando" delay={0.1} />
          <StatCard label="Cobertura de medición" value={`${h?.tracking_coverage ?? 84.5}%`} icon="target" delay={0.15} />
          <StatCard label="Horas que te ahorramos" value={`${(h?.hours_saved ?? 1240).toLocaleString()}h`} icon="trendUp" trend="up" change="Este año" delay={0.2} />
          <StatCard label="Valor estimado" value={`$${((h?.roi_estimate ?? 485000) / 1000).toFixed(0)}K`} icon="dollarSign" trend="up" change="Para el negocio" delay={0.25} />
          <StatCard label="Reportes disponibles" value={(topReports ?? []).length > 0 ? String((topReports ?? []).length) : '6+'} icon="barChart3" delay={0.3} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Reports */}
          <Card className="bg-card/50 border-border/60">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Top Reportes — los que más usan tus colegas
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
                Lo que viene en camino
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
            <CardTitle className="text-base">Últimos movimientos</CardTitle>
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
