-- Create domains table
CREATE TABLE IF NOT EXISTS domains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'ERROR')),
  verification_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id and domain
CREATE INDEX IF NOT EXISTS idx_domains_user_id ON domains(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_domains_domain ON domains(domain);

-- Enable RLS
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can manage their own domains" ON domains
  USING (user_id = auth.uid());
