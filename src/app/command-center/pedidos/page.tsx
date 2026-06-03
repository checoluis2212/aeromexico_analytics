import Link from 'next/link';
import { assertSergioAdmin } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { CommandCenterTopBar } from '@/components/command-center/top-bar';
import { CommandCenterPageContent } from '@/components/command-center/command-center-page-content';
import { SergioInbox } from '@/components/command-center/sergio-inbox';
import type { MyRequestRow } from '@/components/my-requests/request-card';
import { Button } from '@/components/ui/button';
import { Columns3 } from 'lucide-react';

export const metadata = { title: 'Bandeja de pedidos' };

export default async function PedidosInboxPage() {
  await assertSergioAdmin();
  const supabase = await createClient();

  const { data: requests } = await supabase
    .from('requests')
    .select(
      'id, reference_code, title, type, priority, status, delivery_status, company, created_at, external_url, requester_name, requester_email, sergio_decision, committed_due_date'
    )
    .order('created_at', { ascending: false });

  const rows = (requests ?? []) as MyRequestRow[];

  return (
    <>
      <CommandCenterTopBar
        title="Bandeja"
        subtitle="Por aceptar, en curso, rechazados y cerrados"
      />

      <CommandCenterPageContent className="space-y-5">
        <nav className="flex flex-wrap items-center gap-3" aria-label="Acciones de bandeja">
          <Button variant="outline" size="sm" asChild>
            <Link href="/command-center/board">
              <Columns3 className="mr-2 h-4 w-4 shrink-0" />
              Tablero de avance
            </Link>
          </Button>
          <span className="text-muted-foreground/40 select-none" aria-hidden>
            |
          </span>
          <Button variant="outline" size="sm" asChild>
            <Link href="/command-center/admin">Mi panel</Link>
          </Button>
        </nav>

        <SergioInbox requests={rows} />
      </CommandCenterPageContent>
    </>
  );
}
