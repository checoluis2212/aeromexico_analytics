import { createClient } from '@/lib/supabase/server';
import { CommandCenterTopBar } from '@/components/command-center/top-bar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Layers, Tag, BarChart2, Database, PieChart } from 'lucide-react';

export const metadata = { title: 'Event Catalog' };

const FLOW_STEPS = [
  { label: 'Data Layer', icon: Layers, color: 'text-blue-400' },
  { label: 'GTM', icon: Tag, color: 'text-purple-400' },
  { label: 'GA4', icon: BarChart2, color: 'text-primary' },
  { label: 'BigQuery', icon: Database, color: 'text-signal' },
  { label: 'Dashboard', icon: PieChart, color: 'text-radar' },
];

export default async function EventsCatalogPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from('event_catalog')
    .select('*')
    .eq('is_active', true)
    .order('event_name');

  return (
    <>
      <CommandCenterTopBar
        title="Event Catalog"
        subtitle="Flujo completo: Data Layer → GTM → GA4 → BigQuery → Dashboard"
      />

      <div className="p-6 space-y-6">
        {/* Pipeline visual */}
        <Card className="bg-card/30 border-border/60">
          <CardContent className="py-6">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {FLOW_STEPS.map((step, i) => (
                <div key={step.label} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-secondary/30 border border-border/40 min-w-[90px]">
                    <step.icon className={`h-5 w-5 ${step.color}`} />
                    <span className="text-[10px] font-medium">{step.label}</span>
                  </div>
                  {i < FLOW_STEPS.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {(events ?? []).map((event) => {
            const params = (event.parameters ?? []) as { name: string; type: string; required: boolean; description: string }[];
            return (
              <Card key={event.id} className="bg-card/50 border-border/60">
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-base font-mono">{event.event_name}</CardTitle>
                    {event.category && <Badge variant="outline">{event.category}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </CardHeader>
                <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {params.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Parámetros</p>
                      <div className="space-y-1.5">
                        {params.map((p) => (
                          <div key={p.name} className="flex items-center gap-2 text-xs p-2 rounded bg-secondary/20">
                            <code className="font-mono text-primary">{p.name}</code>
                            <span className="text-muted-foreground">{p.type}</span>
                            {p.required && <Badge variant="secondary" className="text-[9px] ml-auto">req</Badge>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {event.example_code && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Ejemplo</p>
                      <pre className="text-xs font-mono p-3 rounded-lg bg-secondary/30 overflow-x-auto">{event.example_code}</pre>
                    </div>
                  )}
                  {(event.use_cases ?? []).length > 0 && (
                    <div className="lg:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Casos de uso</p>
                      <div className="flex flex-wrap gap-1.5">
                        {event.use_cases.map((uc: string) => (
                          <Badge key={uc} variant="secondary" className="text-xs">{uc}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
