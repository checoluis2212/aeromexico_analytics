import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSergioAdmin } from '@/lib/auth/access';

export async function assertSergioAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, acc_role, email')
    .eq('id', user.id)
    .single();

  if (!isSergioAdmin(profile)) {
    redirect('/command-center/executive');
  }
}
