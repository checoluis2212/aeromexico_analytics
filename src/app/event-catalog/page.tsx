import { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/server';
import { EventCard } from '@/components/events/event-card';
import type { EventParameter } from '@/types/database';

export const metadata: Metadata = {
  title: 'Catálogo de eventos',
  description: 'Documentación de eventos GA4 con parámetros, ejemplos y casos de uso.',
};

export default async function EventCatalogPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from('event_catalog')
    .select('*')
    .eq('is_active', true)
    .order('event_name');

  const categories = [...new Set((events ?? []).map((e) => e.category).filter(Boolean))];

  return (
    <>
      <PageHeader
        badge="Catálogo de eventos"
        title="Catálogo de eventos GA4"
        description="Documentación viva de eventos: nombre, parámetros, ejemplos de implementación y casos de uso."
      />

      <Section>
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((cat) => (
              <Badge key={cat} variant="outline" className="border-primary/30">{cat}</Badge>
            ))}
          </div>
        )}

        <div className="space-y-6">
          {(events ?? []).map((event) => (
            <EventCard
              key={event.id}
              eventName={event.event_name}
              description={event.description}
              parameters={event.parameters as EventParameter[]}
              exampleCode={event.example_code}
              useCases={event.use_cases ?? []}
              category={event.category}
            />
          ))}
        </div>

        {(!events || events.length === 0) && (
          <p className="text-center text-muted-foreground py-12">
            Eventos disponibles tras configurar Supabase con las migraciones incluidas.
          </p>
        )}
      </Section>
    </>
  );
}
