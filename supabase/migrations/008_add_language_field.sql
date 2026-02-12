-- Add language field to user_stats table
-- Migration: 008_add_language_field
-- Description: Add language field to user_stats table for storing user's preferred language

ALTER TABLE user_stats
ADD COLUMN language TEXT DEFAULT 'zh-CN';

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_stats_language ON user_stats(language);

-- Add check constraint to ensure valid language values
ALTER TABLE user_stats
ADD CONSTRAINT user_stats_language_check CHECK (language IN ('zh-CN', 'en'));

-- Add comment on column
COMMENT ON COLUMN user_stats.language IS 'User preferred language (zh-CN or en)';
