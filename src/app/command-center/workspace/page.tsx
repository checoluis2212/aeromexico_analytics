import { createClient } from '@/lib/supabase/server';
import { CommandCenterTopBar } from '@/components/command-center/top-bar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Inbox, AlertTriangle, CheckSquare, Kanban, TrendingUp, Clock } from 'lucide-react';

export const metadata = { title: 'My Workspace' };

export default async function WorkspacePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: myRequests } = user
    ? await supabase.from('requests').select('*').or(`assigned_to.eq.${user.id},owner_id.eq.${user.id}`).limit(10)
    : { data: [] };

  const { data: sprint } = await supabase.from('sprints').select('*').eq('is_active', true).single();

  return (
    <>
      <CommandCenterTopBar
        title="My Workspace"
        subtitle="Vista personal · Analytics Lead"
        badge={sprint?.name ?? 'Sprint activo'}
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Mis tickets', value: myRequests?.length ?? 5, icon: Inbox },
            { label: 'Revisiones pendientes', value: 3, icon: CheckSquare },
            { label: 'Bloqueadores', value: 1, icon: AlertTriangle },
            { label: 'Story points sprint', value: '28/42', icon: Kanban },
          ].map((s) => (
            <Card key={s.label} className="bg-card/50 border-border/60">
              <CardContent className="pt-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold mt-1">{s.value}</p>
                </div>
                <s.icon className="h-5 w-5 text-primary" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card/50 border-border/60">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Inbox className="h-4 w-4" /> Mis tickets activos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(myRequests ?? []).length > 0 ? (
                myRequests!.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 text-sm">
                    <span className="line-clamp-1 flex-1">{r.title}</span>
                    <Badge variant="outline" className="text-[10px] ml-2 shrink-0">{r.delivery_status ?? r.status}</Badge>
                  </div>
                ))
              ) : (
                [
                  'Dashboard ROAS — Development',
                  'Evento purchase — Analytics QA',
                  'BigQuery LTV mart — Requirements',
                ].map((t) => (
                  <div key={t} className="p-3 rounded-lg bg-secondary/20 text-sm">{t}</div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/60">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> KPIs personales — Sprint
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { kpi: 'Throughput', target: '8 items', actual: '6', pct: 75 },
                { kpi: 'QA pass rate', target: '95%', actual: '98%', pct: 100 },
                { kpi: 'Lead time', target: '<5d', actual: '4.2d', pct: 90 },
              ].map((k) => (
                <div key={k.kpi}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{k.kpi}</span>
                    <span className="text-muted-foreground">{k.actual} / {k.target}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${k.pct}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card/50 border-border/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" /> Actividad reciente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              'Completaste QA de evento add_to_cart',
              'Publicaste dashboard ROAS en Marketplace',
              'Aprobaste solicitud: Funnel checkout mobile',
              'Comentaste en BigQuery LTV mart',
            ].map((a) => (
              <div key={a} className="py-2 border-b border-border/30 last:border-0 text-muted-foreground">{a}</div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
