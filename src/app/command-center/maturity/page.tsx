import { createClient } from '@/lib/supabase/server';
import { CommandCenterTopBar } from '@/components/command-center/top-bar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MATURITY_DIMENSIONS } from '@/types/command-center';
import type { AnalyticsScore } from '@/types/command-center';
import { AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react';

export const metadata = { title: 'Maturity Center' };

const FALLBACK_SCORES: AnalyticsScore[] = MATURITY_DIMENSIONS.map((d, i) => ({
  id: String(i),
  dimension: d,
  score: [78, 65, 82, 71, 45, 58, 74][i],
  strengths: ['Implementación base completa'],
  risks: ['Gaps en documentación'],
  opportunities: ['Automatización'],
  assessed_at: new Date().toISOString(),
}));

export default async function MaturityCenterPage() {
  const supabase = await createClient();
  const { data: scores } = await supabase.from('analytics_scores').select('*').order('dimension');

  const items = (scores as AnalyticsScore[] ?? []).length > 0
    ? (scores as AnalyticsScore[])
    : FALLBACK_SCORES;

  const overall = Math.round(items.reduce((s, i) => s + i.score, 0) / items.length);

  return (
    <>
      <CommandCenterTopBar
        title="Analytics Maturity Center"
        subtitle="Evaluación 0-100 · Fortalezas · Riesgos · Roadmap"
      />

      <div className="p-6 space-y-8">
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 to-transparent p-8 text-center">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold">Score Global de Madurez</p>
          <p className="text-7xl font-bold mt-2 tabular-nums">{overall}</p>
          <p className="text-sm text-muted-foreground mt-2">de 100 · Evaluación Q2 2026</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {items.map((item) => (
            <Card key={item.id} className="bg-card/50 border-border/60">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{item.dimension}</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                    <span className="text-lg font-bold tabular-nums">{item.score}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="flex items-center gap-1 text-radar font-medium mb-1.5"><CheckCircle2 className="h-3 w-3" />Fortalezas</p>
                  {(item.strengths ?? []).map((s) => <p key={s} className="text-muted-foreground mb-0.5">• {s}</p>)}
                </div>
                <div>
                  <p className="flex items-center gap-1 text-destructive font-medium mb-1.5"><AlertTriangle className="h-3 w-3" />Riesgos</p>
                  {(item.risks ?? []).map((r) => <p key={r} className="text-muted-foreground mb-0.5">• {r}</p>)}
                </div>
                <div>
                  <p className="flex items-center gap-1 text-primary font-medium mb-1.5"><Lightbulb className="h-3 w-3" />Oportunidades</p>
                  {(item.opportunities ?? []).map((o) => <p key={o} className="text-muted-foreground mb-0.5">• {o}</p>)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-card/50 border-border/60">
          <CardHeader><CardTitle className="text-base">Roadmap Recomendado — Q3 2026</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { q: 'Q3 W1-4', item: 'Completar Event Catalog con ownership y mappings', priority: 'Alta' },
              { q: 'Q3 W5-8', item: 'Lanzar Report Discovery Assistant a toda la org', priority: 'Alta' },
              { q: 'Q3 W9-12', item: 'Framework de experimentación + GA4 integration', priority: 'Media' },
            ].map((r) => (
              <div key={r.item} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/20">
                <Badge variant="outline" className="text-[10px] shrink-0">{r.q}</Badge>
                <p className="text-sm flex-1">{r.item}</p>
                <Badge variant="secondary" className="text-[10px]">{r.priority}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
