CREATE TABLE IF NOT EXISTS manga (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text,
  rating text,
  rank text,
  alternative text,
  author text,
  artist text,
  genres text,
  type text,
  release_year text,
  status text DEFAULT 'OnGoing',
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manga_id uuid NOT NULL REFERENCES manga(id) ON DELETE CASCADE,
  title text NOT NULL,
  url text,
  chapter_number numeric NOT NULL,
  published_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create chapter_images table
CREATE TABLE IF NOT EXISTS chapter_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  page_number integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chapters_manga_id ON chapters(manga_id);
CREATE INDEX IF NOT EXISTS idx_chapters_number ON chapters(chapter_number);
CREATE INDEX IF NOT EXISTS idx_chapter_images_chapter_id ON chapter_images(chapter_id);
CREATE INDEX IF NOT EXISTS idx_chapter_images_page_number ON chapter_images(page_number);

-- Enable Row Level Security
ALTER TABLE manga ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapter_images ENABLE ROW LEVEL SECURITY;

-- Create public read policies (anyone can view)
CREATE POLICY "Anyone can view manga"
  ON manga FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view chapters"
  ON chapters FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view chapter images"
  ON chapter_images FOR SELECT
  TO anon, authenticated
  USING (true);
