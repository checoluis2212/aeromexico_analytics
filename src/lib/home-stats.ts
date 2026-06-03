import { createAdminClient } from '@/lib/supabase/admin';

export type HomeStatsData = {
  total: number;
  active: number;
};

export async function getHomeStats(): Promise<HomeStatsData> {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { total: 0, active: 0 };
    }

    const supabase = createAdminClient();
    const [{ count: total }, { count: active }] = await Promise.all([
      supabase.from('requests').select('*', { count: 'exact', head: true }),
      supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .in('delivery_status', [
          'backlog',
          'discovery',
          'requirements',
          'ready_for_development',
          'development',
          'analytics_qa',
          'ready_for_release',
          'blocked',
        ]),
    ]);

    return { total: total ?? 0, active: active ?? 0 };
  } catch {
    return { total: 0, active: 0 };
  }
}
