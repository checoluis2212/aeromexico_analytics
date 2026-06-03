import type { SergioCapacity } from '@/lib/availability-config';

export type AdminPendingActionType =
  | 'accept_request'
  | 'reject_request'
  | 'set_capacity'
  | 'add_comment';

export type AdminPendingAction = {
  type: AdminPendingActionType;
  summary: string;
  requestId?: string;
  requestTitle?: string;
  referenceCode?: string | null;
  committed_due_date?: string | null;
  sergio_notes?: string | null;
  capacity?: SergioCapacity;
  capacity_note?: string | null;
  comment?: string;
  is_internal?: boolean;
};

export type AdminToolReadResult = {
  tool: string;
  markdown: string;
};
