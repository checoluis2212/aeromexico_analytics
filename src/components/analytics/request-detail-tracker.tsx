'use client';

import { useEffect } from 'react';
import { useTrackEvent } from '@/components/analytics/analytics-context';

type Props = {
  requestId: string;
  deliveryStatus: string | null;
  sergioDecision: string | null;
};

export function RequestDetailTracker({
  requestId,
  deliveryStatus,
  sergioDecision,
}: Props) {
  const track = useTrackEvent();

  useEffect(() => {
    track('request_view', {
      request_id: requestId,
      delivery_status: deliveryStatus ?? 'unknown',
      sergio_decision: sergioDecision ?? 'pending',
    });
  }, [track, requestId, deliveryStatus, sergioDecision]);

  return null;
}
