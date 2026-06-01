import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { CommandCenterTopBar } from '@/components/command-center/top-bar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, FileText, Shield, Database, BarChart2, Tag } from 'lucide-react';

export const metadata = { title: 'Knowledge Hub' };

const DOC_SECTIONS = [
  { title: 'GA4', icon: BarChart2, count: 12 },
  { title: 'GTM', icon: Tag, count: 8 },
  { title: 'BigQuery', icon: Database, count: 15 },
  { title: 'Looker Studio', icon: BookOpen, count: 6 },
  { title: 'Measurement Plans', icon: FileText, count: 4 },
  { title: 'Governance & QA', icon: Shield, count: 9 },
];

export default async function KnowledgeHubPage() {
  const supabase = await createClient();
  const { data: articles } = await supabase
    .from('articles')
    .select('id, slug, title, excerpt, category, tags, version')
    .eq('is_published', true)
    .order('updated_at', { ascending: false });

  return (
    <>
      <CommandCenterTopBar
        title="Analytics Knowledge Hub"
        subtitle="Documentación tipo Notion · Versionado · Best Practices"
      />

      <div className="p-6 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {DOC_SECTIONS.map((s) => (
            <Card key={s.title} className="bg-card/50 border-border/60 hover:border-primary/30 transition-all cursor-pointer">
              <CardContent className="pt-4 text-center">
                <s.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-xs font-medium">{s.title}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{s.count} docs</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(articles ?? []).map((article) => (
            <Link key={article.id} href={`/knowledge-base/${article.slug}`}>
              <Card className="h-full bg-card/50 border-border/60 hover:border-primary/30 transition-all">
                <CardHeader>
                  <Badge variant="outline" className="text-[10px] w-fit">{article.category}</Badge>
                  <CardTitle className="text-base mt-2">{article.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{article.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {(article.tags ?? []).slice(0, 2).map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-[9px]">{tag}</Badge>
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground">v{article.version ?? 1}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
