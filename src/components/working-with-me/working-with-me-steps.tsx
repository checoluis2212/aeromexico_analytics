'use client';

import { MessageSquare, FolderSearch, Users } from 'lucide-react';

const steps = [
  {
    icon: MessageSquare,
    title: 'Me cuentas qué necesitas',
    desc: 'Un formulario corto: métrica, dashboard, evento GTM, embudo… con eso arranco.',
  },
  {
    icon: FolderSearch,
    title: 'Revisamos el proyecto',
    desc: 'Vemos contexto, data layer, GA4/GTM y qué ya está medido. Así definimos qué falta y qué conviene tocar primero.',
  },
  {
    icon: Users,
    title: 'Tú y tu equipo ejecutan',
    desc: 'Con mi ayuda te doy lo necesario — medición, validación, dashboards — para que otros equipos ejecuten sus estrategias con datos confiables.',
  },
];

export function WorkingWithMeSteps() {
  return (
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
  );
}
