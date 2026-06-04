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

type AuthState = 'authenticated' | 'anonymous';

type GlobalEventParams = {
  portal_section?: PortalSection;
  page_path?: string;
  app_role?: AppRole | null;
  user_id?: string | null;
  auth_state?: AuthState;
};

let cachedUser: AnalyticsUserContext | null = null;
let cachedPath: string | null = null;
/** Evita repetir user_context si el usuario/rol no cambió */
let lastUserContextKey: string | null = null;
/** Evita page_view duplicados (SPA + Strict Mode) */
let lastPageViewKey: string | null = null;

function userContextKey(ctx: AnalyticsUserContext): string {
  return `${ctx.id}|${ctx.app_role}|${ctx.acc_role ?? ''}`;
}

function authState(): AuthState {
  return cachedUser ? 'authenticated' : 'anonymous';
}

export function getAnalyticsUser(): AnalyticsUserContext | null {
  return cachedUser;
}

export function pushDataLayer(payload: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
}

/** Variables persistentes en dataLayer para DLV de GTM (sin disparar evento). */
function pushGlobalUserState(userId: string | null, appRole: AppRole | null): void {
  pushDataLayer({
    user_id: userId,
    app_role: appRole,
    auth_state: userId ? 'authenticated' : 'anonymous',
  });
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
    auth_state: authState(),
    user_id: cachedUser?.id ?? null,
  };
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
  lastPageViewKey = null;

  pushGlobalUserState(ctx.id, ctx.app_role);
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
  lastPageViewKey = null;

  pushGlobalUserState(null, null);
  pushDataLayer({
    event: 'user_context',
    user_id: null,
    user_properties: null,
  });
}

function buildPageViewPayload(pathname: string): Record<string, unknown> {
  const section = resolvePageSection(pathname);
  return {
    event: 'page_view',
    user_id: cachedUser?.id ?? null,
    page_title: typeof document !== 'undefined' ? document.title : '',
    page_location: typeof window !== 'undefined' ? window.location.href : pathname,
    page_path: pathname,
    portal_section: section.portal_section,
    auth_state: authState(),
    app_role: cachedUser?.app_role ?? null,
  };
}

/**
 * page_view manual único por ruta + usuario.
 * Requiere user_context previo (AnalyticsProvider authReady).
 */
export function trackPageView(pathname: string): void {
  const search = typeof window !== 'undefined' ? window.location.search : '';
  const dedupeKey = `${pathname}${search}|${cachedUser?.id ?? 'anonymous'}`;
  if (lastPageViewKey === dedupeKey) return;
  lastPageViewKey = dedupeKey;
  cachedPath = pathname;

  pushDataLayer(buildPageViewPayload(pathname));
}
