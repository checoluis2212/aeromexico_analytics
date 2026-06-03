import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSergioAdmin } from '@/lib/auth/access';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { ClientDeliveriesArchive } from '@/components/delivery/client-deliveries-archive';
import { buildClientArchive } from '@/lib/delivery/client-archive';
import type { RequestDelivery } from '@/lib/delivery/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata = { title: 'Mis entregas' };

export default async function MisEntregasArchivoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/mis-pedidos/archivo');

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, role, acc_role')
    .eq('id', user.id)
    .single();

  if (isSergioAdmin(profile)) {
    redirect('/command-center/looker-dashboards');
  }

  const email = profile?.email ?? user.email!;

  const { data: requests } = await supabase
    .from('requests')
    .select('id, reference_code, title, created_at')
    .or(`user_id.eq.${user.id},requester_email.eq.${email}`)
    .order('created_at', { ascending: false });

  const requestRows = requests ?? [];
  const requestIds = requestRows.map((r) => r.id);

  let deliveries: RequestDelivery[] = [];
  if (requestIds.length > 0) {
    const { data } = await supabase
      .from('request_deliveries')
      .select('*')
      .in('request_id', requestIds)
      .order('created_at', { ascending: false });
    deliveries = (data ?? []) as RequestDelivery[];
  }

  const entries = buildClientArchive(requestRows, deliveries);

  return (
    <>
      <PageHeader
        badge="Archivo"
        title="Mis entregas"
        description="Dashboards Looker y videos GTM de tus pedidos — todo documentado y disponible cuando lo necesites."
      />

      <Section className="py-8 sm:py-12" containerClassName="max-w-6xl">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
            <Link href="/mis-pedidos">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Mis pedidos
            </Link>
          </Button>
        </div>
        <ClientDeliveriesArchive entries={entries} />
      </Section>
    </>
  );
}
