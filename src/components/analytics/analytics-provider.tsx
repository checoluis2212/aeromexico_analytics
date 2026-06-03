'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getAppRole, type AppRole } from '@/lib/auth/access';
import {
  clearAnalyticsUser,
  setAnalyticsUser,
  trackPortalEvent,
} from '@/lib/analytics/data-layer';
import {
  AnalyticsContextProvider,
  defaultTrack,
} from '@/components/analytics/analytics-context';
import { PortalPageTracker } from '@/components/analytics/portal-page-tracker';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<'authenticated' | 'anonymous'>('anonymous');

  useEffect(() => {
    const supabase = createClient();

    async function syncUser(userId: string | null) {
      if (!userId) {
        clearAnalyticsUser();
        setAuthState('anonymous');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, acc_role, email')
        .eq('id', userId)
        .maybeSingle();

      const appRole: AppRole = getAppRole(
        profile
          ? { role: profile.role, acc_role: profile.acc_role, email: profile.email }
          : null
      );

      setAnalyticsUser({
        id: userId,
        app_role: appRole,
        acc_role: profile?.acc_role ?? null,
      });
      setAuthState('authenticated');
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      syncUser(user?.id ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUser(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const track = useCallback((event: string, params?: Record<string, unknown>) => {
    defaultTrack(event, params);
  }, []);

  const value = useMemo(() => track, [track]);

  return (
    <AnalyticsContextProvider value={value}>
      <PortalPageTracker authState={authState} />
      {children}
    </AnalyticsContextProvider>
  );
}

export function trackLogout(): void {
  trackPortalEvent('logout');
  clearAnalyticsUser();
}
