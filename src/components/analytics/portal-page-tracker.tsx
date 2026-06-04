'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView } from '@/lib/analytics/data-layer';

type Props = {
  /** true tras user_context en dataLayer (user_id global disponible para GTM) */
  authReady: boolean;
};

function PortalPageTrackerInner({ authReady }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!authReady) return;
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
