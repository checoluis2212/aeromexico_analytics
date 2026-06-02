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
  Plane,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Section, FeatureCard } from '@/components/layout/section';
import { services, principles, analyticsStack, siteConfig } from '@/lib/constants';

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
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-15" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
          <div className="max-w-2xl">
            <Badge variant="outline" className="mb-5 border-primary/30 text-primary gap-1.5">
              <Plane className="h-3 w-3" />
              {siteConfig.tagline}
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.12]">
              Pide lo que quieras a{' '}
              <span className="gradient-text">Sergio</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              Soy <strong className="text-foreground font-medium">Sergio Burgos</strong>, {siteConfig.role} en {siteConfig.org}.
              Dashboard, métrica de growth, evento GTM, embudo o duda de datos — cuéntame en 2 minutos.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild className="glow-aero">
                <Link href="/request-center">
                  Pedir a Sergio
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/working-with-me">Cómo trabajamos</Link>
              </Button>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap gap-2">
            {analyticsStack.map((tool) => (
              <span
                key={tool.short}
                className="text-xs px-3 py-1.5 rounded-full border border-border/50 bg-card/30 text-muted-foreground"
              >
                {tool.name}
              </span>
            ))}
            <span className="text-xs px-3 py-1.5 rounded-full border border-primary/25 bg-primary/5 text-primary">
              Data layers AM
            </span>
          </div>
        </div>
      </section>

      <Section
        title="En qué te ayudo"
        description="Growth, analytics y métricas en Aeroméxico — sin perderse en la herramienta."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

      <Section
        title="Cómo pienso el trabajo"
        description="Reglas simples para un programa de analytics sólido en una aerolínea global."
        className="bg-card/10 border-y border-border/30"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
          {principles.map((principle, i) => (
            <div key={principle.title} className="flex gap-4 p-4 rounded-xl border border-border/40 bg-card/20">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                {i + 1}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{principle.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{principle.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section className="text-center">
        <div className="mx-auto max-w-xl">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">¿Qué necesitas hoy?</h2>
          <p className="mt-3 text-muted-foreground text-sm">
            Escríbeme lo que quieras. Sin login, sin complicaciones.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/request-center">
                Pedir a Sergio
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/command-center/executive">Centro Analytics</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-5 text-xs text-muted-foreground">
            {['Sin login', '2 minutos', 'Sergio te responde directo'].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-radar" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
