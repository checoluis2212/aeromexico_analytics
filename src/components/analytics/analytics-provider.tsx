'use client';

import { useCallback, useEffect, useMemo } from 'react';
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
  useEffect(() => {
    const supabase = createClient();

    async function syncUser(userId: string | null) {
      if (!userId) {
        clearAnalyticsUser();
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
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Evita ráfagas: getUser + INITIAL_SESSION + TOKEN_REFRESHED repetían user_context
      if (event === 'TOKEN_REFRESHED') return;
      void syncUser(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const track = useCallback((event: string, params?: Record<string, unknown>) => {
    defaultTrack(event, params);
  }, []);

  const value = useMemo(() => track, [track]);

  return (
    <AnalyticsContextProvider value={value}>
      <PortalPageTracker />
      {children}
    </AnalyticsContextProvider>
  );
}

export function trackLogout(): void {
  trackPortalEvent('logout');
  clearAnalyticsUser();
}
