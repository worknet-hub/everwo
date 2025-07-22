-- Simple test to check if the likes system is working

-- 1. Check if triggers exist
SELECT 'Triggers exist' as status, count(*) as count
FROM information_schema.triggers 
WHERE trigger_name LIKE '%likes%' 
AND event_object_table = 'thought_likes';

-- 2. Check if trigger function exists
SELECT 'Trigger function exists' as status, count(*) as count
FROM information_schema.routines 
WHERE routine_name = 'update_likes_count';

-- 3. Check if tables exist and have data
SELECT 'Thoughts table' as table_name, count(*) as row_count
FROM thoughts;

SELECT 'Thought likes table' as table_name, count(*) as row_count
FROM thought_likes;

-- 4. Check if real-time is enabled for these tables
SELECT 'Real-time enabled' as status, count(*) as count
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename IN ('thoughts', 'thought_likes');

-- 5. Show some sample thoughts with their like counts
SELECT 
    id,
    user_id,
    substring(content, 1, 50) as content_preview,
    likes_count
FROM thoughts 
ORDER BY created_at DESC 
LIMIT 5; 