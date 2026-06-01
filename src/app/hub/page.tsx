import { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/server';
import { HubStats } from '@/components/hub/hub-stats';
import { RequestTable } from '@/components/hub/request-table';
import { ActivityFeed } from '@/components/hub/activity-feed';

export const metadata: Metadata = {
  title: 'Hub de analytics',
  description: 'Panel interno con requerimientos, prioridades, KPIs y actividad reciente.',
};

export default async function HubPage() {
  const supabase = await createClient();

  const [{ data: openRequests }, { data: closedRequests }, { data: allRequests }] = await Promise.all([
    supabase.from('requests').select('*').in('status', ['submitted', 'in_review', 'in_progress', 'blocked']).order('created_at', { ascending: false }),
    supabase.from('requests').select('*').in('status', ['completed', 'cancelled']).order('updated_at', { ascending: false }).limit(10),
    supabase.from('requests').select('*').order('created_at', { ascending: false }).limit(20),
  ]);

  const stats = {
    open: openRequests?.length ?? 0,
    closed: closedRequests?.length ?? 0,
    p0: openRequests?.filter((r) => r.priority === 'p0_critical').length ?? 0,
    inProgress: openRequests?.filter((r) => r.status === 'in_progress').length ?? 0,
  };

  return (
    <>
      <PageHeader
        badge="Interno"
        title="Hub de analytics"
        description="Vista operativa de requerimientos, prioridades y actividad del programa de analytics."
      />

      <Section>
        <HubStats stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-card/50 border-border/60">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  Requerimientos abiertos
                  <Badge variant="secondary">{stats.open}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RequestTable requests={openRequests ?? []} />
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Requerimientos cerrados</CardTitle>
              </CardHeader>
              <CardContent>
                <RequestTable requests={closedRequests ?? []} compact />
              </CardContent>
            </Card>
          </div>

          <div>
            <ActivityFeed requests={allRequests ?? []} />
          </div>
        </div>
      </Section>
    </>
  );
}
