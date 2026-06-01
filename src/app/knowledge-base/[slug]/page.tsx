import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { ArrowLeft } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('articles').select('title, excerpt').eq('slug', slug).single();
  return { title: data?.title ?? 'Artículo', description: data?.excerpt ?? undefined };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: article } = await supabase.from('articles').select('*').eq('slug', slug).single();

  if (!article) notFound();

  return (
    <>
      <PageHeader badge="Base de conocimiento" title={article.title} description={article.excerpt ?? undefined}>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/knowledge-base"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Link>
        </Button>
      </PageHeader>

      <Section>
        <div className="max-w-3xl">
          <div className="flex flex-wrap gap-2 mb-8">
            {(article.tags ?? []).map((tag: string) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {article.content}
          </div>
        </div>
      </Section>
    </>
  );
}
