import { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/server';
import { playbookCategories } from '@/lib/constants';
import { BarChart2, Tag, Layers, Database, PieChart, CheckCircle2, ArrowRight } from 'lucide-react';
import type { PlaybookCategory } from '@/types/database';

export const metadata: Metadata = {
  title: 'Playbooks de analytics',
  description: 'Guías de implementación para GA4, GTM, capa de datos, BigQuery, Looker Studio y QA.',
};

const categoryIcons: Record<PlaybookCategory, React.ReactNode> = {
  ga4: <BarChart2 className="h-5 w-5" />,
  gtm: <Tag className="h-5 w-5" />,
  data_layer: <Layers className="h-5 w-5" />,
  bigquery: <Database className="h-5 w-5" />,
  looker_studio: <PieChart className="h-5 w-5" />,
  qa: <CheckCircle2 className="h-5 w-5" />,
};

export default async function PlaybooksPage() {
  const supabase = await createClient();
  const { data: playbooks } = await supabase
    .from('playbooks')
    .select('*')
    .eq('is_published', true)
    .order('sort_order');

  return (
    <>
      <PageHeader
        badge="Playbooks"
        title="Playbooks de analytics"
        description="Estándares de implementación y mejores prácticas para cada capa de tu stack analítico."
      />

      <Section>
        <div className="flex flex-wrap gap-2 mb-10">
          {playbookCategories.map((cat) => (
            <Badge key={cat.value} variant="outline" className="border-primary/30">
              {cat.label}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(playbooks ?? []).map((playbook) => (
            <Link key={playbook.id} href={`/playbooks/${playbook.slug}`}>
              <Card className="h-full bg-card/50 border-border/60 hover:border-primary/30 transition-all group">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {categoryIcons[playbook.category as PlaybookCategory]}
                    </div>
                    <Badge variant="secondary" className="text-xs">v{playbook.version}</Badge>
                  </div>
                  <CardTitle className="text-base mt-4 group-hover:text-primary transition-colors">
                    {playbook.title}
                  </CardTitle>
                  <CardDescription>{playbook.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm text-primary flex items-center gap-1">
                    Ver playbook <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {(!playbooks || playbooks.length === 0) && (
          <p className="text-center text-muted-foreground py-12">
            Playbooks disponibles tras configurar Supabase. Ejecuta las migraciones incluidas.
          </p>
        )}
      </Section>
    </>
  );
}
