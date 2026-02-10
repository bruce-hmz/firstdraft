SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pages' AND table_schema = 'public';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pages' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE pages ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pages' 
        AND column_name = 'anonymous_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE pages ADD COLUMN anonymous_id TEXT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_pages_user_id ON pages(user_id);
CREATE INDEX IF NOT EXISTS idx_pages_anonymous_id ON pages(anonymous_id);

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pages' AND table_schema = 'public'
AND column_name IN ('user_id', 'anonymous_id');