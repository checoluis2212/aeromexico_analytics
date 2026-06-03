import { createAdminClient } from '@/lib/supabase/admin';

/** Límite desactivado — sin tope por hora en modo Consultor */
export const CONSULTOR_CHAT_LIMIT_PER_HOUR = null;

/** @deprecated Usar CONSULTOR_CHAT_LIMIT_PER_HOUR */
export const ASSISTANT_CHAT_LIMIT_PER_HOUR = CONSULTOR_CHAT_LIMIT_PER_HOUR;

const CONSULTOR_EVENT = 'consultor_message';
const ADMIN_AGENT_EVENT = 'admin_agent_message';

export type AssistantRateLimitResult = {
  allowed: boolean;
  used: number;
  remaining: number;
  retryAfterMinutes?: number;
};

export type AssistantUsageEvent =
  | 'chat_message'
  | 'consultor_message'
  | 'admin_agent_message'
  | 'request_draft'
  | 'request_created';

export async function checkConsultorChatRateLimit(
  _userId: string
): Promise<AssistantRateLimitResult> {
  return {
    allowed: true,
    used: 0,
    remaining: Number.MAX_SAFE_INTEGER,
  };
}

/** @deprecated Usar checkConsultorChatRateLimit */
export const checkAssistantChatRateLimit = checkConsultorChatRateLimit;

export async function logAdminAgentChatUsage(userId: string): Promise<void> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return;
  }

  const admin = createAdminClient();
  await admin.from('assistant_chat_usage').insert({
    user_id: userId,
    event_type: ADMIN_AGENT_EVENT,
  });
}

export async function logConsultorChatUsage(userId: string): Promise<void> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return;
  }

  const admin = createAdminClient();
  await admin.from('assistant_chat_usage').insert({
    user_id: userId,
    event_type: CONSULTOR_EVENT,
  });
}

export async function logAssistantChatUsage(
  userId: string,
  eventType: AssistantUsageEvent = 'chat_message'
): Promise<void> {
  if (eventType === 'consultor_message') {
    await logConsultorChatUsage(userId);
    return;
  }
  if (eventType === 'admin_agent_message') {
    await logAdminAgentChatUsage(userId);
    return;
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return;
  }

  const admin = createAdminClient();
  await admin.from('assistant_chat_usage').insert({
    user_id: userId,
    event_type: eventType,
  });
}
