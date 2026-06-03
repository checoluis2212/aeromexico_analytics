'use client';

import { Suspense, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView } from '@/lib/analytics/data-layer';

function PortalPageTrackerInner({
  authState,
}: {
  authState: 'authenticated' | 'anonymous';
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastKey = useRef<string | null>(null);

  useEffect(() => {
    const key = `${pathname}?${searchParams.toString()}`;
    if (lastKey.current === key) return;
    lastKey.current = key;
    trackPageView(pathname, authState);
  }, [pathname, searchParams, authState]);

  return null;
}

export function PortalPageTracker({
  authState,
}: {
  authState: 'authenticated' | 'anonymous';
}) {
  return (
    <Suspense fallback={null}>
      <PortalPageTrackerInner authState={authState} />
    </Suspense>
  );
}
