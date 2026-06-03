import { createAdminClient } from '@/lib/supabase/admin';
import type { AccessRequestInput } from '@/lib/access-requests/schema';

export type SubmitAccessRequestResult =
  | { ok: true; id: string; status: 'pending' }
  | { ok: false; code: 'duplicate_pending' | 'already_approved' | 'db_error'; message: string };

export async function submitPlatformAccessRequest(
  input: AccessRequestInput
): Promise<SubmitAccessRequestResult> {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from('platform_access_requests')
    .select('id, status')
    .eq('email', input.email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.status === 'pending') {
    return {
      ok: false,
      code: 'duplicate_pending',
      message: 'Ya existe una solicitud pendiente con este correo.',
    };
  }

  if (existing?.status === 'approved') {
    return {
      ok: false,
      code: 'already_approved',
      message: 'Este correo ya tiene acceso aprobado. Inicia sesión.',
    };
  }

  const { data, error } = await supabase
    .from('platform_access_requests')
    .insert({
      full_name: input.full_name,
      email: input.email,
      company: input.company,
      department: input.department,
      job_title: input.job_title,
      reason: input.reason,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') {
      return {
        ok: false,
        code: 'duplicate_pending',
        message: 'Ya existe una solicitud pendiente con este correo.',
      };
    }
    console.error('platform_access_requests insert:', error.message);
    return { ok: false, code: 'db_error', message: 'No se pudo registrar la solicitud. Inténtalo más tarde.' };
  }

  return { ok: true, id: data.id, status: 'pending' };
}

export async function getAccessRequestByEmail(email: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('platform_access_requests')
    .select('id, status, created_at, reviewed_at')
    .eq('email', email.toLowerCase())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}
