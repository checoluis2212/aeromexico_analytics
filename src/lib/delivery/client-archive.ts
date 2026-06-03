import type { RequestDelivery } from '@/lib/delivery/types';

export type ClientArchiveRequest = {
  id: string;
  reference_code: string | null;
  title: string;
  created_at: string;
};

export type ClientArchiveEntry = RequestDelivery & {
  request: ClientArchiveRequest;
};

export function buildClientArchive(
  requests: ClientArchiveRequest[],
  deliveries: RequestDelivery[]
): ClientArchiveEntry[] {
  const byId = new Map(requests.map((r) => [r.id, r]));
  return deliveries
    .map((d) => {
      const request = byId.get(d.request_id);
      if (!request) return null;
      return { ...d, request };
    })
    .filter((row): row is ClientArchiveEntry => row !== null)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
}

export function groupArchiveByRequest(
  entries: ClientArchiveEntry[]
): { request: ClientArchiveRequest; items: RequestDelivery[] }[] {
  const map = new Map<string, { request: ClientArchiveRequest; items: RequestDelivery[] }>();
  for (const entry of entries) {
    const existing = map.get(entry.request_id);
    if (existing) {
      existing.items.push(entry);
    } else {
      map.set(entry.request_id, { request: entry.request, items: [entry] });
    }
  }
  return [...map.values()].sort(
    (a, b) =>
      new Date(b.request.created_at).getTime() - new Date(a.request.created_at).getTime()
  );
}
