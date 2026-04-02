-- Create campaigns table for promotion copy and tracking
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'COMPLETED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create promotion copy table
CREATE TABLE IF NOT EXISTS promotion_copies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'xiaohongshu', 'jike', 'linkedin', 'facebook')),
  copy TEXT NOT NULL,
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create short links table
CREATE TABLE IF NOT EXISTS short_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  short_code TEXT UNIQUE NOT NULL,
  platform TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create click tracking table
CREATE TABLE IF NOT EXISTS link_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  short_link_id UUID REFERENCES short_links(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  referer TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_page_id ON campaigns(page_id);
CREATE INDEX IF NOT EXISTS idx_promotion_copies_campaign_id ON promotion_copies(campaign_id);
CREATE INDEX IF NOT EXISTS idx_short_links_campaign_id ON short_links(campaign_id);
CREATE INDEX IF NOT EXISTS idx_short_links_short_code ON short_links(short_code);
CREATE INDEX IF NOT EXISTS idx_link_clicks_short_link_id ON link_clicks(short_link_id);

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_copies ENABLE ROW LEVEL SECURITY;
ALTER TABLE short_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own campaigns" ON campaigns
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own promotion copies" ON promotion_copies
  USING (EXISTS (
    SELECT 1 FROM campaigns 
    WHERE campaigns.id = promotion_copies.campaign_id 
    AND campaigns.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their own short links" ON short_links
  USING (EXISTS (
    SELECT 1 FROM campaigns 
    WHERE campaigns.id = short_links.campaign_id 
    AND campaigns.user_id = auth.uid()
  ));

CREATE POLICY "Users can view their own link clicks" ON link_clicks
  USING (EXISTS (
    SELECT 1 FROM short_links 
    JOIN campaigns ON short_links.campaign_id = campaigns.id 
    WHERE link_clicks.short_link_id = short_links.id 
    AND campaigns.user_id = auth.uid()
  ));
