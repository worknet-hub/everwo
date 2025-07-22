-- Test the likes system to ensure it's working properly
-- This script will help debug why likes aren't updating in real-time

-- 1. Check if the triggers exist
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%likes%' 
AND event_object_table = 'thought_likes';

-- 2. Check if the trigger function exists
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name = 'update_likes_count';

-- 3. Test the trigger function manually
-- First, let's see some sample thoughts
SELECT id, user_id, content, likes_count 
FROM thoughts 
WHERE likes_count > 0 
LIMIT 5;

-- 4. Check if there are any thought_likes entries
SELECT 
    thought_id,
    user_id,
    created_at
FROM thought_likes 
LIMIT 10;

-- 5. Test the trigger by manually inserting a like
-- (Replace 'your-thought-id' and 'your-user-id' with actual values)
-- INSERT INTO thought_likes (thought_id, user_id) 
-- VALUES ('your-thought-id', 'your-user-id');

-- 6. Check if the likes_count was updated
-- SELECT id, likes_count FROM thoughts WHERE id = 'your-thought-id';

-- 7. Verify the real-time publication includes the necessary tables
SELECT 
    schemaname,
    tablename,
    pubname
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename IN ('thoughts', 'thought_likes');

-- 8. Check if the tables have REPLICA IDENTITY set
SELECT 
    schemaname,
    relname as tablename,
    relreplident as replica_identity
FROM pg_stat_user_tables 
WHERE relname IN ('thoughts', 'thought_likes'); 