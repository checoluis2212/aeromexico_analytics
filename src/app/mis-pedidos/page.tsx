import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { RequestsInbox } from '@/components/my-requests/requests-inbox';
import type { MyRequestRow } from '@/components/my-requests/request-card';
import { siteConfig } from '@/lib/constants';
import { PlusCircle, Inbox } from 'lucide-react';

export const metadata = { title: 'Mis pedidos' };

export default async function MisPedidosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', user.id)
    .single();

  const email = profile?.email ?? user.email!;

  const { data: requests } = await supabase
    .from('requests')
    .select(
      'id, title, type, priority, status, delivery_status, company, created_at, external_url, requester_name, requester_email, sergio_decision, committed_due_date'
    )
    .or(`user_id.eq.${user.id},requester_email.eq.${email}`)
    .order('created_at', { ascending: false });

  const rows = (requests ?? []) as MyRequestRow[];

  return (
    <>
      <PageHeader
        badge={profile?.full_name ?? email}
        title="Mis pedidos"
        description={`Todo lo que pediste a ${siteConfig.author} — filtra por estado, área o tipo.`}
      />

      <Section>
        <div className="flex flex-wrap gap-3 mb-8">
          <Button asChild className="glow-aero">
            <Link href="/request-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo pedido
            </Link>
          </Button>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Aún no tienes pedidos"
            description="Pide un dashboard, métrica o revisión de datos a Sergio. En 2 minutos, sin complicaciones."
            action={
              <Button asChild>
                <Link href="/request-center">Hacer mi primer pedido</Link>
              </Button>
            }
          />
        ) : (
          <RequestsInbox requests={rows} />
        )}
      </Section>
    </>
  );
}
