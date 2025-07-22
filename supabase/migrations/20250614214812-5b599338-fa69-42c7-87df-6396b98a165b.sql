
-- Create jobs table for storing job and service postings
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('job', 'service')), -- job or service
  category TEXT,
  location TEXT,
  location_type TEXT DEFAULT 'remote' CHECK (location_type IN ('remote', 'on-site', 'hybrid')),
  budget_min INTEGER,
  budget_max INTEGER,
  budget_type TEXT DEFAULT 'fixed' CHECK (budget_type IN ('fixed', 'hourly')),
  skills TEXT[] DEFAULT '{}',
  experience_level TEXT DEFAULT 'intermediate' CHECK (experience_level IN ('beginner', 'intermediate', 'expert')),
  deadline TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for jobs table
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Users can view all published jobs/services
CREATE POLICY "Anyone can view published jobs" ON public.jobs
FOR SELECT USING (status = 'open');

-- Users can create their own jobs/services
CREATE POLICY "Users can create their own jobs" ON public.jobs
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own jobs/services
CREATE POLICY "Users can update their own jobs" ON public.jobs
FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own jobs/services
CREATE POLICY "Users can delete their own jobs" ON public.jobs
FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime for jobs table
ALTER TABLE public.jobs REPLICA IDENTITY FULL;
