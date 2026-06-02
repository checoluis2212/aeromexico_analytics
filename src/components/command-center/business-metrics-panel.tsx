import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

interface MetricRow {
  name: string;
  business_definition: string | null;
  type: string;
  examples: string[] | null;
}

export function BusinessMetricsPanel({ metrics }: { metrics: MetricRow[] }) {
  if (metrics.length === 0) return null;

  return (
    <Card className="glass-card border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Métricas clave que monitoreamos
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          KPIs de negocio en Aeroméxico — definidos en el diccionario de analytics
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {metrics.map((m) => (
            <div
              key={m.name}
              className="p-3 rounded-lg border border-border/40 bg-secondary/10"
            >
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium">{m.name}</p>
                <Badge variant="outline" className="text-[9px] uppercase">
                  {m.type}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {m.business_definition}
              </p>
              {m.examples?.[0] && (
                <p className="text-[11px] text-primary/80 mt-1.5">Ej: {m.examples[0]}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
