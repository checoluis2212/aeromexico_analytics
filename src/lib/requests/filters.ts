import type { MyRequestRow } from '@/components/my-requests/request-card';
import { isRequestPending } from '@/components/my-requests/request-card';

export type DateRangeFilter = 'all' | '7d' | '30d' | '90d';

export type RequestFilterState = {
  q: string;
  user: string;
  area: string;
  status: 'all' | 'pending' | 'done';
  priority: string;
  type: string;
  dateRange: DateRangeFilter;
};

export const defaultFilters: RequestFilterState = {
  q: '',
  user: 'all',
  area: 'all',
  status: 'all',
  priority: 'all',
  type: 'all',
  dateRange: 'all',
};

function dateRangeCutoff(range: DateRangeFilter): Date | null {
  if (range === 'all') return null;
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

export function extractRequesters(requests: MyRequestRow[]): { email: string; name: string }[] {
  const map = new Map<string, string>();
  for (const r of requests) {
    if (r.requester_email) map.set(r.requester_email, r.requester_name ?? r.requester_email);
  }
  return Array.from(map.entries())
    .map(([email, name]) => ({ email, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function extractAreas(requests: MyRequestRow[]): string[] {
  const set = new Set<string>();
  for (const r of requests) {
    if (r.company) set.add(r.company);
  }
  return Array.from(set).sort();
}

export function filterRequests(
  requests: MyRequestRow[],
  filters: RequestFilterState
): MyRequestRow[] {
  return requests.filter((r) => {
    if (filters.user !== 'all' && r.requester_email !== filters.user) return false;
    if (filters.area !== 'all' && r.company !== filters.area) return false;
    if (filters.priority !== 'all' && r.priority !== filters.priority) return false;
    if (filters.type !== 'all' && r.type !== filters.type) return false;

    if (filters.status === 'pending' && !isRequestPending(r)) return false;
    if (filters.status === 'done' && isRequestPending(r)) return false;

    const cutoff = dateRangeCutoff(filters.dateRange);
    if (cutoff && new Date(r.created_at) < cutoff) return false;

    if (filters.q.trim()) {
      const q = filters.q.toLowerCase();
      const haystack = [
        r.title,
        r.requester_name,
        r.requester_email,
        r.company,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}
