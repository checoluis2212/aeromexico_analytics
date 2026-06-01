export type UserRole = 'admin' | 'consultant' | 'client' | 'viewer';
export type RequestType = 'tracking' | 'dashboard' | 'funnel' | 'qa' | 'reporting' | 'investigation';
export type RequestStatus = 'submitted' | 'in_review' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';
export type RequestPriority = 'p0_critical' | 'p1_high' | 'p2_medium' | 'p3_low';
export type PlaybookCategory = 'ga4' | 'gtm' | 'data_layer' | 'bigquery' | 'looker_studio' | 'qa';
export type ArticleCategory = 'guide' | 'best_practice' | 'use_case' | 'reference';
export type FileType = 'csv' | 'xlsx' | 'ga4_export' | 'other';
export type InsightStatus = 'processing' | 'completed' | 'failed';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  company: string | null;
  role: UserRole;
  avatar_url: string | null;
  job_title: string | null;
  created_at: string;
  updated_at: string;
}

export interface Request {
  id: string;
  user_id: string | null;
  requester_name: string;
  requester_email: string;
  company: string | null;
  type: RequestType;
  title: string;
  description: string;
  business_context: string | null;
  priority: RequestPriority;
  status: RequestStatus;
  due_date: string | null;
  assigned_to: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Playbook {
  id: string;
  slug: string;
  title: string;
  category: PlaybookCategory;
  description: string | null;
  content: string;
  steps: { title: string; description: string }[];
  checklist: string[];
  version: string;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  category: ArticleCategory;
  excerpt: string | null;
  content: string;
  tags: string[];
  author_id: string | null;
  is_published: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface EventParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface EventCatalogItem {
  id: string;
  event_name: string;
  description: string;
  parameters: EventParameter[];
  example_code: string | null;
  use_cases: string[];
  category: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Insight {
  id: string;
  file_id: string | null;
  user_id: string | null;
  status: InsightStatus;
  executive_summary: string | null;
  insights: string[];
  anomalies: { metric: string; description: string; severity: string }[];
  trends: { metric: string; direction: string; change: string }[];
  recommendations: string[];
  raw_analysis: Record<string, unknown>;
  created_at: string;
  completed_at: string | null;
}

export interface UploadedFile {
  id: string;
  user_id: string | null;
  file_name: string;
  file_path: string;
  file_type: FileType;
  file_size: number | null;
  mime_type: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}
