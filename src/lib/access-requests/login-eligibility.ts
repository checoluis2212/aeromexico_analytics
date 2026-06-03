import type { ProfilePlatformAccess } from '@/lib/access-requests/platform-access';
import { hasPlatformAccess } from '@/lib/access-requests/platform-access';
import { canAccessCommandCenter } from '@/lib/auth/access';
import { LOGIN_PAGE_COPY } from '@/lib/access-requests/login-copy';

export type AccessRequestStatus = 'pending' | 'approved' | 'rejected' | null;

export type LoginEligibility =
  | { allowed: true }
  | {
      allowed: false;
      code: 'no_profile' | 'not_approved' | 'rejected' | 'pending';
      message: string;
      redirectPath: string;
    };

/** Usuario dado de alta = existe fila en `profiles` vinculada a auth */
export function isUserProvisioned(profile: ProfilePlatformAccess | null): boolean {
  return profile != null;
}

export function evaluateLoginEligibility(
  profile: ProfilePlatformAccess | null,
  requestStatus: AccessRequestStatus = null
): LoginEligibility {
  if (!isUserProvisioned(profile)) {
    if (requestStatus === 'approved') {
      return {
        allowed: false,
        code: 'no_profile',
        message: LOGIN_PAGE_COPY.errors.notProvisioned,
        redirectPath: '/access?state=approved-awaiting-provision',
      };
    }
    if (requestStatus === 'rejected') {
      return {
        allowed: false,
        code: 'rejected',
        message: LOGIN_PAGE_COPY.errors.rejected,
        redirectPath: '/access',
      };
    }
    if (requestStatus === 'pending') {
      return {
        allowed: false,
        code: 'pending',
        message: LOGIN_PAGE_COPY.errors.notApproved,
        redirectPath: '/access?state=pending',
      };
    }
    return {
      allowed: false,
      code: 'no_profile',
      message: LOGIN_PAGE_COPY.errors.notProvisioned,
      redirectPath: '/access',
    };
  }

  if (canAccessCommandCenter(profile) || hasPlatformAccess(profile)) {
    return { allowed: true };
  }

  return {
    allowed: false,
    code: 'not_approved',
    message: LOGIN_PAGE_COPY.errors.notApproved,
    redirectPath: '/access?state=pending',
  };
}
