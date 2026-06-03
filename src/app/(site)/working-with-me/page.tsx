import { Metadata } from 'next';
import Link from 'next/link';
import { Section } from '@/components/layout/section';
import { AvailabilityHeroBlock } from '@/components/availability/availability-hero-block';
import { WorkingWithMeSteps } from '@/components/working-with-me/working-with-me-steps';
import { ResponseTimeCards } from '@/components/working-with-me/response-time-cards';
import { WorkingWithMeCta } from '@/components/working-with-me/working-with-me-cta';
import { getSergioAvailability } from '@/lib/availability';
import { siteConfig } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Cómo trabajo',
  description: 'Así trabajo contigo en analytics y métricas en Aeroméxico.',
};

const helpfulInfo = [
  '¿Qué quieres responder o decidir con este dato?',
  '¿En qué parte pasa? (web, app, checkout, GA4, etc.)',
  '¿Qué cambió recientemente, si algo cambió?',
  '¿Para cuándo lo necesitas (aprox.)?',
];

export default async function WorkingWithMePage() {
  const availability = await getSergioAvailability();

  return (
    <>
      <section className="relative border-b border-border/40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20 text-center">
          <p className="text-xs text-primary font-medium mb-4">{siteConfig.org} · {siteConfig.role}</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
            Cómo trabajo en{' '}
            <span className="gradient-text">{siteConfig.org}</span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Tiempos de respuesta, prioridades y qué conviene mandarme por el portal.
            Apoyo a Growth, Marketing, Producto y E-commerce.
          </p>
          <div className="mt-6 flex justify-center px-2">
            <AvailabilityHeroBlock availability={availability} className="max-w-md w-full" centered />
          </div>
          <div className="mt-8">
            <WorkingWithMeCta />
          </div>
        </div>
      </section>

      <Section
        title="En 3 pasos"
        description="Del pedido a la entrega."
        className="py-8 sm:py-12"
        containerClassName="max-w-6xl"
      >
        <WorkingWithMeSteps />
      </Section>

      <Section
        title="Lo que me ayuda saber"
        description="No hace falta tenerlo todo — pero cuanto más contexto, más rápido avanzamos."
        className="py-8 sm:py-12 border-y border-border/30 bg-card/10"
        containerClassName="max-w-6xl"
      >
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
          {helpfulInfo.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2.5 text-sm text-muted-foreground px-4 py-3 rounded-lg border border-border/30 bg-background/40"
            >
              <span className="text-primary mt-0.5">→</span>
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="tiempos-respuesta"
        title="¿Cuánto me tardo?"
        description="Referencia por urgencia — suelo ir más rápido que el máximo."
        className="py-8 sm:py-12 border-y border-border/30 bg-card/10"
        containerClassName="max-w-6xl"
      >
        <ResponseTimeCards />
        <p className="text-center text-xs text-muted-foreground/80 mt-6 max-w-md mx-auto leading-relaxed">
          Lun–Vie 9:00–18:00 CET · fuera de horario solo si algo se rompe en producción
        </p>
      </Section>

      <Section
        className="py-8 sm:py-12 border-t border-border/30 bg-card/10 text-center"
        containerClassName="max-w-6xl"
      >
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          ¿Más dudas?{' '}
          <Link href="/faq" className="text-primary hover:underline">
            FAQ
          </Link>
          {' · '}
          <Link href="/glosario" className="text-primary hover:underline">
            Glosario
          </Link>
        </p>
      </Section>

      <section className="py-16 text-center">
        <p className="text-muted-foreground text-sm mb-4">Manda un pedido cuando lo necesites</p>
        <WorkingWithMeCta />
      </section>
    </>
  );
}
