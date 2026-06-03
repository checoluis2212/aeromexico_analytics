import { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Section, FeatureCard } from '@/components/layout/section';
import { Button } from '@/components/ui/button';
import { services, siteConfig } from '@/lib/constants';
import {
  ArrowRight,
  BarChart3,
  Code2,
  Database,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Plane,
  MessageCircle,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sobre mí',
  description: 'Sergio Burgos — Analytics Metrics Specialist en Aeroméxico. Apoyo a Growth y otros equipos con datos, dashboards y medición.',
};

const iconMap: Record<string, React.ReactNode> = {
  Target: <Target className="h-5 w-5" />,
  BarChart3: <BarChart3 className="h-5 w-5" />,
  Code2: <Code2 className="h-5 w-5" />,
  Database: <Database className="h-5 w-5" />,
  ShieldCheck: <ShieldCheck className="h-5 w-5" />,
  Sparkles: <Sparkles className="h-5 w-5" />,
};

const whoAmI = [
  {
    title: 'Tu punto de contacto en analytics',
    description:
      'Soy a quien le escribes cuando necesitas medir algo nuevo, entender un número o armar un reporte — sin procesos pesados.',
    icon: <MessageCircle className="h-5 w-5" />,
  },
  {
    title: 'Conozco el contexto Aeroméxico',
    description:
      'Trabajo sobre los data layers de web, app, e-commerce y marketing. Lo que hacemos se alinea con la gobernanza y el catálogo de eventos.',
    icon: <Plane className="h-5 w-5" />,
  },
  {
    title: 'Apoyo al equipo, no lo reemplazo',
    description:
      'Mi objetivo es que tu equipo se sienta cómodo con esto: explico el porqué, revisamos juntos y lo dejamos documentado para que no dependan de mí.',
    icon: <Users className="h-5 w-5" />,
  },
];

const helpByRole = [
  {
    area: 'Equipo de Growth',
    examples: 'KPIs de conversión y adquisición, embudos, atribución, ROAS — la medición que necesitan para decidir.',
  },
  {
    area: 'Marketing y Digital',
    examples: 'ROAS por campaña, atribución, embudos de adquisición, conversiones por canal.',
  },
  {
    area: 'E-commerce y Revenue',
    examples: 'Checkout, abandono de carrito, revenue, purchase events, comparación pre/post deploy.',
  },
  {
    area: 'App móvil y Producto',
    examples: 'Eventos Firebase/GA4, adopción de features, funnels in-app, retención.',
  },
  {
    area: 'Operaciones y otros equipos',
    examples: 'Dudas sobre métricas, validación de datos, reportes ad hoc en Looker o BigQuery.',
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        badge={siteConfig.tagline}
        title="Hola, soy Sergio Burgos"
        description="Analytics Metrics Specialist en Aeroméxico. Ayudo a Growth, Marketing, Producto y más equipos con datos confiables, dashboards útiles y medición que sirva para decidir."
      />

      <Section>
        <div className="max-w-3xl space-y-4 text-muted-foreground leading-relaxed">
          <p className="text-base text-foreground">
            Soy especialista en <strong className="font-medium">analytics y métricas</strong> en Aeroméxico.
            No hago growth — <strong className="font-medium">ayudo al equipo de Growth</strong> (y a Marketing, E-commerce, App y otros)
            con GA4, GTM, BigQuery y Looker: medición, dashboards y validación de datos.
          </p>
          <p>
            Si eres de Marketing, Producto, E-commerce, Digital u otra área y te preguntas
            <em> “¿este número es correcto?”</em>, <em>“¿cómo medimos esto?”</em> o{' '}
            <em>“¿me armas un dashboard?”</em> — ese es exactamente mi trabajo. No necesitas ser experto
            en analytics para pedirme ayuda.
          </p>
        </div>
      </Section>

      <Section title="Quién soy en el día a día" className="bg-card/10 border-y border-border/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
          {whoAmI.map((item) => (
            <div key={item.title} className="p-5 rounded-xl border border-border/40 bg-card/30">
              <div className="text-primary mb-3">{item.icon}</div>
              <h3 className="font-semibold text-sm">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Cómo puedo ayudarte"
        description="Cosas concretas que puedes pedirme — en lenguaje de negocio, no técnico."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.filter((s) => s.title !== 'Revisión').map((service) => (
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
        title="Por área en Aeroméxico"
        description="Ejemplos de lo que suelen pedirme los equipos."
        className="bg-card/10 border-y border-border/30"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl">
          {helpByRole.map((row) => (
            <div key={row.area} className="p-4 rounded-xl border border-border/40 bg-card/20">
              <h3 className="font-semibold text-sm text-primary">{row.area}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{row.examples}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="text-center pb-16">
        <Plane className="h-8 w-8 text-primary/50 mx-auto mb-4" />
        <h2 className="text-xl font-semibold">¿Necesitas algo de analytics?</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Manda el formulario con el detalle. Te digo si lo tomo y para cuándo.
          Con cuenta ves el avance en Mis pedidos.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild className="glow-aero">
            <Link href="/pedir">
              Pedir trabajo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/working-with-me">Ver cómo funciona</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
