import { Metadata } from 'next';
import Link from 'next/link';
import { Section } from '@/components/layout/section';
import { Button } from '@/components/ui/button';
import { slas, siteConfig } from '@/lib/constants';
import { ArrowRight, MessageSquare, Calendar, Rocket, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cómo trabajo',
  description: 'Pide lo que quieras a Sergio Burgos — Growth & Analytics Metrics en Aeroméxico.',
};

const steps = [
  {
    icon: MessageSquare,
    title: 'Cuéntame qué quieres',
    desc: 'Formulario corto: métrica, dashboard, evento GTM, embudo — lo que sea.',
  },
  {
    icon: Calendar,
    title: 'Te respondo con un plan',
    desc: 'Fecha, pasos y si hace falta una sesión para revisar el data layer juntos.',
  },
  {
    icon: Rocket,
    title: 'Lo hacemos en pareja',
    desc: 'Tú implementas, yo reviso. Así aprendes GA4, GTM y BigQuery con casos reales de Aeroméxico.',
  },
];

const helpfulInfo = [
  '¿Qué decisión de negocio quieres tomar?',
  '¿Qué propiedad GA4, app o flujo de Aeroméxico?',
  '¿Qué data layer o página está involucrado?',
  '¿Para cuándo lo necesitas?',
];

const faqs = [
  {
    q: '¿Qué herramientas manejamos?',
    a: 'GA4, Google Tag Manager, BigQuery y Looker Studio — siempre sobre los data layers definidos para Aeroméxico.',
  },
  {
    q: '¿Cuánto tarda en estar listo?',
    a: 'Un tag puede ser el mismo día. Un dashboard o mart en BigQuery, unos días. Te doy fecha antes de empezar.',
  },
  {
    q: '¿Tengo que saber programar?',
    a: 'No hace falta ser dev. Con GTM, DebugView y algo de SQL en BigQuery vamos bien — te enseño sobre la marcha.',
  },
  {
    q: '¿Qué pasa cuando termina?',
    a: 'Queda documentado en el catálogo de eventos o playbooks. Si algo se rompe después, lo vemos.',
  },
];

const priorityStyle: Record<string, string> = {
  Urgente: 'border-destructive/40 text-destructive bg-destructive/5',
  Importante: 'border-signal/40 text-signal bg-signal/5',
  Normal: 'border-primary/40 text-primary bg-primary/5',
  'Sin prisa': 'border-border text-muted-foreground bg-secondary/30',
};

export default function WorkingWithMePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative border-b border-border/40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-20 text-center">
          <p className="text-xs text-primary font-medium mb-4">{siteConfig.org} · {siteConfig.role}</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
            Simple. Claro.{' '}
            <span className="gradient-text">Sin complicaciones.</span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Pídeme lo que necesites en analytics y growth en {siteConfig.org} —
            sin tickets eternos ni jerga innecesaria.
          </p>
          <Button size="lg" asChild className="mt-8 glow-aero">
            <Link href="/request-center">
              Pedir a Sergio
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Steps */}
      <Section title="En 3 pasos" description="Así de fácil es empezar.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="relative rounded-xl border border-border/40 bg-card/20 p-5 hover:border-primary/20 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                  <s.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground font-mono">0{i + 1}</span>
              </div>
              <h3 className="text-sm font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* What helps */}
      <Section
        title="Lo que me ayuda saber"
        description="No hace falta tenerlo todo — pero cuanto más contexto, más rápido avanzamos."
        className="border-y border-border/30 bg-card/10"
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

      {/* SLAs as cards */}
      <Section title="Tiempos de respuesta" description="Para que sepas qué esperar — sin sorpresas.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
          {slas.map((sla) => (
            <div
              key={sla.priority}
              className={`rounded-xl border p-4 ${priorityStyle[sla.priority] ?? ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">{sla.priority}</span>
                <span className="text-xs flex items-center gap-1 opacity-80">
                  <Clock className="h-3 w-3" />
                  {sla.response}
                </span>
              </div>
              <p className="text-xs opacity-80 leading-relaxed">{sla.description}</p>
              <p className="text-[11px] mt-2 opacity-60">Resuelto: {sla.resolution}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">
          Horario habitual: Lun–Vie, 9:00–18:00 CET · Urgencias fuera de horario si algo se rompe en producción
        </p>
      </Section>

      {/* FAQs */}
      <Section title="Preguntas frecuentes" className="border-t border-border/30 bg-card/10">
        <div className="space-y-3 max-w-2xl mx-auto">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-xl border border-border/40 bg-card/20 overflow-hidden"
            >
              <summary className="px-5 py-4 text-sm font-medium cursor-pointer list-none flex items-center justify-between hover:bg-secondary/20 transition-colors">
                {faq.q}
                <span className="text-muted-foreground group-open:rotate-45 transition-transform text-lg leading-none">+</span>
              </summary>
              <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="py-16 text-center">
        <p className="text-muted-foreground text-sm mb-4">¿Listo para empezar?</p>
        <Button size="lg" asChild className="glow-aero">
          <Link href="/request-center">
            Pedir a Sergio
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>
    </>
  );
}
