import type { ProfileAccess } from '@/lib/auth/access';
import { canAccessCommandCenter } from '@/lib/auth/access';

export type ProfilePlatformAccess = ProfileAccess & {
  platform_access_approved?: boolean | null;
};

export function hasPlatformAccess(profile: ProfilePlatformAccess | null): boolean {
  if (!profile) return false;
  if (canAccessCommandCenter(profile)) return true;
  if (profile.platform_access_approved === true) return true;
  return false;
}

export const PLATFORM_ACCESS_PATH = '/access';

/** Rutas que no requieren pasar por el Pre-Entry Portal */
export function isPlatformAccessExemptPath(pathname: string): boolean {
  return (
    pathname === PLATFORM_ACCESS_PATH ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/recuperar') ||
    pathname.startsWith('/auth/')
  );
}

/** Rutas del portal que exigen solicitud aprobada (o rol interno) */
export function isPlatformGatedPath(pathname: string): boolean {
  if (isPlatformAccessExemptPath(pathname)) return false;
  if (pathname.startsWith('/api/')) return false;

  const gatedPrefixes = [
    '/',
    '/mis-pedidos',
    '/pedir',
    '/preguntale',
    '/perfil',
    '/ai-agent',
    '/ai-insights',
    '/analytics-os',
    '/event-catalog',
    '/faq',
    '/glosario',
    '/about',
    '/contact',
    '/working-with-me',
    '/command-center',
  ];

  return gatedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function platformAccessRedirectUrl(
  request: { nextUrl: { clone: () => URL } },
  email?: string | null,
  state: 'pending' | 'request' = 'request'
): URL {
  const url = request.nextUrl.clone();
  url.pathname = PLATFORM_ACCESS_PATH;
  url.search = '';
  if (state === 'pending') url.searchParams.set('state', 'pending');
  if (email) url.searchParams.set('email', email);
  return url;
}
