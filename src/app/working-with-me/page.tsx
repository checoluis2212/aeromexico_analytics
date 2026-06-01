import { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { slas } from '@/lib/constants';
import { ArrowRight, Clock, FileText, HelpCircle, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cómo trabajo',
  description: 'Cómo solicitar trabajo, SLAs, prioridades y preguntas frecuentes.',
};

const requiredInfo = [
  { title: 'Contexto de negocio', description: '¿Qué decisión necesitas tomar con estos datos?' },
  { title: 'URLs / propiedades', description: 'Sitios, apps o propiedades GA4 afectadas.' },
  { title: 'Cronograma', description: 'Fecha límite y dependencias con otros equipos.' },
  { title: 'Stakeholders', description: 'Quién aprueba, quién consume los datos.' },
  { title: 'Accesos', description: 'GTM, GA4, BigQuery — o indicar si necesitas guía de acceso.' },
  { title: 'Referencias', description: 'Documentos previos, tickets, screenshots del problema.' },
];

const faqs = [
  {
    q: '¿Cuánto tarda una implementación GA4 típica?',
    a: 'Depende del scope. Un measurement plan + implementación básica: 2-3 semanas. Programas enterprise completos: 6-12 semanas.',
  },
  {
    q: '¿Trabajas con equipos internos o solo entregables?',
    a: 'Ambos. Puedo liderar la implementación completa o trabajar embedded con tu equipo de producto/data.',
  },
  {
    q: '¿Qué pasa después del go-live?',
    a: 'Incluyo documentación, handoff y soporte post-launch con SLAs definidos según prioridad.',
  },
  {
    q: '¿Puedo solicitar solo una auditoría?',
    a: 'Sí. Las auditorías de analytics son uno de los servicios más solicitados. Incluyen reporte ejecutivo + plan de acción.',
  },
];

const priorityColors: Record<string, string> = {
  'P0 — Crítico': 'border-destructive/50 text-destructive',
  'P1 — Alto': 'border-signal/50 text-signal',
  'P2 — Medio': 'border-primary/50 text-primary',
  'P3 — Bajo': 'border-muted-foreground/50 text-muted-foreground',
};

export default function WorkingWithMePage() {
  return (
    <>
      <PageHeader
        badge="Cómo trabajo"
        title="Cómo trabajar juntos"
        description="Proceso claro, expectativas definidas y SLAs transparentes."
      >
        <Button asChild>
          <Link href="/request-center">
            Enviar solicitud
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </PageHeader>

      <Section title="Cómo solicitar trabajo">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Centro de solicitudes', desc: 'Completa el formulario con el tipo de solicitud y contexto.' },
            { step: '02', title: 'Revisión', desc: 'Reviso la solicitud y respondo con cronograma y alcance propuesto.' },
            { step: '03', title: 'Kickoff', desc: 'Agendamos la llamada de discovery y comenzamos con el plan de medición.' },
          ].map((s) => (
            <Card key={s.step} className="bg-card/50 border-border/60">
              <CardHeader>
                <span className="text-3xl font-bold text-primary/30">{s.step}</span>
                <CardTitle className="text-base mt-2">{s.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        title="Información que necesito"
        description="Mientras más contexto proporciones, más rápido puedo responder."
        className="bg-card/20 border-y border-border/40"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {requiredInfo.map((info) => (
            <div key={info.title} className="flex gap-3 p-4 rounded-lg border border-border/60 bg-card/30">
              <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium">{info.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{info.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="SLAs & Prioridades">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 font-medium text-muted-foreground">Prioridad</th>
                <th className="pb-3 font-medium text-muted-foreground">Respuesta</th>
                <th className="pb-3 font-medium text-muted-foreground">Resolución</th>
                <th className="pb-3 font-medium text-muted-foreground hidden md:table-cell">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {slas.map((sla) => (
                <tr key={sla.priority} className="border-b border-border/40">
                  <td className="py-4">
                    <Badge variant="outline" className={priorityColors[sla.priority]}>
                      {sla.priority}
                    </Badge>
                  </td>
                  <td className="py-4">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      {sla.response}
                    </span>
                  </td>
                  <td className="py-4">{sla.resolution}</td>
                  <td className="py-4 text-muted-foreground hidden md:table-cell">{sla.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Preguntas frecuentes" className="bg-card/20 border-y border-border/40">
        <div className="space-y-4 max-w-3xl">
          {faqs.map((faq) => (
            <div key={faq.q} className="p-5 rounded-lg border border-border/60 bg-card/30">
              <h3 className="font-medium flex items-start gap-2">
                <HelpCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {faq.q}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground pl-6">{faq.a}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="flex items-start gap-4 p-6 rounded-xl border border-signal/30 bg-signal/5 max-w-2xl">
          <AlertTriangle className="h-5 w-5 text-signal shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium">Tiempos de respuesta</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Horario laboral: Lun–Vie, 9:00–18:00 CET. Solicitudes P0 se atienden fuera de horario.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
