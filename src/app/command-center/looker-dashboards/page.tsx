import { assertSergioAdmin } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { CommandCenterTopBar } from '@/components/command-center/top-bar';
import { CommandCenterPageContent } from '@/components/command-center/command-center-page-content';
import { LookerLibraryManager } from '@/components/delivery/looker-library-manager';
import type { LinkableRequest } from '@/components/delivery/delivery-link-request-dialog';

export const metadata = { title: 'Looker Studio' };

export default async function LookerDashboardsPage() {
  await assertSergioAdmin();
  const supabase = await createClient();

  const [{ data: library }, { data: requests }] = await Promise.all([
    supabase.from('looker_dashboard_library').select('*').order('sort_order').order('created_at', { ascending: false }),
    supabase
      .from('requests')
      .select('id, reference_code, title, type')
      .in('type', ['dashboard', 'reporting', 'funnel'])
      .order('created_at', { ascending: false })
      .limit(80),
  ]);

  return (
    <>
      <CommandCenterTopBar
        title="Looker Studio"
        subtitle="Biblioteca de dashboards — vincula entregas a pedidos de reportes"
      />
      <CommandCenterPageContent>
        <LookerLibraryManager
          initialItems={library ?? []}
          dashboardRequests={(requests ?? []) as LinkableRequest[]}
        />
      </CommandCenterPageContent>
    </>
  );
}
