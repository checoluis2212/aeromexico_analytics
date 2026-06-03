import { GUEST_ENTRY_PATH } from '@/lib/access-requests/login-copy';

/** Destino para invitados sin sesión aprobada (pre-entry obligatorio) */
export function guestEntryHref(intent?: 'pedir' | 'ai-agent' | 'login'): string {
  if (!intent) return GUEST_ENTRY_PATH;
  return `${GUEST_ENTRY_PATH}?intent=${intent}`;
}
