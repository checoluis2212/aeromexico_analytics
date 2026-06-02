import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAppRole } from '@/lib/auth/access';

export default async function CommandCenterIndex() {
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
  if (role === 'sergio_admin') redirect('/command-center/admin');
  if (role === 'stakeholder') redirect('/command-center/executive');
  redirect('/mis-pedidos');
}
