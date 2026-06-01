import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Code2,
  Database,
  ShieldCheck,
  Sparkles,
  Target,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Section, FeatureCard } from '@/components/layout/section';
import { services, principles, maturityStages, siteConfig } from '@/lib/constants';

const iconMap: Record<string, React.ReactNode> = {
  Target: <Target className="h-5 w-5" />,
  Code2: <Code2 className="h-5 w-5" />,
  Database: <Database className="h-5 w-5" />,
  BarChart3: <BarChart3 className="h-5 w-5" />,
  ShieldCheck: <ShieldCheck className="h-5 w-5" />,
  Sparkles: <Sparkles className="h-5 w-5" />,
};

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-6 border-primary/30 text-primary">
              {siteConfig.tagline}
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              Decisiones de negocio{' '}
              <span className="gradient-text">respaldadas por datos</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Consultoría senior en analytics y datos. Diseño estrategias de medición,
              implemento arquitecturas escalables y gobierno programas de analytics enterprise.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button size="lg" asChild className="glow-aero">
                <Link href="/request-center">
                  Solicitar consultoría
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/analytics-os">Sistema Operativo de Analytics</Link>
              </Button>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { label: 'GA4 + GTM', value: 'Enterprise' },
              { label: 'BigQuery', value: 'Pipelines' },
              { label: 'Gobernanza', value: 'Integrada' },
              { label: 'Insights IA', value: 'Automatizado' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg border border-border/60 bg-card/30 p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="mt-1 text-lg font-semibold text-primary">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Qué hago */}
      <Section
        title="Qué hago"
        description="No implemento tags. Construyo sistemas de medición que escalan con tu negocio."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <FeatureCard
              key={service.title}
              title={service.title}
              description={service.description}
              icon={iconMap[service.icon]}
            />
          ))}
        </div>
      </Section>

      {/* Mi enfoque */}
      <Section
        title="Mi enfoque"
        description="Metodología probada en programas de analytics enterprise."
        className="bg-card/20 border-y border-border/40"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            {principles.map((principle, i) => (
              <div key={principle.title} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold">{principle.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{principle.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border/60 bg-card/50 p-8 glow-aero">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Ruta de madurez analítica</span>
            </div>
            <div className="space-y-4">
              {maturityStages.map((stage, i) => (
                <div key={stage} className="flex items-center gap-3">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${(i + 1) * 25}%`, opacity: 0.3 + i * 0.23 }}
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{stage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section className="text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight">¿Listo para elevar tu analytics?</h2>
          <p className="mt-4 text-muted-foreground">
            Desde auditorías rápidas hasta programas completos de estrategia de medición.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/request-center">
                Enviar solicitud
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/working-with-me">Cómo trabajo</Link>
            </Button>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            {['SLAs de respuesta definidos', 'Documentación incluida', 'QA riguroso'].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-radar" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
