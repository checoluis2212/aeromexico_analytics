import { assertSergioAdmin } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { CommandCenterTopBar } from '@/components/command-center/top-bar';
import { CommandCenterPageContent } from '@/components/command-center/command-center-page-content';
import { GtmVideoLibraryManager } from '@/components/delivery/gtm-video-library-manager';
import type { LinkableRequest } from '@/components/delivery/delivery-link-request-dialog';

export const metadata = { title: 'GTM Debug — Videos' };

export default async function GtmVideosPage() {
  await assertSergioAdmin();
  const supabase = await createClient();

  const [{ data: library }, { data: requests }] = await Promise.all([
    supabase.from('gtm_debug_video_library').select('*').order('sort_order').order('created_at', { ascending: false }),
    supabase
      .from('requests')
      .select('id, reference_code, title, type')
      .in('type', ['tracking', 'qa', 'funnel'])
      .order('created_at', { ascending: false })
      .limit(80),
  ]);

  return (
    <>
      <CommandCenterTopBar
        title="GTM Preview / Debug"
        subtitle="Videos testigo de implementación — vincula a pedidos de tracking"
      />
      <CommandCenterPageContent>
        <GtmVideoLibraryManager
          initialItems={library ?? []}
          trackingRequests={(requests ?? []) as LinkableRequest[]}
        />
      </CommandCenterPageContent>
    </>
  );
}
