import { createAdminClient } from '@/lib/supabase/admin';

export type AssistantAnalyticsSummary = {
  last7Days: {
    chatMessages: number;
    requestDrafts: number;
    requestsCreated: number;
    uniqueUsers: number;
  };
  last30Days: {
    chatMessages: number;
    requestsCreated: number;
  };
};

async function countConsultorMessagesSince(since: string): Promise<number> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return 0;
  const admin = createAdminClient();
  const { count } = await admin
    .from('assistant_chat_usage')
    .select('*', { count: 'exact', head: true })
    .in('event_type', ['consultor_message', 'chat_message'])
    .gte('created_at', since);
  return count ?? 0;
}

async function countEventsSince(since: string, eventType?: string): Promise<number> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return 0;
  const admin = createAdminClient();
  let q = admin
    .from('assistant_chat_usage')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', since);
  if (eventType) q = q.eq('event_type', eventType);
  const { count } = await q;
  return count ?? 0;
}

async function countUniqueUsersSince(since: string): Promise<number> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return 0;
  const admin = createAdminClient();
  const { data } = await admin
    .from('assistant_chat_usage')
    .select('user_id')
    .gte('created_at', since);
  return new Set((data ?? []).map((r) => r.user_id)).size;
}

export async function getAssistantAnalyticsSummary(): Promise<AssistantAnalyticsSummary> {
  const now = Date.now();
  const d7 = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  const d30 = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    chat7,
    drafts7,
    created7,
    users7,
    chat30,
    created30,
  ] = await Promise.all([
    countConsultorMessagesSince(d7),
    countEventsSince(d7, 'request_draft'),
    countEventsSince(d7, 'request_created'),
    countUniqueUsersSince(d7),
    countConsultorMessagesSince(d30),
    countEventsSince(d30, 'request_created'),
  ]);

  return {
    last7Days: {
      chatMessages: chat7,
      requestDrafts: drafts7,
      requestsCreated: created7,
      uniqueUsers: users7,
    },
    last30Days: {
      chatMessages: chat30,
      requestsCreated: created30,
    },
  };
}
