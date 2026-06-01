-- Analytics Command Center — Extended Schema
-- Aerolínea global · Enterprise Analytics Platform

-- Roles ACC
DO $$ BEGIN
  CREATE TYPE acc_role AS ENUM (
    'analytics_lead', 'analytics_consultant', 'manager', 'director',
    'product_owner', 'developer', 'qa', 'read_only'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Delivery board statuses
DO $$ BEGIN
  CREATE TYPE delivery_status AS ENUM (
    'backlog', 'discovery', 'requirements', 'ready_for_development',
    'development', 'analytics_qa', 'ready_for_release', 'done', 'blocked'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Extended request types
DO $$ BEGIN
  CREATE TYPE acc_request_type AS ENUM (
    'dashboard', 'tracking', 'event', 'investigation', 'funnel',
    'qa_analytics', 'gtm_implementation', 'bigquery'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE report_category AS ENUM (
    'acquisition', 'ecommerce', 'revenue', 'customer_journey',
    'marketing', 'mobile', 'product_analytics'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE metric_type AS ENUM ('kpi', 'metric', 'dimension', 'event', 'parameter');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM ('request', 'comment', 'approval', 'release', 'mention', 'system');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Extend profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS acc_role acc_role DEFAULT 'read_only';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS team TEXT;

-- Extend requests for ACC
ALTER TABLE requests ADD COLUMN IF NOT EXISTS business_goal TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS problem_statement TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS decision_to_be_made TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS delivery_status delivery_status DEFAULT 'backlog';
ALTER TABLE requests ADD COLUMN IF NOT EXISTS story_points INT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS sprint_id UUID;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS ai_user_story TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS ai_acceptance_criteria JSONB DEFAULT '[]';
ALTER TABLE requests ADD COLUMN IF NOT EXISTS ai_analytics_requirements JSONB DEFAULT '[]';
ALTER TABLE requests ADD COLUMN IF NOT EXISTS ai_measurement_plan TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS ai_qa_checklist JSONB DEFAULT '[]';
ALTER TABLE requests ADD COLUMN IF NOT EXISTS lead_time_hours NUMERIC;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS cycle_time_hours NUMERIC;

-- Attachments
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sprints
CREATE TABLE IF NOT EXISTS sprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  goal TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  capacity_points INT DEFAULT 40,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE requests DROP CONSTRAINT IF EXISTS requests_sprint_id_fkey;
ALTER TABLE requests ADD CONSTRAINT requests_sprint_id_fkey
  FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE SET NULL;

-- Stories & Tasks
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  story_points INT DEFAULT 0,
  delivery_status delivery_status DEFAULT 'backlog',
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Report Marketplace
CREATE TABLE IF NOT EXISTS report_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category report_category NOT NULL,
  business_questions TEXT[] DEFAULT '{}',
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  data_source TEXT NOT NULL,
  refresh_frequency TEXT,
  dashboard_url TEXT,
  view_count INT DEFAULT 0,
  popularity_score NUMERIC(5,2) DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Data Dictionary
CREATE TABLE IF NOT EXISTS metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type metric_type NOT NULL,
  definition TEXT NOT NULL,
  business_definition TEXT,
  formula TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  examples TEXT[] DEFAULT '{}',
  related_report_ids UUID[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dimensions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  definition TEXT NOT NULL,
  data_type TEXT,
  source TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  examples TEXT[] DEFAULT '{}',
  related_metric_ids UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Extend event catalog
ALTER TABLE event_catalog ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE event_catalog ADD COLUMN IF NOT EXISTS data_layer_spec JSONB DEFAULT '{}';
ALTER TABLE event_catalog ADD COLUMN IF NOT EXISTS gtm_mapping JSONB DEFAULT '{}';
ALTER TABLE event_catalog ADD COLUMN IF NOT EXISTS ga4_mapping JSONB DEFAULT '{}';
ALTER TABLE event_catalog ADD COLUMN IF NOT EXISTS bigquery_mapping JSONB DEFAULT '{}';
ALTER TABLE event_catalog ADD COLUMN IF NOT EXISTS dashboard_usage TEXT[] DEFAULT '{}';
ALTER TABLE event_catalog ADD COLUMN IF NOT EXISTS dependencies TEXT[] DEFAULT '{}';

CREATE TABLE IF NOT EXISTS event_parameters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES event_catalog(id) ON DELETE CASCADE,
  param_name TEXT NOT NULL,
  param_type TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT FALSE,
  example_value TEXT,
  UNIQUE(event_id, param_name)
);

-- Knowledge articles versioning
ALTER TABLE articles ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES articles(id) ON DELETE SET NULL;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS doc_type TEXT DEFAULT 'guide';

-- Analytics scores (maturity)
CREATE TABLE IF NOT EXISTS analytics_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dimension TEXT NOT NULL,
  score INT NOT NULL CHECK (score >= 0 AND score <= 100),
  strengths TEXT[] DEFAULT '{}',
  risks TEXT[] DEFAULT '{}',
  opportunities TEXT[] DEFAULT '{}',
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assessed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS analytics_health (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  health_score INT NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
  tracking_coverage NUMERIC(5,2),
  ga4_status TEXT DEFAULT 'healthy',
  bigquery_status TEXT DEFAULT 'healthy',
  gtm_status TEXT DEFAULT 'healthy',
  roi_estimate NUMERIC,
  hours_saved NUMERIC,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activity & Notifications
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Copilot conversations
CREATE TABLE IF NOT EXISTS copilot_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  module TEXT NOT NULL,
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_requests_delivery_status ON requests(delivery_status);
CREATE INDEX IF NOT EXISTS idx_requests_sprint ON requests(sprint_id);
CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category);
CREATE INDEX IF NOT EXISTS idx_metrics_type ON metrics(type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- Role helpers
CREATE OR REPLACE FUNCTION get_acc_role()
RETURNS acc_role AS $$
  SELECT acc_role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION is_analytics_team()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid()
    AND acc_role IN ('analytics_lead', 'analytics_consultant')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION can_manage_requests()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid()
    AND acc_role IN ('analytics_lead', 'analytics_consultant', 'manager', 'director', 'product_owner')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION can_edit_board()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid()
    AND acc_role IN ('analytics_lead', 'analytics_consultant', 'developer')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- RLS
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE dimensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE copilot_sessions ENABLE ROW LEVEL SECURITY;

-- Policies: authenticated read for internal platform
CREATE POLICY "acc_attachments_read" ON attachments FOR SELECT TO authenticated USING (true);
CREATE POLICY "acc_attachments_insert" ON attachments FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "acc_sprints_read" ON sprints FOR SELECT TO authenticated USING (true);
CREATE POLICY "acc_sprints_manage" ON sprints FOR ALL TO authenticated USING (is_analytics_team());

CREATE POLICY "acc_stories_read" ON stories FOR SELECT TO authenticated USING (true);
CREATE POLICY "acc_stories_manage" ON stories FOR ALL TO authenticated USING (can_edit_board() OR is_analytics_team());

CREATE POLICY "acc_tasks_read" ON tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "acc_tasks_manage" ON tasks FOR ALL TO authenticated USING (can_edit_board() OR is_analytics_team());

CREATE POLICY "acc_reports_read" ON reports FOR SELECT TO authenticated USING (is_published = true OR is_analytics_team());
CREATE POLICY "acc_reports_manage" ON reports FOR ALL TO authenticated USING (is_analytics_team());

CREATE POLICY "acc_report_categories_read" ON report_categories FOR SELECT TO authenticated USING (true);

CREATE POLICY "acc_metrics_read" ON metrics FOR SELECT TO authenticated USING (is_active = true OR is_analytics_team());
CREATE POLICY "acc_metrics_manage" ON metrics FOR ALL TO authenticated USING (is_analytics_team());

CREATE POLICY "acc_dimensions_read" ON dimensions FOR SELECT TO authenticated USING (is_active = true OR is_analytics_team());
CREATE POLICY "acc_dimensions_manage" ON dimensions FOR ALL TO authenticated USING (is_analytics_team());

CREATE POLICY "acc_event_params_read" ON event_parameters FOR SELECT TO authenticated USING (true);
CREATE POLICY "acc_event_params_manage" ON event_parameters FOR ALL TO authenticated USING (is_analytics_team());

CREATE POLICY "acc_scores_read" ON analytics_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "acc_scores_manage" ON analytics_scores FOR ALL TO authenticated USING (is_analytics_team());

CREATE POLICY "acc_health_read" ON analytics_health FOR SELECT TO authenticated USING (true);
CREATE POLICY "acc_health_manage" ON analytics_health FOR ALL TO authenticated USING (is_analytics_team());

CREATE POLICY "acc_activity_read" ON activity_logs FOR SELECT TO authenticated USING (is_analytics_team() OR user_id = auth.uid());
CREATE POLICY "acc_activity_insert" ON activity_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "acc_notifications_own" ON notifications FOR ALL TO authenticated USING (user_id = auth.uid());

CREATE POLICY "acc_copilot_own" ON copilot_sessions FOR ALL TO authenticated USING (user_id = auth.uid());
