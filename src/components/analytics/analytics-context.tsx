'use client';

import { createContext, useContext } from 'react';
import { trackPortalEvent } from '@/lib/analytics/data-layer';

type TrackFn = (event: string, params?: Record<string, unknown>) => void;

const AnalyticsContext = createContext<TrackFn>(() => {});

export function useTrackEvent(): TrackFn {
  return useContext(AnalyticsContext);
}

export const AnalyticsContextProvider = AnalyticsContext.Provider;

export function defaultTrack(event: string, params: Record<string, unknown> = {}): void {
  trackPortalEvent(event, params);
}
