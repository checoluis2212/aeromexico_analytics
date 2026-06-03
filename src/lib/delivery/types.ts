export type RequestDeliveryKind = 'looker_dashboard' | 'gtm_debug_video';

export type LookerDashboardLibraryItem = {
  id: string;
  title: string;
  description: string | null;
  dashboard_url: string;
  tags: string[];
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type GtmDebugVideoLibraryItem = {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  event_name: string | null;
  tags: string[];
  recorded_at: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type RequestDelivery = {
  id: string;
  request_id: string;
  kind: RequestDeliveryKind;
  title: string;
  url: string;
  notes: string | null;
  library_looker_id: string | null;
  library_gtm_video_id: string | null;
  created_at: string;
};

export const DELIVERY_KIND_LABELS: Record<RequestDeliveryKind, string> = {
  looker_dashboard: 'Dashboard Looker Studio',
  gtm_debug_video: 'Video GTM Preview / Debug',
};
