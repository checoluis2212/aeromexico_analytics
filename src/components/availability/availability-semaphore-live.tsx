'use client';

import { useEffect, useState } from 'react';
import { AvailabilitySemaphore } from '@/components/availability/availability-semaphore';
import type { SergioAvailability } from '@/lib/availability-config';

type Props = {
  initial?: SergioAvailability;
  className?: string;
  compact?: boolean;
};

export function AvailabilitySemaphoreLive({ initial, className, compact }: Props) {
  const [availability, setAvailability] = useState<SergioAvailability | null>(initial ?? null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/availability')
      .then((r) => r.json())
      .then((data: SergioAvailability) => {
        if (!cancelled && data?.capacity) setAvailability(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!availability) return null;

  return (
    <AvailabilitySemaphore
      availability={availability}
      className={className}
      compact={compact}
    />
  );
}
