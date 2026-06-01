import { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { articleCategoryLabels } from '@/lib/constants';
import { ArrowRight, BookOpen, Lightbulb, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Base de conocimiento',
  description: 'Artículos, guías, buenas prácticas y casos de uso de analytics.',
};

const categoryIcons: Record<string, React.ReactNode> = {
  guide: <BookOpen className="h-4 w-4" />,
  best_practice: <Lightbulb className="h-4 w-4" />,
  use_case: <FileText className="h-4 w-4" />,
  reference: <BookOpen className="h-4 w-4" />,
};

export default async function KnowledgeBasePage() {
  const supabase = await createClient();
  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  return (
    <>
      <PageHeader
        badge="Base de conocimiento"
        title="Base de conocimiento de analytics"
        description="Wiki técnica con guías, mejores prácticas y casos de uso para equipos de analytics."
      />

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(articles ?? []).map((article) => (
            <Link key={article.id} href={`/knowledge-base/${article.slug}`}>
              <Card className="h-full bg-card/50 border-border/60 hover:border-primary/30 transition-all group">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs gap-1">
                      {categoryIcons[article.category]}
                      {articleCategoryLabels[article.category] ?? article.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-base mt-3 group-hover:text-primary transition-colors">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">{article.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(article.tags ?? []).map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                    ))}
                  </div>
                  <span className="text-sm text-primary flex items-center gap-1">
                    Leer artículo <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {(!articles || articles.length === 0) && (
          <p className="text-center text-muted-foreground py-12">
            Artículos disponibles tras configurar Supabase con las migraciones incluidas.
          </p>
        )}
      </Section>
    </>
  );
}
