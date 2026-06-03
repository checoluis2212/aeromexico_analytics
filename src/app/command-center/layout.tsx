import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CommandCenterProvider } from '@/components/command-center/command-center-context';
import { CommandCenterSidebar } from '@/components/command-center/sidebar';
import { CommandCenterTopChrome } from '@/components/command-center/command-center-shell';
import { canAccessCommandCenter, getAppRole } from '@/lib/auth/access';

export default async function CommandCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase no configurado en el servidor (NEXT_PUBLIC_SUPABASE_*)');
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/command-center');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, acc_role, email, full_name')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('Profile load error:', profileError.message);
  }

  if (!canAccessCommandCenter(profile)) {
    redirect('/mis-pedidos');
  }

  const appRole = getAppRole(profile);

  return (
    <CommandCenterProvider appRole={appRole} accRole={profile?.acc_role ?? null}>
      <div className="flex min-h-screen flex-col">
        <CommandCenterTopChrome />
        <div className="flex flex-1 min-h-0">
          <CommandCenterSidebar />
          <div className="flex flex-1 flex-col min-w-0 min-h-0 overflow-auto">
            {children}
          </div>
        </div>
      </div>
    </CommandCenterProvider>
  );
}
