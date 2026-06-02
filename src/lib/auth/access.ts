export type ProfileAccess = {
  role: string;
  acc_role: string | null;
  email?: string | null;
};

export type AppRole = 'sergio_admin' | 'stakeholder' | 'client';

const STAKEHOLDER_ACC_ROLES = new Set([
  'manager',
  'director',
  'product_owner',
  'developer',
  'qa',
  'read_only',
]);

const SERGIO_ONLY_PREFIXES = [
  '/command-center/admin',
  '/command-center/pedidos',
  '/command-center/workspace',
];

/** Sergio Burgos — operación completa (aceptar pedidos, semáforo, bandeja) */
export function isSergioAdmin(profile: ProfileAccess | null): boolean {
  if (!profile) return false;
  if (['admin', 'consultant'].includes(profile.role)) return true;
  if (profile.acc_role === 'analytics_lead' || profile.acc_role === 'analytics_consultant') {
    return true;
  }
  const allowlist = process.env.SERGIO_ADMIN_EMAILS?.split(',').map((e) => e.trim().toLowerCase()) ?? [];
  if (profile.email && allowlist.includes(profile.email.toLowerCase())) return true;
  return false;
}

/** Stakeholders internos — ven resumen y reportes, no operan pedidos */
export function isStakeholder(profile: ProfileAccess | null): boolean {
  if (!profile || isSergioAdmin(profile)) return false;
  return STAKEHOLDER_ACC_ROLES.has(profile.acc_role ?? '');
}

export function getAppRole(profile: ProfileAccess | null): AppRole {
  if (isSergioAdmin(profile)) return 'sergio_admin';
  if (isStakeholder(profile)) return 'stakeholder';
  return 'client';
}

export function canAccessCommandCenter(profile: ProfileAccess | null): boolean {
  return isSergioAdmin(profile) || isStakeholder(profile);
}

/** APIs sensibles: aceptación, semáforo, estado de pedidos */
export function hasInternalAccess(profile: ProfileAccess | null): boolean {
  return isSergioAdmin(profile);
}

export function isSergioOnlyRoute(pathname: string): boolean {
  return SERGIO_ONLY_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export function getPostLoginPath(profile: ProfileAccess | null, redirect?: string | null): string {
  if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
    return redirect;
  }
  const role = getAppRole(profile);
  if (role === 'sergio_admin') return '/command-center/admin';
  if (role === 'stakeholder') return '/command-center/executive';
  return '/mis-pedidos';
}

export function getCommandCenterHome(profile: ProfileAccess | null): string {
  return getPostLoginPath(profile);
}

export const APP_ROLE_LABELS: Record<AppRole, string> = {
  sergio_admin: 'Panel Sergio · Admin',
  stakeholder: 'Centro Analytics · Lectura',
  client: 'Mis pedidos',
};
