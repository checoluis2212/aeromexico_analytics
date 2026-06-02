import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { CommandCenterTopBar } from '@/components/command-center/top-bar';
import { RequestsInbox } from '@/components/my-requests/requests-inbox';
import type { MyRequestRow } from '@/components/my-requests/request-card';
import { Button } from '@/components/ui/button';
import { Columns3 } from 'lucide-react';

export const metadata = { title: 'Todos los pedidos' };

export default async function PedidosInboxPage() {
  const supabase = await createClient();

  const { data: requests } = await supabase
    .from('requests')
    .select(
      'id, title, type, priority, status, delivery_status, company, created_at, external_url, requester_name, requester_email'
    )
    .order('created_at', { ascending: false });

  const rows = (requests ?? []) as MyRequestRow[];

  return (
    <>
      <CommandCenterTopBar
        title="Bandeja de pedidos"
        subtitle="Filtra por usuario, área, estado o prioridad"
      />

      <div className="p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/command-center/board">
              <Columns3 className="mr-2 h-4 w-4" />
              Ver tablero Scrum
            </Link>
          </Button>
        </div>

        <RequestsInbox
          requests={rows}
          showUserFilter
          showExport
          detailBasePath="/command-center/pedidos"
          emptyMessage="No hay pedidos que coincidan con los filtros."
        />
      </div>
    </>
  );
}
