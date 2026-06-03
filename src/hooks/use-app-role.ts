'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getAppRole, type AppRole } from '@/lib/auth/access';

export function useAppRole() {
  const [appRole, setAppRole] = useState<AppRole | null>(null);
  const [accRole, setAccRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userFullName, setUserFullName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setAppRole('client');
        setAccRole(null);
        setUserEmail(null);
        setUserFullName(null);
        setLoading(false);
        return;
      }

      setUserEmail(user.email ?? null);

      const { data } = await supabase
        .from('profiles')
        .select('role, acc_role, email, full_name')
        .eq('id', user.id)
        .single();

      setUserFullName(data?.full_name ?? null);
      setAccRole(data?.acc_role ?? null);
      setAppRole(
        getAppRole(
          data
            ? { role: data.role, acc_role: data.acc_role, email: data.email }
            : { role: 'client', acc_role: null, email: user.email }
        )
      );
      setLoading(false);
    }

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    appRole,
    accRole,
    loading,
    isAuthenticated: userEmail !== null,
    isSergioAdmin: appRole === 'sergio_admin',
    isStakeholder: appRole === 'stakeholder',
    userEmail,
    userFullName,
  };
}
