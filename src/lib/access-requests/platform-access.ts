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

export function isPlatformAccessExemptPath(pathname: string): boolean {
  return (
    pathname === PLATFORM_ACCESS_PATH ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/recuperar') ||
    pathname.startsWith('/auth/') ||
    pathname === '/contact' ||
    pathname === '/about' ||
    pathname === '/working-with-me' ||
    pathname === '/faq' ||
    pathname === '/glosario' ||
    pathname.startsWith('/api/access-requests')
  );
}
