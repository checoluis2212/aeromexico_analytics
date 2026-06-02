import { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { Section, FeatureCard } from '@/components/layout/section';
import { principles, analyticsStack, siteConfig } from '@/lib/constants';
import { Compass, Users, Award, GraduationCap, Plane } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sobre mí',
  description: 'Sergio Burgos — Growth & Analytics Metrics Specialist en Aeroméxico.',
};

const collaborationSteps = [
  { title: 'Entendemos el contexto', description: 'Qué equipo lo pide, qué decisión de negocio hay detrás y qué propiedad GA4 o data layer toca.' },
  { title: 'Plan claro', description: 'Eventos, tags, queries o dashboard — con fecha y pasos que puedas seguir.' },
  { title: 'Implementamos juntos', description: 'Tú ejecutas con mi revisión: GTM Preview, DebugView, queries en BQ, Looker conectado.' },
  { title: 'Validamos y documentamos', description: 'QA, catálogo de eventos actualizado y handoff para que no quede dependencia.' },
];

const values = [
  { title: 'Claridad', description: 'Te explico el porqué, no solo el cómo.', icon: <Compass className="h-5 w-5" /> },
  { title: 'Trabajo en pareja', description: 'No hago todo a puerta cerrada — aprendes mientras avanzamos.', icon: <Users className="h-5 w-5" /> },
  { title: 'Estándares Aeroméxico', description: 'Naming, data layers y gobernanza alineados al programa corporativo.', icon: <Award className="h-5 w-5" /> },
  { title: 'Tu crecimiento', description: 'El objetivo es que cada mes necesites menos hand-holding.', icon: <GraduationCap className="h-5 w-5" /> },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        badge={siteConfig.tagline}
        title="Hola, soy Sergio Burgos"
        description="Growth & Analytics Metrics Specialist en Aeroméxico. Métricas de conversión, adquisición, revenue, GA4, GTM, BigQuery y Looker Studio — sobre los data layers del negocio aéreo."
      />

      <Section title="Mi stack">
        <div className="flex flex-wrap gap-2 mb-6">
          {analyticsStack.map((t) => (
            <span key={t.short} className="text-sm px-4 py-2 rounded-lg border border-border/50 bg-card/30">
              {t.name}
            </span>
          ))}
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Trabajo sobre los <strong className="text-foreground font-medium">data layers específicos de Aeroméxico</strong> —
          web, app, e-commerce, marketing. Todo lo que medimos sale de ahí y se valida en GA4, se exporta a BigQuery
          y se presenta en Looker Studio para los equipos que toman decisiones.
        </p>
      </Section>

      <Section title="En qué creo">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {principles.map((p) => (
            <FeatureCard key={p.title} title={p.title} description={p.description} />
          ))}
        </div>
      </Section>

      <Section
        title="Cómo trabajamos"
        description="Pensado para un intern que quiere aprender rápido sin ahogarse."
        className="bg-card/10 border-y border-border/30"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
          {collaborationSteps.map((step, i) => (
            <div key={step.title} className="p-4 rounded-xl border border-border/40 bg-card/20">
              <span className="text-xs text-primary font-mono">0{i + 1}</span>
              <h3 className="font-semibold text-sm mt-1">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Lo que puedes esperar de mí">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
          {values.map((v) => (
            <div key={v.title} className="flex gap-3 p-4 rounded-xl border border-border/40">
              <div className="text-primary shrink-0">{v.icon}</div>
              <div>
                <h3 className="font-semibold text-sm">{v.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{v.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section className="text-center pb-16">
        <Plane className="h-8 w-8 text-primary/40 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Este portal es nuestro espacio de trabajo — solicitudes, playbooks, catálogo de eventos y el Command Center
          para cuando el equipo crezca.
        </p>
      </Section>
    </>
  );
}
