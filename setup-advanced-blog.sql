/*
  # Advanced Blog System for QR Tag System
  
  This drops any existing blog_posts table to fully replace it with the
  advanced architecture ported from the drawing project.
*/

DROP TABLE IF EXISTS blog_post_tags CASCADE;
DROP TABLE IF EXISTS blog_images CASCADE;
DROP TABLE IF EXISTS blog_generation_logs CASCADE;
DROP TABLE IF EXISTS blog_analytics CASCADE;
DROP TABLE IF EXISTS blog_settings CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS blog_tags CASCADE;
DROP TABLE IF EXISTS blog_categories CASCADE;

-- Create blog_categories table
CREATE TABLE IF NOT EXISTS blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  meta_description text DEFAULT '',
  color text DEFAULT '#3B82F6',
  icon text DEFAULT 'folder',
  post_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create blog_tags table
CREATE TABLE IF NOT EXISTS blog_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  post_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text DEFAULT '',
  content text NOT NULL,
  featured_image_url text,
  featured_image_alt text DEFAULT '',
  featured_image_credit text,
  category_id uuid REFERENCES blog_categories(id) ON DELETE SET NULL,
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  publish_date timestamptz,
  meta_title text,
  meta_description text,
  focus_keyword text,
  canonical_url text,
  seo_score integer DEFAULT 0 CHECK (seo_score >= 0 AND seo_score <= 100),
  readability_score integer DEFAULT 0,
  word_count integer DEFAULT 0,
  reading_time_minutes integer DEFAULT 0,
  view_count integer DEFAULT 0,
  is_ai_generated boolean DEFAULT false,
  ai_model_used text,
  generation_prompt text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create blog_post_tags junction table
CREATE TABLE IF NOT EXISTS blog_post_tags (
  post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Create blog_images table
CREATE TABLE IF NOT EXISTS blog_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt_text text DEFAULT '',
  caption text DEFAULT '',
  credit text DEFAULT '',
  source text DEFAULT 'upload' CHECK (source IN ('unsplash', 'pexels', 'upload')),
  source_id text,
  width integer,
  height integer,
  created_at timestamptz DEFAULT now()
);

-- Create blog_settings table
CREATE TABLE IF NOT EXISTS blog_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  description text DEFAULT '',
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

-- Create blog_generation_logs table
CREATE TABLE IF NOT EXISTS blog_generation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES blog_posts(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('success', 'failed', 'pending')),
  model_used text,
  prompt text,
  response jsonb,
  tokens_used integer DEFAULT 0,
  cost_usd numeric(10, 6) DEFAULT 0,
  error_message text,
  duration_ms integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create blog_analytics table
CREATE TABLE IF NOT EXISTS blog_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('view', 'share', 'click')),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  user_agent text,
  referrer text,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_publish_date ON blog_posts(publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON blog_tags(slug);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_post ON blog_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_created ON blog_analytics(created_at DESC);

-- Enable Row Level Security
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_categories
CREATE POLICY "Anyone can view categories"
  ON blog_categories FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage categories"
  ON blog_categories FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- RLS Policies for blog_tags
CREATE POLICY "Anyone can view tags"
  ON blog_tags FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage tags"
  ON blog_tags FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- RLS Policies for blog_posts
CREATE POLICY "Anyone can view published posts"
  ON blog_posts FOR SELECT TO public
  USING (status = 'published' AND (publish_date IS NULL OR publish_date <= now()));

CREATE POLICY "Authors can view their own posts"
  ON blog_posts FOR SELECT TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Admins can view all posts"
  ON blog_posts FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Authors can create posts"
  ON blog_posts FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Authors can update their own posts"
  ON blog_posts FOR UPDATE TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Admins can update all posts"
  ON blog_posts FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Admins can delete posts"
  ON blog_posts FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- RLS Policies for blog_post_tags
CREATE POLICY "Anyone can view post tags"
  ON blog_post_tags FOR SELECT TO public USING (true);

CREATE POLICY "Authors and admins can manage post tags"
  ON blog_post_tags FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM blog_posts WHERE blog_posts.id = post_id
      AND (blog_posts.author_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM blog_posts WHERE blog_posts.id = post_id
      AND (blog_posts.author_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
    )
  );

-- RLS Policies for blog_images
CREATE POLICY "Anyone can view images"
  ON blog_images FOR SELECT TO public USING (true);

CREATE POLICY "Authors and admins can manage images"
  ON blog_images FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM blog_posts WHERE blog_posts.id = post_id
      AND (blog_posts.author_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM blog_posts WHERE blog_posts.id = post_id
      AND (blog_posts.author_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
    )
  );

-- RLS Policies for blog_settings
CREATE POLICY "Admins can view settings"
  ON blog_settings FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Admins can manage settings"
  ON blog_settings FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- RLS Policies for blog_generation_logs
CREATE POLICY "Admins can view generation logs"
  ON blog_generation_logs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Admins can manage generation logs"
  ON blog_generation_logs FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- RLS Policies for blog_analytics
CREATE POLICY "Anyone can log analytics events"
  ON blog_analytics FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Admins can view analytics"
  ON blog_analytics FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_blog_categories_updated_at ON blog_categories;
CREATE TRIGGER update_blog_categories_updated_at
  BEFORE UPDATE ON blog_categories
  FOR EACH ROW EXECUTE FUNCTION update_blog_updated_at();

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_blog_updated_at();

-- Function to update category post count
CREATE OR REPLACE FUNCTION update_category_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE blog_categories
    SET post_count = (SELECT COUNT(*) FROM blog_posts WHERE category_id = NEW.category_id AND status = 'published')
    WHERE id = NEW.category_id;
  END IF;
  
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.category_id != NEW.category_id) THEN
    UPDATE blog_categories
    SET post_count = (SELECT COUNT(*) FROM blog_posts WHERE category_id = OLD.category_id AND status = 'published')
    WHERE id = OLD.category_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for category post count
DROP TRIGGER IF EXISTS update_category_post_count_trigger ON blog_posts;
CREATE TRIGGER update_category_post_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_category_post_count();

-- Function to update tag post count
CREATE OR REPLACE FUNCTION update_tag_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE blog_tags SET post_count = post_count + 1 WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE blog_tags SET post_count = post_count - 1 WHERE id = OLD.tag_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for tag post count
DROP TRIGGER IF EXISTS update_tag_post_count_trigger ON blog_post_tags;
CREATE TRIGGER update_tag_post_count_trigger
  AFTER INSERT OR DELETE ON blog_post_tags
  FOR EACH ROW EXECUTE FUNCTION update_tag_post_count();
