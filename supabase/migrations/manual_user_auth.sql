ALTER TABLE pages 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS anonymous_id TEXT;

CREATE INDEX IF NOT EXISTS idx_pages_user_id ON pages(user_id);
CREATE INDEX IF NOT EXISTS idx_pages_status_user_id ON pages(status, user_id);
CREATE INDEX IF NOT EXISTS idx_pages_anonymous_id ON pages(anonymous_id);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pages" ON pages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pages" ON pages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pages" ON pages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pages" ON pages
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public can view active pages" ON pages
  FOR SELECT USING (status = 'active' AND user_id IS NULL);

CREATE POLICY "Anonymous can insert pages" ON pages
  FOR INSERT WITH CHECK (user_id IS NULL AND anonymous_id IS NOT NULL);

UPDATE pages SET user_id = NULL WHERE user_id IS NOT SET;