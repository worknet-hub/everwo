
-- First, let's check what policies exist and drop/recreate them if needed
DROP POLICY IF EXISTS "Anyone can view open jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can create their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can update their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can delete their own jobs" ON public.jobs;

-- Now create all the policies fresh
CREATE POLICY "Anyone can view open jobs" ON public.jobs
FOR SELECT USING (status = 'open');

CREATE POLICY "Users can create their own jobs" ON public.jobs
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs" ON public.jobs
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jobs" ON public.jobs
FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime for jobs table
ALTER TABLE public.jobs REPLICA IDENTITY FULL;
