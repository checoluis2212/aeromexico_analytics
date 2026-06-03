import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAppRole } from '@/lib/auth/access';

/** Hub antiguo — redirige al destino que corresponda por rol */
export default async function ResourcesRedirectPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/command-center');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, acc_role, email')
    .eq('id', user.id)
    .single();

  const role = getAppRole(profile);
  if (role === 'sergio_admin') redirect('/command-center/executive');
  if (role === 'stakeholder') redirect('/command-center/reports');
  redirect('/mis-pedidos');
}
