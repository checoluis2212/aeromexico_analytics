import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  eventHealthColor,
  eventHealthLabel,
  type EventHealthSummary,
} from '@/lib/analytics/event-health';
import { Activity, CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react';

interface EventHealthPanelProps {
  summary: EventHealthSummary;
}

export function EventHealthPanel({ summary }: EventHealthPanelProps) {
  const hasIssues = summary.issues.length > 0;

  return (
    <Card className="glass-card border-border/60 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Calidad de eventos
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {summary.healthy} de {summary.total} eventos validados en GA4/GTM
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {!hasIssues ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-radar/10 border border-radar/20">
            <CheckCircle2 className="h-5 w-5 text-radar shrink-0" />
            <p className="text-sm">Todos los eventos activos están sanos y recibiendo datos.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {summary.issues.slice(0, 3).map((ev) => (
              <div
                key={ev.id}
                className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-border/40"
              >
                <code className="text-xs font-mono text-primary truncate">{ev.event_name}</code>
                <Badge variant="outline" className={`text-[9px] shrink-0 ${eventHealthColor(ev.health_status)}`}>
                  {eventHealthLabel(ev.health_status)}
                </Badge>
              </div>
            ))}
          </div>
        )}

        <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
          <Link href="/command-center/events">
            Ver catálogo de eventos
            <ArrowRight className="ml-1.5 h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

interface ReportsPanelProps {
  reports: {
    id: string;
    title: string;
    refresh_frequency: string | null;
    dashboard_url: string | null;
    category: string | null;
  }[];
}

const CATEGORY_LABELS: Record<string, string> = {
  acquisition: 'Adquisición',
  ecommerce: 'E-commerce',
  revenue: 'Revenue',
  customer_journey: 'Customer journey',
  mobile: 'App móvil',
  product_analytics: 'Producto',
};

export function ReportsPanel({ reports }: ReportsPanelProps) {
  return (
    <Card className="glass-card border-border/60 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Dashboards disponibles</CardTitle>
        <p className="text-xs text-muted-foreground">Reportes listos para tu equipo en Looker</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {reports.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Sin reportes publicados aún.</p>
        ) : (
          reports.slice(0, 4).map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between gap-2 p-2.5 rounded-lg hover:bg-secondary/30 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium line-clamp-1">{r.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  {CATEGORY_LABELS[r.category ?? ''] ?? r.category}
                  {r.refresh_frequency ? ` · ${r.refresh_frequency}` : ''}
                </p>
              </div>
              {r.dashboard_url && (
                <a
                  href={r.dashboard_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-primary hover:text-primary/80"
                  aria-label={`Abrir ${r.title}`}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          ))
        )}
        <Button variant="ghost" size="sm" className="w-full text-xs mt-1" asChild>
          <Link href="/command-center/reports">
            Ver todos los reportes
            <ArrowRight className="ml-1.5 h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
