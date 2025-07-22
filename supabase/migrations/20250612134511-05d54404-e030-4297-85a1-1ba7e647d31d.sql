
-- Enable real-time functionality for all tables
-- Set REPLICA IDENTITY FULL to capture complete row data during updates
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.thoughts REPLICA IDENTITY FULL;
ALTER TABLE public.thought_likes REPLICA IDENTITY FULL;
ALTER TABLE public.thought_comments REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.connections REPLICA IDENTITY FULL;
ALTER TABLE public.gigs REPLICA IDENTITY FULL;
ALTER TABLE public.gig_applications REPLICA IDENTITY FULL;
ALTER TABLE public.projects REPLICA IDENTITY FULL;
ALTER TABLE public.project_members REPLICA IDENTITY FULL;
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.task_comments REPLICA IDENTITY FULL;

-- Add tables to supabase_realtime publication to activate real-time functionality
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.thoughts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.thought_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.thought_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.connections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gigs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gig_applications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_comments;
