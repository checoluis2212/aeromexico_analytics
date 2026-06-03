import type { MyRequestRow } from '@/components/my-requests/request-card';
import { DELIVERY_STATUSES } from '@/types/command-center';

export type SergioQueue = 'needs_accept' | 'active' | 'rejected' | 'done';

const DONE_DELIVERY = new Set(['done', 'cancelled', 'completed']);
const URGENT = new Set(['p0_critical', 'p1_high']);

const PRIORITY_RANK: Record<string, number> = {
  p0_critical: 0,
  p1_high: 1,
  p2_medium: 2,
  p3_low: 3,
};

export function getSergioQueue(request: MyRequestRow): SergioQueue {
  const decision = request.sergio_decision ?? 'pending';
  const delivery = request.delivery_status ?? request.status ?? 'backlog';

  if (decision === 'pending') return 'needs_accept';
  if (decision === 'rejected') return 'rejected';
  if (DONE_DELIVERY.has(delivery)) return 'done';
  return 'active';
}

export function deliveryStatusLabel(status: string | null | undefined): string {
  if (!status) return 'En cola';
  const found = DELIVERY_STATUSES.find((s) => s.value === status);
  if (found) return found.label;
  return status.replace(/_/g, ' ');
}

export function isOverdueDueDate(committedDueDate: string | null | undefined): boolean {
  if (!committedDueDate) return false;
  const due = new Date(committedDueDate);
  due.setHours(23, 59, 59, 999);
  return due < new Date();
}

export function waitingHoursSince(createdAt: string): number {
  return (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
}

export function isWaitingTooLong(createdAt: string, thresholdHours = 24): boolean {
  return waitingHoursSince(createdAt) >= thresholdHours;
}

export function sortForSergioQueue(a: MyRequestRow, b: MyRequestRow, queue: SergioQueue): number {
  const pa = PRIORITY_RANK[a.priority] ?? 9;
  const pb = PRIORITY_RANK[b.priority] ?? 9;

  if (queue === 'needs_accept') {
    if (pa !== pb) return pa - pb;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  }

  if (queue === 'active') {
    const overdueA = isOverdueDueDate(a.committed_due_date) ? 0 : 1;
    const overdueB = isOverdueDueDate(b.committed_due_date) ? 0 : 1;
    if (overdueA !== overdueB) return overdueA - overdueB;
    if (pa !== pb) return pa - pb;
    if (a.committed_due_date && b.committed_due_date) {
      return new Date(a.committed_due_date).getTime() - new Date(b.committed_due_date).getTime();
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  }

  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

export type SergioInboxStats = {
  needsAccept: number;
  urgentNeedsAccept: number;
  waitingTooLong: number;
  active: number;
  overdue: number;
  blocked: number;
  rejected: number;
  done: number;
};

export function computeSergioInboxStats(requests: MyRequestRow[]): SergioInboxStats {
  const stats: SergioInboxStats = {
    needsAccept: 0,
    urgentNeedsAccept: 0,
    waitingTooLong: 0,
    active: 0,
    overdue: 0,
    blocked: 0,
    rejected: 0,
    done: 0,
  };

  for (const r of requests) {
    const queue = getSergioQueue(r);
    stats[queue === 'needs_accept' ? 'needsAccept' : queue === 'active' ? 'active' : queue === 'rejected' ? 'rejected' : 'done']++;

    if (queue === 'needs_accept') {
      if (URGENT.has(r.priority)) stats.urgentNeedsAccept++;
      if (isWaitingTooLong(r.created_at)) stats.waitingTooLong++;
    }

    if (queue === 'active') {
      if (isOverdueDueDate(r.committed_due_date)) stats.overdue++;
      if ((r.delivery_status ?? r.status) === 'blocked') stats.blocked++;
    }
  }

  return stats;
}

export const SERGIO_QUEUE_META: Record<
  SergioQueue,
  { label: string; empty: string; description: string }
> = {
  needs_accept: {
    label: 'Por aceptar',
    description: 'Están esperando tu “sí/no” y una fecha',
    empty: 'No hay nada esperando tu respuesta. Puedes revisar “En curso” o el semáforo.',
  },
  active: {
    label: 'En curso',
    description: 'Aceptados y avanzando',
    empty: 'Por ahora no tienes pedidos en curso.',
  },
  rejected: {
    label: 'Rechazados',
    description: 'Los que no pude tomar por capacidad o timing',
    empty: 'No has rechazado pedidos últimamente.',
  },
  done: {
    label: 'Cerrados',
    description: 'Entregados o cancelados',
    empty: 'Aún no hay pedidos cerrados.',
  },
};
