export type PlatformAccessStatus = 'pending' | 'approved' | 'rejected';

export type PlatformAccessRequest = {
  id: string;
  full_name: string;
  email: string;
  company: string;
  department: string;
  job_title: string;
  reason: string;
  status: PlatformAccessStatus;
  admin_notes: string | null;
  reviewer_notes: string | null;
  proposed_role: string | null;
  proposed_acc_role: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

export type PlatformAccessRequestInsert = {
  full_name: string;
  email: string;
  company: string;
  department: string;
  job_title: string;
  reason: string;
};

export type PlatformAccessReviewUpdate = {
  status: 'approved' | 'rejected';
  admin_notes?: string;
  reviewer_notes?: string;
  proposed_role?: 'client' | 'viewer' | 'consultant' | 'admin';
  proposed_acc_role?: string | null;
};
