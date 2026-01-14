-- Verify and enable realtime for messages table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ypzpwjfddhnmuihnjhuo/sql/new

-- Check if messages table is in realtime publication
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
  AND tablename = 'messages';

-- If no results, add it:
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Also verify the table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'messages';
