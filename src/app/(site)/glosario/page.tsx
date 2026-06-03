import Link from 'next/link';
import { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { Button } from '@/components/ui/button';
import { analyticsGlossary, glossaryCategoryLabels } from '@/lib/glossary';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Glosario',
  description: 'Definiciones de GA4, GTM y medición en Aeroméxico.',
};

const categoryOrder = ['basics', 'tools', 'tracking'] as const;

export default function GlosarioPage() {
  const grouped = categoryOrder.map((cat) => ({
    category: cat,
    label: glossaryCategoryLabels[cat],
    items: analyticsGlossary.filter((g) => g.category === cat),
  }));

  return (
    <>
      <PageHeader
        badge="Referencia"
        title="Glosario"
        description="Definiciones cortas de GA4, GTM y medición que usamos en el día a día."
      />

      <Section className="py-8 sm:py-12" containerClassName="max-w-6xl">
        <div className="max-w-2xl mx-auto space-y-10">
          {grouped.map(({ category, label, items }) => (
            <div key={category}>
              <h2 className="text-sm font-semibold text-primary mb-3">{label}</h2>
              <div className="grid gap-3">
                {items.map((g) => (
                  <div
                    key={g.term}
                    className="rounded-xl border border-border/50 bg-card/40 px-5 py-4"
                  >
                    <p className="text-sm font-semibold">{g.term}</p>
                    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{g.def}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Si ya sabes qué pedir, manda el formulario.
          </p>
          <Button asChild>
            <Link href="/pedir">
              Pedir trabajo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
