import type { AppRole } from '@/lib/auth/access';
import { resolvePageSection, type PortalSection } from '@/lib/analytics/page-sections';

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export type AnalyticsUserContext = {
  id: string;
  app_role: AppRole;
  acc_role: string | null;
};

type GlobalEventParams = {
  portal_section?: PortalSection;
  page_path?: string;
  app_role?: AppRole | null;
  user_id?: string;
};

let cachedUser: AnalyticsUserContext | null = null;
let cachedPath: string | null = null;
/** Evita repetir user_context si el usuario/rol no cambió */
let lastUserContextKey: string | null = null;

function userContextKey(ctx: AnalyticsUserContext): string {
  return `${ctx.id}|${ctx.app_role}|${ctx.acc_role ?? ''}`;
}

export function getAnalyticsUser(): AnalyticsUserContext | null {
  return cachedUser;
}

export function pushDataLayer(payload: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
}

function withGlobals(
  event: string,
  params: Record<string, unknown> = {},
  pathname?: string
): Record<string, unknown> {
  const path = pathname ?? (typeof window !== 'undefined' ? window.location.pathname : cachedPath ?? '/');
  const section = resolvePageSection(path);
  const globals: GlobalEventParams = {
    portal_section: section.portal_section,
    page_path: path,
    app_role: cachedUser?.app_role ?? null,
  };
  if (cachedUser?.id) {
    globals.user_id = cachedUser.id;
  }
  return { event, ...globals, ...params };
}

export function trackPortalEvent(
  event: string,
  params: Record<string, unknown> = {},
  pathname?: string
): void {
  pushDataLayer(withGlobals(event, params, pathname));
}

export function setAnalyticsUser(ctx: AnalyticsUserContext): void {
  const key = userContextKey(ctx);
  cachedUser = ctx;
  if (lastUserContextKey === key) return;
  lastUserContextKey = key;
  pushDataLayer({
    event: 'user_context',
    user_id: ctx.id,
    user_properties: {
      app_role: ctx.app_role,
      acc_role: ctx.acc_role,
      portal_access: true,
    },
  });
}

export function clearAnalyticsUser(): void {
  if (!cachedUser && lastUserContextKey === null) return;
  cachedUser = null;
  lastUserContextKey = null;
  pushDataLayer({
    event: 'user_context',
    user_id: undefined,
    user_properties: undefined,
  });
}

export function trackPageView(pathname: string): void {
  cachedPath = pathname;
  const section = resolvePageSection(pathname);
  const authState = cachedUser ? 'authenticated' : 'anonymous';
  const payload: Record<string, unknown> = {
    event: 'page_view',
    page_title: typeof document !== 'undefined' ? document.title : '',
    page_location: typeof window !== 'undefined' ? window.location.href : pathname,
    page_path: pathname,
    portal_section: section.portal_section,
    page_type: section.page_type,
    auth_state: authState,
    app_role: cachedUser?.app_role ?? null,
  };
  if (section.cc_area) payload.cc_area = section.cc_area;
  if (section.content_type) payload.content_type = section.content_type;
  if (cachedUser?.id) payload.user_id = cachedUser.id;

  // Command center: un evento específico (sin duplicar page_view genérico)
  if (section.portal_section === 'command_center') {
    pushDataLayer({ ...payload, event: 'cc_page_view' });
    return;
  }
  if (section.content_type) {
    pushDataLayer({
      ...payload,
      event: 'content_view',
      content_type: section.content_type,
    });
  }
  pushDataLayer(payload);
}
