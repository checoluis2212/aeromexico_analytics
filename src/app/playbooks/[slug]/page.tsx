import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('playbooks').select('title, description').eq('slug', slug).single();
  return { title: data?.title ?? 'Playbook', description: data?.description ?? undefined };
}

export default async function PlaybookDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: playbook } = await supabase.from('playbooks').select('*').eq('slug', slug).single();

  if (!playbook) notFound();

  const steps = (playbook.steps ?? []) as { title: string; description: string }[];
  const checklist = (playbook.checklist ?? []) as string[];

  return (
    <>
      <PageHeader badge={playbook.category.toUpperCase()} title={playbook.title} description={playbook.description ?? undefined}>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/playbooks"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Link>
        </Button>
      </PageHeader>

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 prose prose-invert prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {playbook.content}
            </div>
          </div>
          <div className="space-y-6">
            {steps.length > 0 && (
              <div className="rounded-xl border border-border/60 bg-card/30 p-6">
                <h3 className="font-semibold mb-4">Fases</h3>
                <div className="space-y-4">
                  {steps.map((step, i) => (
                    <div key={step.title} className="flex gap-3">
                      <span className="text-xs font-bold text-primary">{String(i + 1).padStart(2, '0')}</span>
                      <div>
                        <p className="text-sm font-medium">{step.title}</p>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {checklist.length > 0 && (
              <div className="rounded-xl border border-border/60 bg-card/30 p-6">
                <h3 className="font-semibold mb-4">Checklist</h3>
                <ul className="space-y-2">
                  {checklist.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-radar shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
                <Badge variant="outline">Versión {playbook.version}</Badge>
          </div>
        </div>
      </Section>
    </>
  );
}
