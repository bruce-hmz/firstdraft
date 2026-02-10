-- Add user association to pages table
ALTER TABLE pages 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN anonymous_id TEXT;

-- Create indexes for performance
CREATE INDEX idx_pages_user_id ON pages(user_id);
CREATE INDEX idx_pages_status_user_id ON pages(status, user_id);
CREATE INDEX idx_pages_anonymous_id ON pages(anonymous_id);

-- Enable Row Level Security
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own pages" ON pages;
DROP POLICY IF EXISTS "Users can insert own pages" ON pages;
DROP POLICY IF EXISTS "Users can update own pages" ON pages;
DROP POLICY IF EXISTS "Anonymous can view active pages" ON pages;
DROP POLICY IF EXISTS "Public can view active pages" ON pages;

-- Create RLS policies
-- Users can view their own pages
CREATE POLICY "Users can view own pages" ON pages
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own pages
CREATE POLICY "Users can insert own pages" ON pages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own pages
CREATE POLICY "Users can update own pages" ON pages
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own pages
CREATE POLICY "Users can delete own pages" ON pages
  FOR DELETE USING (auth.uid() = user_id);

-- Anonymous users can view active pages (for public sharing)
CREATE POLICY "Public can view active pages" ON pages
  FOR SELECT USING (status = 'active' AND user_id IS NULL);

-- Anonymous users can insert pages (for guest usage)
CREATE POLICY "Anonymous can insert pages" ON pages
  FOR INSERT WITH CHECK (user_id IS NULL AND anonymous_id IS NOT NULL);

UPDATE pages SET user_id = NULL WHERE user_id IS NOT SET;