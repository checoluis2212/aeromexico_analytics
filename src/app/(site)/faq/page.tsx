import Link from 'next/link';
import { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { FaqList } from '@/components/faq/faq-list';
import { Button } from '@/components/ui/button';
import { pedirHubHref } from '@/lib/ai/assistant-modes';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Preguntas frecuentes',
  description: 'Casos de uso en Aeroméxico, cómo pedir, tiempos y referencia técnica si la necesitas.',
};

export default function FaqPage() {
  return (
    <>
      <PageHeader
        badge="FAQ"
        title="Preguntas frecuentes"
        description="Situaciones reales en Aeroméxico — checkout, campañas, números que no cuadran — y cómo pedir ayuda."
      />

      <Section className="py-8 sm:py-12" containerClassName="max-w-6xl">
        <FaqList />

        <div className="mt-10 max-w-2xl mx-auto text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            ¿Prefieres charlar primero?{' '}
            <Link href={pedirHubHref()} className="text-primary hover:underline">
              Pregúntale (copiloto) →
            </Link>
            {' · '}
            <Link href="/glosario" className="text-primary hover:underline">
              Glosario
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">
            ¿Quieres ver tiempos por urgencia?{' '}
            <Link href="/working-with-me#tiempos-respuesta" className="text-primary hover:underline">
              Cómo trabajo →
            </Link>
          </p>
          <Button asChild className="mt-2">
            <Link href="/pedir">
              Pedir con IA
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
