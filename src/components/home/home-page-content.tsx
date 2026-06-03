'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Code2,
  Database,
  HelpCircle,
  ListTree,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Section, FeatureCard } from '@/components/layout/section';
import { FadeIn, StaggerGrid, StaggerItem } from '@/components/ui/fade-in';
import { HomeStatsBar } from '@/components/home/home-stats-bar';
import { HomeStartPaths } from '@/components/home/home-start-paths';
import { AvailabilityHeroBlock } from '@/components/availability/availability-hero-block';
import type { SergioAvailability } from '@/lib/availability-config';
import { services, principles, analyticsStack, siteConfig } from '@/lib/constants';
import {
  aiAgentHref,
  aiAgentLoginRedirect,
  pedirLoginRedirect,
  solicitudFormHref,
} from '@/lib/ai/assistant-modes';
import { useAppRole } from '@/hooks/use-app-role';
import type { HomeStatsData } from '@/lib/home-stats';

const iconMap: Record<string, React.ReactNode> = {
  Target: <Target className="h-5 w-5" />,
  Code2: <Code2 className="h-5 w-5" />,
  Database: <Database className="h-5 w-5" />,
  BarChart3: <BarChart3 className="h-5 w-5" />,
  ShieldCheck: <ShieldCheck className="h-5 w-5" />,
  Sparkles: <Sparkles className="h-5 w-5" />,
};

const resources = [
  { href: '/event-catalog', label: 'Eventos GA4', hint: 'Qué medimos hoy', icon: ListTree },
  { href: '/working-with-me', label: 'Cómo trabajo', hint: 'Tiempos y prioridades', icon: BookOpen },
  { href: '/faq', label: 'FAQ', hint: 'Dudas comunes', icon: HelpCircle },
];

type Props = {
  availability: SergioAvailability;
  stats: HomeStatsData;
};

export function HomePageContent({ availability, stats }: Props) {
  const { isAuthenticated, loading: authLoading } = useAppRole();

  const formHref =
    !authLoading && isAuthenticated
      ? solicitudFormHref({ empezar: true })
      : pedirLoginRedirect();
  const agentHref =
    !authLoading && isAuthenticated ? aiAgentHref() : aiAgentLoginRedirect();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 grid-pattern opacity-10" aria-hidden />
        <div
          className="absolute top-0 right-0 h-[420px] w-[420px] rounded-full bg-primary/8 blur-3xl -translate-y-1/3 translate-x-1/4"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:items-start">
            <FadeIn>
              <p className="text-sm font-medium text-primary mb-3">{siteConfig.tagline}</p>
              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-[1.15]">
                Analytics y métricas en{' '}
                <span className="gradient-text">{siteConfig.org}</span>
              </h1>
              <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
                Soy <strong className="text-foreground font-medium">{siteConfig.author}</strong>,{' '}
                {siteConfig.role}. Armo dashboards, reviso embudos, implemento eventos y reviso cuando
                GA4 no coincide con otro sistema.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" asChild className="glow-aero">
                  <Link href={formHref}>
                    Pedir trabajo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-primary/25 bg-card/30">
                  <Link href={agentHref}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    AI Agent
                  </Link>
                </Button>
                {!authLoading && isAuthenticated && (
                  <Button size="lg" variant="ghost" asChild>
                    <Link href="/mis-pedidos">Mis pedidos</Link>
                  </Button>
                )}
              </div>

              <HomeStatsBar {...stats} />
            </FadeIn>

            <FadeIn delay={0.06}>
              <AvailabilityHeroBlock availability={availability} className="lg:mt-2" />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Empieza aquí */}
      <Section
        title="Empieza aquí"
        description="Formulario para pedir trabajo, o chat si solo tienes una duda."
        className="pb-12 sm:pb-16"
      >
        <FadeIn delay={0.05}>
          <HomeStartPaths
            isAuthenticated={isAuthenticated}
            authLoading={authLoading}
          />
        </FadeIn>
      </Section>

      {/* Servicios */}
      <Section
        className="bg-card/15 border-y border-border/40 py-14 sm:py-20"
        title="En qué te puedo ayudar"
        description="Lo que más llega por el portal."
      >
        <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <StaggerItem key={service.title}>
              <FeatureCard
                icon={iconMap[service.icon] ?? <Sparkles className="h-5 w-5" />}
                title={service.title}
                description={service.description}
              />
            </StaggerItem>
          ))}
        </StaggerGrid>
      </Section>

      {/* Principios */}
      <Section
        title="Cómo trabajo contigo"
        description="Cómo priorizo y cómo queda documentado el trabajo."
      >
        <StaggerGrid className="grid gap-5 sm:grid-cols-2 max-w-4xl">
          {principles.map((p, i) => (
            <StaggerItem key={p.title}>
              <div className="rounded-xl border border-border/50 bg-card/25 p-5 h-full">
                <span className="text-xs font-semibold text-primary tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-2 font-semibold text-foreground">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {p.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>
        <FadeIn delay={0.08} className="mt-8">
          <Button variant="outline" asChild>
            <Link href="/working-with-me">
              Tiempos, prioridades y semáforo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </FadeIn>
      </Section>

      {/* Recursos */}
      <Section className="pb-20 sm:pb-28">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-end">
          <FadeIn>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Recursos del portal</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed max-w-md">
              Catálogo de eventos, tiempos de respuesta y preguntas que ya nos han hecho otros equipos.
            </p>
            <ul className="mt-6 space-y-3">
              {resources.map((r) => {
                const Icon = r.icon;
                return (
                  <li key={r.href}>
                    <Link
                      href={r.href}
                      className="group flex items-center gap-3 rounded-lg border border-transparent px-2 py-2 -mx-2 hover:border-border/50 hover:bg-card/40 transition-colors"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="font-medium group-hover:text-primary transition-colors">
                          {r.label}
                        </span>
                        <span className="block text-xs text-muted-foreground">{r.hint}</span>
                      </span>
                      <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </FadeIn>

          <FadeIn delay={0.06}>
            <div className="rounded-2xl border border-border/50 bg-card/30 p-6">
              <p className="text-sm font-medium text-muted-foreground mb-4">Stack habitual</p>
              <div className="flex flex-wrap gap-2">
                {analyticsStack.map((tool) => (
                  <span
                    key={tool.name}
                    className="inline-flex items-center rounded-lg border border-border/50 bg-background/50 px-3 py-1.5 text-sm font-medium"
                  >
                    {tool.name}
                  </span>
                ))}
              </div>
              <p className="mt-5 text-xs text-muted-foreground leading-relaxed">
                Google Analytics 4 y Google Tag Manager sobre el data layer de Aeroméxico. Looker
                Studio y BigQuery cuando hace falta ir más allá del reporte estándar.
              </p>
            </div>
          </FadeIn>
        </div>

        {/* Cierre */}
        <FadeIn delay={0.1} className="mt-16 text-center max-w-xl mx-auto">
          <p className="text-lg font-semibold tracking-tight">
            ¿Tienes un pedido o una duda?
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Envía el formulario o abre el AI Agent. Te contesto cuando revise la cola.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild className="glow-aero">
              <Link href={formHref}>Pedir trabajo</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={agentHref}>Preguntar al AI Agent</Link>
            </Button>
          </div>
        </FadeIn>
      </Section>
    </>
  );
}
