'use client';

import { Suspense, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getAnalyticsUser, trackPageView } from '@/lib/analytics/data-layer';

type Props = {
  /** true cuando user_context ya está en dataLayer (anon o autenticado) */
  authReady: boolean;
};

function PortalPageTrackerInner({ authReady }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastKey = useRef<string | null>(null);

  useEffect(() => {
    if (!authReady) return;

    const userId = getAnalyticsUser()?.id ?? 'anonymous';
    const key = `${pathname}?${searchParams.toString()}|${userId}`;
    if (lastKey.current === key) return;
    lastKey.current = key;

    trackPageView(pathname);
  }, [authReady, pathname, searchParams]);

  return null;
}

export function PortalPageTracker({ authReady }: Props) {
  return (
    <Suspense fallback={null}>
      <PortalPageTrackerInner authReady={authReady} />
    </Suspense>
  );
}
