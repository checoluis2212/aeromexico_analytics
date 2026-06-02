import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { Button } from '@/components/ui/button';
import { RequestsInbox } from '@/components/my-requests/requests-inbox';
import type { MyRequestRow } from '@/components/my-requests/request-card';
import { siteConfig } from '@/lib/constants';
import { PlusCircle } from 'lucide-react';

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
      'id, title, type, priority, status, delivery_status, company, created_at, external_url, requester_name, requester_email'
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
        <div className="flex flex-wrap gap-3 mb-6">
          <Button asChild>
            <Link href="/request-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo pedido
            </Link>
          </Button>
        </div>

        {rows.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            <p>Aún no tienes pedidos con este correo.</p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/request-center">Hacer tu primer pedido</Link>
            </Button>
          </div>
        ) : (
          <RequestsInbox requests={rows} />
        )}
      </Section>
    </>
  );
}
