-- =============================================
-- UMAMANDA PERCEPTIONS — DATABASE SETUP
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. PHOTOS TABLE
CREATE TABLE IF NOT EXISTS photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  caption TEXT DEFAULT '',
  category TEXT DEFAULT '',
  location TEXT DEFAULT '',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PERCEPTIONS TABLE
CREATE TABLE IF NOT EXISTS perceptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. SITE CONTENT TABLE (key-value for CMS)
CREATE TABLE IF NOT EXISTS site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_photos_display_order ON photos(display_order);
CREATE INDEX IF NOT EXISTS idx_perceptions_photo_id ON perceptions(photo_id);
CREATE INDEX IF NOT EXISTS idx_site_content_key ON site_content(key);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE perceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- PHOTOS: public can read, admin can do everything
CREATE POLICY "Public can view photos"
  ON photos FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert photos"
  ON photos FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update photos"
  ON photos FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete photos"
  ON photos FOR DELETE
  USING (auth.role() = 'authenticated');

-- PERCEPTIONS: public can read + insert, admin can delete
CREATE POLICY "Public can view perceptions"
  ON perceptions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can submit perceptions"
  ON perceptions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete perceptions"
  ON perceptions FOR DELETE
  USING (auth.role() = 'authenticated');

-- SITE CONTENT: public can read, admin can update
CREATE POLICY "Public can view site content"
  ON site_content FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert site content"
  ON site_content FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update site content"
  ON site_content FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete site content"
  ON site_content FOR DELETE
  USING (auth.role() = 'authenticated');

-- =============================================
-- STORAGE BUCKET
-- =============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- STORAGE POLICIES
CREATE POLICY "Public can view photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'photos');

CREATE POLICY "Authenticated users can upload photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'photos' AND auth.role() = 'authenticated');

-- =============================================
-- SEED DATA — default site content
-- =============================================

INSERT INTO site_content (key, value) VALUES
  ('site_name', 'UMANANDA'),
  ('location', 'ASSAM'),
  ('date', '23 · 08 · 2026'),
  ('hero_title', 'A photographic perception archive documenting the Umananda Temple on Peacock Island — through collective anonymous observation.'),
  ('about_text', 'Umananda Perceptions is a visual ethnography project exploring the Umananda Temple on Peacock Island, Assam. Through anonymous collective observation, we build a layered understanding of sacred space — one that resists singular narratives and invites multiple ways of seeing.'),
  ('credits_design', 'Kundavai'),
  ('credits_images', 'Kundavai MKS\nSabaahat Wani')
ON CONFLICT (key) DO NOTHING;
