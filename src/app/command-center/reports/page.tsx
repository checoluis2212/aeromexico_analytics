import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { CommandCenterTopBar } from '@/components/command-center/top-bar';
import { CommandCenterPageContent } from '@/components/command-center/command-center-page-content';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { REPORT_CATEGORIES } from '@/types/command-center';
import type { Report } from '@/types/command-center';
import { ExternalLink, Eye, Star } from 'lucide-react';

export const metadata = { title: 'Reportes' };

export default async function ReportMarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from('reports').select('*').eq('is_published', true).order('popularity_score', { ascending: false });
  if (category) query = query.eq('category', category);

  const { data: reports } = await query;

  return (
    <>
      <CommandCenterTopBar
        title="Reportes"
        subtitle="Dashboards publicados — si falta algo, pídemelo"
      />

      <CommandCenterPageContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/command-center/reports">
            <Badge variant={!category ? 'default' : 'outline'} className="cursor-pointer text-xs">Todos</Badge>
          </Link>
          {REPORT_CATEGORIES.map((c) => (
            <Link key={c.value} href={`/command-center/reports?category=${c.value}`}>
              <Badge variant={category === c.value ? 'default' : 'outline'} className="cursor-pointer text-xs">
                {c.label}
              </Badge>
            </Link>
          ))}
          <Link href="/pedir" className="ml-auto">
            <Button variant="outline" size="sm" className="text-xs h-7">
              Pedir un reporte
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {(reports as Report[] ?? []).map((report) => (
            <Card key={report.id} className="bg-card/30 border-border/40 hover:border-primary/25 transition-all group">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className="text-[10px] capitalize">{report.category.replace('_', ' ')}</Badge>
                  <div className="flex items-center gap-1 text-xs text-signal">
                    <Star className="h-3 w-3 fill-current" />
                    {report.popularity_score}
                  </div>
                </div>
                <CardTitle className="text-base mt-2 group-hover:text-primary transition-colors">{report.title}</CardTitle>
                <CardDescription className="line-clamp-2">{report.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1.5">Responde preguntas como:</p>
                  <ul className="space-y-1">
                    {report.business_questions.slice(0, 2).map((q) => (
                      <li key={q} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-primary mt-0.5">•</span>{q}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{report.data_source}</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{report.view_count.toLocaleString()}</span>
                </div>
                {report.dashboard_url && (
                  <Button size="sm" className="w-full" asChild>
                    <a href={report.dashboard_url} target="_blank" rel="noopener noreferrer">
                      Abrir dashboard <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {(!reports || reports.length === 0) && (
          <p className="text-center text-muted-foreground py-12">
            Aún no hay reportes publicados.{' '}
            <Link href="/pedir" className="text-primary hover:underline">
              Cuéntame qué necesitas
            </Link>
            .
          </p>
        )}
      </CommandCenterPageContent>
    </>
  );
}
