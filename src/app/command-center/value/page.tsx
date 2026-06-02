import { CommandCenterTopBar } from '@/components/command-center/top-bar';
import { StatCard, type StatIconKey } from '@/components/command-center/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export const metadata = { title: 'Value Center' };

const VALUE_KPIS: Array<{
  label: string;
  value: string;
  change: string;
  icon: StatIconKey;
}> = [
  { label: 'Tickets cerrados', value: '127', change: '+23% vs Q1', icon: 'checkCircle2' },
  { label: 'Dashboards publicados', value: '15', change: '3 este sprint', icon: 'layoutDashboard' },
  { label: 'Eventos implementados', value: '48', change: '+12 en Q2', icon: 'zap' },
  { label: 'Errores detectados (QA)', value: '34', change: 'Antes de producción', icon: 'shieldAlert' },
  { label: 'Incidentes resueltos', value: '8', change: 'MTTR 4.2h', icon: 'clock' },
  { label: 'Adopción de reportes', value: '2.4K', change: 'usuarios/mes', icon: 'users' },
  { label: 'Horas ahorradas', value: '1,240h', change: 'YTD estimado', icon: 'trendUp' },
  { label: 'Valor de negocio', value: '$485K', change: 'ROI anual est.', icon: 'dollarSign' },
];

export default function ValueCenterPage() {
  return (
    <>
      <CommandCenterTopBar
        title="Nuestro impacto"
        subtitle="Lo que Analytics ha conseguido para el negocio — en números que importan"
      />

      <div className="p-6 space-y-8">
        <div className="rounded-2xl border border-radar/20 bg-gradient-to-br from-radar/10 to-transparent p-8">
          <p className="text-xs uppercase tracking-widest text-radar font-semibold">Valor generado — YTD 2026</p>
          <p className="text-4xl font-bold mt-2">El equipo de Analytics habilitó decisiones que representan ~$485K en valor de negocio estimado.</p>
          <p className="text-sm text-muted-foreground mt-3 max-w-2xl">
            Basado en horas ahorradas a stakeholders, errores prevenidos pre-producción, y adopción de self-service reporting.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {VALUE_KPIS.map((kpi, i) => (
            <StatCard key={kpi.label} label={kpi.label} value={kpi.value} change={kpi.change} trend="up" icon={kpi.icon} delay={i * 0.05} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card/50 border-border/60">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Adopción de Reportes (últimos 6 meses)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-32">
                {[65, 78, 82, 95, 110, 124].map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t bg-primary/60" style={{ height: `${(v / 124) * 100}%` }} />
                    <span className="text-[9px] text-muted-foreground">M{i + 1}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Impacto por área</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { area: 'Marketing', impact: 'ROAS dashboards → +15% budget efficiency', pct: 92 },
                { area: 'E-commerce', impact: 'Checkout funnel → -8% abandono paso 3', pct: 88 },
                { area: 'Product', impact: 'Feature adoption tracking → 3 pivots data-driven', pct: 75 },
                { area: 'Finance', impact: 'Revenue attribution → cierre mensual -2 días', pct: 70 },
              ].map((item) => (
                <div key={item.area} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.area}</span>
                    <span className="text-xs text-muted-foreground">{item.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${item.pct}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">{item.impact}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
