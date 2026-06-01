import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface HubStatsProps {
  stats: {
    open: number;
    closed: number;
    p0: number;
    inProgress: number;
  };
}

export function HubStats({ stats }: HubStatsProps) {
  const items = [
    { label: 'Abiertos', value: stats.open, icon: <ClipboardList className="h-4 w-4" />, color: 'text-primary' },
    { label: 'En progreso', value: stats.inProgress, icon: <Loader2 className="h-4 w-4" />, color: 'text-signal' },
    { label: 'P0 críticos', value: stats.p0, icon: <AlertTriangle className="h-4 w-4" />, color: 'text-destructive' },
    { label: 'Cerrados', value: stats.closed, icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-radar' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card key={item.label} className="bg-card/50 border-border/60">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</p>
                <p className="text-2xl font-bold mt-1">{item.value}</p>
              </div>
              <div className={item.color}>{item.icon}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
