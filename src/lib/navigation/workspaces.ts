import type { AppRole } from '@/lib/auth/access';
import { clientAreaPrefixes } from '@/lib/constants';

const AUTH_CHROME_EXEMPT = ['/login', '/recuperar'] as const;

export function isAuthChromeExempt(pathname: string): boolean {
  return AUTH_CHROME_EXEMPT.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export function isCommandCenterPath(pathname: string): boolean {
  return pathname === '/command-center' || pathname.startsWith('/command-center/');
}

export function isClientWorkspacePath(pathname: string): boolean {
  return clientAreaPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/** Sitio público (site): sidebar de operación para Sergio en casi todas las rutas */
export function shouldShowSergioSidebar(
  pathname: string,
  appRole: AppRole | null,
  isAuthenticated: boolean
): boolean {
  if (!isAuthenticated || appRole !== 'sergio_admin') return false;
  if (isAuthChromeExempt(pathname)) return false;
  if (isCommandCenterPath(pathname)) return false;
  return true;
}

/** Stakeholders: sidebar en portal cliente */
export function shouldShowStakeholderSidebar(
  pathname: string,
  appRole: AppRole | null,
  isAuthenticated: boolean
): boolean {
  if (!isAuthenticated || appRole !== 'stakeholder') return false;
  if (isAuthChromeExempt(pathname)) return false;
  if (isCommandCenterPath(pathname)) return false;
  return isClientWorkspacePath(pathname);
}

/** Cliente: sidebar en rutas del portal de pedidos */
export function shouldShowClientSidebar(
  pathname: string,
  appRole: AppRole | null,
  isAuthenticated: boolean
): boolean {
  if (!isAuthenticated || appRole !== 'client') return false;
  if (isAuthChromeExempt(pathname)) return false;
  if (isCommandCenterPath(pathname)) return false;
  return isClientWorkspacePath(pathname);
}

export function shouldShowInternalSidebar(
  pathname: string,
  appRole: AppRole | null,
  isAuthenticated: boolean
): boolean {
  return (
    shouldShowSergioSidebar(pathname, appRole, isAuthenticated) ||
    shouldShowStakeholderSidebar(pathname, appRole, isAuthenticated)
  );
}
