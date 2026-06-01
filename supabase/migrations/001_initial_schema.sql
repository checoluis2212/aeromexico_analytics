-- Working With Sergio — Initial Schema
-- Analytics Consulting Portal

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'consultant', 'client', 'viewer');
CREATE TYPE request_type AS ENUM ('tracking', 'dashboard', 'funnel', 'qa', 'reporting', 'investigation');
CREATE TYPE request_status AS ENUM ('submitted', 'in_review', 'in_progress', 'blocked', 'completed', 'cancelled');
CREATE TYPE request_priority AS ENUM ('p0_critical', 'p1_high', 'p2_medium', 'p3_low');
CREATE TYPE playbook_category AS ENUM ('ga4', 'gtm', 'data_layer', 'bigquery', 'looker_studio', 'qa');
CREATE TYPE article_category AS ENUM ('guide', 'best_practice', 'use_case', 'reference');
CREATE TYPE file_type AS ENUM ('csv', 'xlsx', 'ga4_export', 'other');
CREATE TYPE insight_status AS ENUM ('processing', 'completed', 'failed');

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company TEXT,
  role user_role NOT NULL DEFAULT 'client',
  avatar_url TEXT,
  job_title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Requests
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  company TEXT,
  type request_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  business_context TEXT,
  priority request_priority NOT NULL DEFAULT 'p2_medium',
  status request_status NOT NULL DEFAULT 'submitted',
  due_date DATE,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE request_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Playbooks
CREATE TABLE playbooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category playbook_category NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  steps JSONB DEFAULT '[]',
  checklist JSONB DEFAULT '[]',
  version TEXT DEFAULT '1.0',
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Knowledge Base Articles
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category article_category NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- GA4 Event Catalog
CREATE TABLE event_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  parameters JSONB NOT NULL DEFAULT '[]',
  example_code TEXT,
  use_cases TEXT[] DEFAULT '{}',
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Analytics Notes (internal)
CREATE TABLE analytics_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Uploaded Files
CREATE TABLE uploaded_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type file_type NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Insights
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id UUID REFERENCES uploaded_files(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status insight_status NOT NULL DEFAULT 'processing',
  executive_summary TEXT,
  insights JSONB DEFAULT '[]',
  anomalies JSONB DEFAULT '[]',
  trends JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  raw_analysis JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Meetings
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT DEFAULT 30,
  attendee_email TEXT,
  request_id UUID REFERENCES requests(id) ON DELETE SET NULL,
  meeting_url TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_priority ON requests(priority);
CREATE INDEX idx_requests_user_id ON requests(user_id);
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_event_catalog_name ON event_catalog(event_name);
CREATE INDEX idx_insights_status ON insights(status);
CREATE INDEX idx_playbooks_category ON playbooks(category);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER requests_updated_at BEFORE UPDATE ON requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER playbooks_updated_at BEFORE UPDATE ON playbooks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER event_catalog_updated_at BEFORE UPDATE ON event_catalog FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER analytics_notes_updated_at BEFORE UPDATE ON analytics_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Helper: check if user is admin/consultant
CREATE OR REPLACE FUNCTION is_internal_user()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'consultant')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Internal users can view all profiles" ON profiles FOR SELECT USING (is_internal_user());
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- REQUESTS
CREATE POLICY "Anyone can submit requests" ON requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own requests" ON requests FOR SELECT USING (auth.uid() = user_id OR requester_email = (SELECT email FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Internal users can view all requests" ON requests FOR SELECT USING (is_internal_user());
CREATE POLICY "Internal users can update requests" ON requests FOR UPDATE USING (is_internal_user());

-- REQUEST COMMENTS
CREATE POLICY "View comments on accessible requests" ON request_comments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM requests r WHERE r.id = request_id
    AND (r.user_id = auth.uid() OR r.requester_email = (SELECT email FROM profiles WHERE id = auth.uid()) OR is_internal_user())
  )
  AND (NOT is_internal OR is_internal_user())
);
CREATE POLICY "Authenticated users can comment" ON request_comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Internal users manage comments" ON request_comments FOR ALL USING (is_internal_user());

-- PLAYBOOKS (public read)
CREATE POLICY "Published playbooks are public" ON playbooks FOR SELECT USING (is_published = true OR is_internal_user());
CREATE POLICY "Internal users manage playbooks" ON playbooks FOR ALL USING (is_internal_user());

-- ARTICLES (public read)
CREATE POLICY "Published articles are public" ON articles FOR SELECT USING (is_published = true OR is_internal_user());
CREATE POLICY "Internal users manage articles" ON articles FOR ALL USING (is_internal_user());

-- EVENT CATALOG (public read)
CREATE POLICY "Active events are public" ON event_catalog FOR SELECT USING (is_active = true OR is_internal_user());
CREATE POLICY "Internal users manage events" ON event_catalog FOR ALL USING (is_internal_user());

-- ANALYTICS NOTES (internal only)
CREATE POLICY "Internal users only" ON analytics_notes FOR ALL USING (is_internal_user());

-- UPLOADED FILES
CREATE POLICY "Users view own files" ON uploaded_files FOR SELECT USING (auth.uid() = user_id OR is_internal_user());
CREATE POLICY "Authenticated users upload" ON uploaded_files FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users delete own files" ON uploaded_files FOR DELETE USING (auth.uid() = user_id OR is_internal_user());

-- INSIGHTS
CREATE POLICY "Users view own insights" ON insights FOR SELECT USING (auth.uid() = user_id OR is_internal_user());
CREATE POLICY "Authenticated users create insights" ON insights FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Internal users update insights" ON insights FOR UPDATE USING (is_internal_user() OR auth.uid() = user_id);

-- MEETINGS
CREATE POLICY "Internal users manage meetings" ON meetings FOR ALL USING (is_internal_user());
CREATE POLICY "Clients view related meetings" ON meetings FOR SELECT USING (
  attendee_email = (SELECT email FROM profiles WHERE id = auth.uid())
);

-- Storage bucket policies (run in Supabase dashboard or via SQL)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('analytics-uploads', 'analytics-uploads', false);
