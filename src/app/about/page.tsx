import { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { Section, FeatureCard } from '@/components/layout/section';
import { principles } from '@/lib/constants';
import { Compass, Users, Lightbulb, Award } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sobre mí',
  description: 'Filosofía de trabajo, principios de analytics y valores profesionales.',
};

const collaborationSteps = [
  { title: 'Llamada de discovery', description: 'Entiendo tu contexto de negocio, stakeholders y objetivos de medición.' },
  { title: 'Plan de medición', description: 'Documento colaborativo con KPIs, eventos, ownership y cronograma.' },
  { title: 'Implementación', description: 'Ejecución técnica con checkpoints de validación y comunicación continua.' },
  { title: 'QA y entrega', description: 'Validación end-to-end, documentación y transferencia de conocimiento.' },
  { title: 'Soporte continuo', description: 'Soporte post-lanzamiento con SLAs definidos y mejora continua.' },
];

const values = [
  { title: 'Transparencia', description: 'Comunicación clara sobre alcance, plazos y trade-offs.', icon: <Compass className="h-5 w-5" /> },
  { title: 'Colaboración', description: 'Trabajo integrado con tus equipos de producto, marketing y data.', icon: <Users className="h-5 w-5" /> },
  { title: 'Excelencia técnica', description: 'Implementaciones que pasan auditorías y escalan sin deuda técnica.', icon: <Award className="h-5 w-5" /> },
  { title: 'Impacto medible', description: 'Cada entregable conectado a una decisión de negocio concreta.', icon: <Lightbulb className="h-5 w-5" /> },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        badge="Sobre mí"
        title="Filosofía de analytics"
        description="Creo en analytics como función estratégica, no como tarea técnica. Mi trabajo conecta datos con decisiones."
      />

      <Section title="Principios de analytics">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {principles.map((p) => (
            <FeatureCard key={p.title} title={p.title} description={p.description} />
          ))}
        </div>
      </Section>

      <Section
        title="Cómo colaboro"
        description="Proceso estructurado que minimiza fricción y maximiza impacto."
        className="bg-card/20 border-y border-border/40"
      >
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border hidden md:block" />
          <div className="space-y-8">
            {collaborationSteps.map((step, i) => (
              <div key={step.title} className="relative flex gap-6 md:pl-12">
                <div className="absolute left-0 hidden md:flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold ring-4 ring-background">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Valores profesionales">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v) => (
            <FeatureCard key={v.title} title={v.title} description={v.description} icon={v.icon} />
          ))}
        </div>
      </Section>
    </>
  );
}
