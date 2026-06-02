export type ProfileAccess = {
  role: string;
  acc_role: string | null;
};

export function hasInternalAccess(profile: ProfileAccess | null): boolean {
  if (!profile) return false;
  return ['admin', 'consultant'].includes(profile.role) || !!profile.acc_role;
}

export function getPostLoginPath(profile: ProfileAccess | null, redirect?: string | null): string {
  if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
    return redirect;
  }
  return hasInternalAccess(profile) ? '/command-center/executive' : '/mis-pedidos';
}
