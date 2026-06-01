import { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Section, FeatureCard } from '@/components/layout/section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { aosModules } from '@/lib/constants';
import {
  ArrowRight,
  Layers,
  Shield,
  BarChart3,
  Users,
  Calendar,
  Target,
  GitBranch,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sistema Operativo de Analytics',
  description: 'Framework premium de consultoría senior en estrategia de analytics y datos.',
};

const pillars = [
  {
    title: 'Capa de estrategia',
    description: 'Marcos de medición, árboles de KPIs y mapeo de preguntas de negocio.',
    icon: <Target className="h-5 w-5" />,
  },
  {
    title: 'Capa de gobernanza',
    description: 'Roles, ownership, gestión de cambios y estándares de calidad de datos.',
    icon: <Shield className="h-5 w-5" />,
  },
  {
    title: 'Capa de arquitectura',
    description: 'GA4, GTM, BigQuery, Looker — diseñados como sistema integrado.',
    icon: <Layers className="h-5 w-5" />,
  },
  {
    title: 'Capa operativa',
    description: 'Cadencia operativa, respuesta a incidentes y mejora continua.',
    icon: <Calendar className="h-5 w-5" />,
  },
];

export default function AnalyticsOSPage() {
  return (
    <>
      <PageHeader
        badge="Premium"
        title="Sistema Operativo de Analytics"
        description="No soy un implementador de tags. Soy un arquitecto de sistemas de medición que escalan con tu negocio."
      >
        <Button asChild>
          <Link href="/request-center">
            Solicitar acceso
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </PageHeader>

      <Section title="El problema que resuelvo">
        <div className="max-w-3xl">
          <p className="text-muted-foreground leading-relaxed">
            La mayoría de organizaciones tratan analytics como un proyecto técnico: instalar GA4,
            configurar tags, crear un dashboard. El resultado: datos sin contexto, equipos sin ownership
            y decisiones tomadas con métricas vanidosas.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            El <strong className="text-foreground">Sistema Operativo de Analytics</strong> es un framework
            completo que transforma analytics de función técnica a capacidad estratégica de la organización.
          </p>
        </div>
      </Section>

      <Section
        title="4 capas del AOS"
        className="bg-card/20 border-y border-border/40"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p) => (
            <FeatureCard key={p.title} title={p.title} description={p.description} icon={p.icon} />
          ))}
        </div>
      </Section>

      <Section title="Módulos">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {aosModules.map((mod) => (
            <Card key={mod.title} className="bg-card/50 border-border/60 hover:border-primary/30 transition-all">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{mod.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{mod.description}</p>
                  </div>
                  <Badge variant={mod.status === 'Premium' ? 'default' : 'outline'} className="shrink-0">
                    {mod.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        title="Posicionamiento"
        className="bg-card/20 border-y border-border/40"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-xl font-bold mb-4">Implementador vs. arquitecto</h3>
            <div className="space-y-4">
              {[
                { label: 'Implementador', items: ['Instala tags', 'Configura dashboards', 'Responde tickets', 'Entrega puntual'] },
                { label: 'Arquitecto de analytics (AOS)', items: ['Diseña estrategia de medición', 'Construye gobernanza', 'Habilita equipos', 'Escala el programa'] },
              ].map((col) => (
                <div key={col.label} className="p-4 rounded-lg border border-border/60 bg-card/30">
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-primary" />
                    {col.label}
                  </p>
                  <ul className="space-y-1">
                    {col.items.map((item) => (
                      <li key={item} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-8 glow-aero">
            <BarChart3 className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-lg font-bold">Evaluación de madurez</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Evalúo tu organización en 4 dimensiones: personas, procesos, tecnología y cultura.
              Entrego un roadmap de 12 meses con quick wins y transformaciones estructurales.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/contact">Agendar evaluación</Link>
            </Button>
          </div>
        </div>
      </Section>

      <Section>
        <div className="text-center max-w-2xl mx-auto">
          <Users className="h-8 w-8 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Capacitación de equipos</h2>
          <p className="text-muted-foreground mt-3">
            Capacito a tus equipos para que el programa de analytics sea sostenible sin dependencia externa permanente.
          </p>
        </div>
      </Section>
    </>
  );
}
