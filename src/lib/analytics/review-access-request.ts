import { trackPortalEvent } from '@/lib/analytics/data-layer';

/** Cliente admin: revisar solicitud de acceso (UI futura o scripts) */
export async function reviewPlatformAccessRequest(
  id: string,
  decision: 'approved' | 'rejected',
  notes?: string | null
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`/api/admin/access-requests/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status: decision, review_notes: notes ?? null }),
  });
  const json = await res.json().catch(() => ({}));
  if (res.ok) {
    trackPortalEvent('cc_access_decision', {
      decision,
      access_request_id: id,
    });
    return { ok: true };
  }
  return { ok: false, error: json.error ?? 'Error al revisar solicitud' };
}
