import { createClient } from '@/lib/supabase/server';
import { getAppRole, type AppRole } from '@/lib/auth/access';

export type SiteChromeBootstrap = {
  isAuthenticated: boolean;
  appRole: AppRole | null;
  accRole: string | null;
  userLabel: string | null;
};

export async function getSiteChromeBootstrap(): Promise<SiteChromeBootstrap> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      isAuthenticated: false,
      appRole: null,
      accRole: null,
      userLabel: null,
    };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, acc_role, email, full_name')
    .eq('id', user.id)
    .maybeSingle();

  const appRole = getAppRole(
    profile
      ? { role: profile.role, acc_role: profile.acc_role, email: profile.email }
      : { role: 'client', acc_role: null, email: user.email }
  );

  return {
    isAuthenticated: true,
    appRole,
    accRole: profile?.acc_role ?? null,
    userLabel: profile?.full_name?.trim() || profile?.email || user.email || null,
  };
}
