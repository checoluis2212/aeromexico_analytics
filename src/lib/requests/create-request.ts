import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { isSergioAdmin } from '@/lib/auth/access';
import { processNewRequest } from '@/lib/requests/process-new-request';
import { pushRequestToExternal, saveExternalRef } from '@/lib/integrations/external-sync';
import { z } from 'zod';

export const requestInputSchema = z.object({
  requester_name: z.string().min(2).optional(),
  requester_email: z.string().email().optional(),
  company: z.string().optional(),
  type: z.enum(['tracking', 'dashboard', 'funnel', 'qa', 'reporting', 'investigation']).optional(),
  title: z.string().min(10),
  description: z.string().optional(),
  priority: z.enum(['p0_critical', 'p1_high', 'p2_medium', 'p3_low']).optional(),
  source: z.enum(['form', 'chat_assistant']).optional(),
});

export type CreateRequestInput = z.infer<typeof requestInputSchema>;

export type CreateRequestResult = {
  id: string;
  reference_code: string | null;
  title: string;
  auto_accepted: boolean;
  agent_decision?: string;
  suggested_due_date?: string;
  external_url: string | null;
};

export async function createAuthenticatedRequest(
  data: CreateRequestInput,
  userId: string
): Promise<CreateRequestResult> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Configuración incompleta en el servidor.');
  }

  const authClient = await createClient();
  const { data: profile } = await authClient
    .from('profiles')
    .select('role, acc_role, email, full_name')
    .eq('id', userId)
    .single();

  const sergioRegisteringForOther = isSergioAdmin(profile);

  const payload = {
    user_id: sergioRegisteringForOther ? null : userId,
    requester_name: sergioRegisteringForOther
      ? data.requester_name ?? profile?.full_name ?? 'Cliente'
      : profile?.full_name?.trim() || data.requester_name || 'Cliente',
    requester_email: sergioRegisteringForOther
      ? data.requester_email ?? profile?.email ?? ''
      : profile?.email ?? data.requester_email ?? '',
    company: data.company ?? 'Sin área',
    type: data.type ?? 'dashboard',
    title: data.title,
    description: data.description ?? data.title,
    priority: data.priority ?? 'p2_medium',
    status: 'submitted' as const,
    delivery_status: 'backlog' as const,
    sergio_decision: 'pending' as const,
  };

  const supabase = createAdminClient();

  const { data: inserted, error } = await supabase
    .from('requests')
    .insert(payload)
    .select(
      'id, reference_code, title, type, priority, requester_name, requester_email, company, description, user_id'
    )
    .single();

  if (error || !inserted) {
    throw new Error(error?.message ?? 'No se pudo crear el pedido');
  }

  let auto_accepted = false;
  let agent_decision: string | undefined;
  let suggested_due_date: string | undefined;

  try {
    const result = await processNewRequest(inserted, {
      skipAutoAccept: sergioRegisteringForOther,
      source: data.source ?? 'form',
    });
    auto_accepted = result.auto_accepted;
    agent_decision = result.intake.decision;
    suggested_due_date = result.intake.advice.suggested_due_date;
  } catch (processErr) {
    console.error('processNewRequest error:', processErr);
  }

  let external_url: string | null = null;

  try {
    const external = await pushRequestToExternal({
      id: inserted.id,
      title: inserted.title,
      description: inserted.description ?? inserted.title,
      requester_name: inserted.requester_name,
      requester_email: inserted.requester_email,
      company: inserted.company,
      priority: inserted.priority,
      type: inserted.type,
    });

    if (external) {
      await saveExternalRef(inserted.id, external);
      external_url = external.url ?? null;
    }
  } catch (syncErr) {
    console.error('External sync error:', syncErr);
  }

  return {
    id: inserted.id,
    reference_code: inserted.reference_code ?? null,
    title: inserted.title,
    auto_accepted,
    agent_decision,
    suggested_due_date,
    external_url,
  };
}
