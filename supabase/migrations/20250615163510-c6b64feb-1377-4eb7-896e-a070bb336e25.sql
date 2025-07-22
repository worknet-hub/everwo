
-- Create alumni profiles table
CREATE TABLE public.alumni_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  graduation_year INTEGER NOT NULL,
  degree TEXT NOT NULL,
  major TEXT,
  current_company TEXT,
  current_position TEXT,
  industry TEXT,
  location TEXT,
  bio TEXT,
  avatar_url TEXT,
  linkedin_url TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  verification_document_url TEXT,
  verification_submitted_at TIMESTAMP WITH TIME ZONE,
  verification_reviewed_at TIMESTAMP WITH TIME ZONE,
  verification_reviewed_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alumni verification documents table
CREATE TABLE public.alumni_verification_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alumni_id UUID REFERENCES public.alumni_profiles(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('diploma', 'transcript', 'degree_certificate', 'student_id')),
  document_url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Create alumni mentorship table
CREATE TABLE public.alumni_mentorship (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID REFERENCES public.alumni_profiles(id) NOT NULL,
  mentee_id UUID REFERENCES public.alumni_profiles(id) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(mentor_id, mentee_id)
);

-- Create alumni job posts table
CREATE TABLE public.alumni_job_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  posted_by UUID REFERENCES public.alumni_profiles(id) NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  location TEXT,
  salary_range TEXT,
  job_type TEXT CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship')),
  experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')),
  application_deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alumni events table
CREATE TABLE public.alumni_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID REFERENCES public.alumni_profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT CHECK (event_type IN ('reunion', 'networking', 'workshop', 'seminar', 'social')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  is_virtual BOOLEAN DEFAULT false,
  meeting_link TEXT,
  max_attendees INTEGER,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all alumni tables
ALTER TABLE public.alumni_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_mentorship ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_job_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for alumni_profiles
CREATE POLICY "Alumni can view all verified profiles" ON public.alumni_profiles
FOR SELECT USING (verification_status = 'approved');

CREATE POLICY "Alumni can update own profile" ON public.alumni_profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Alumni can insert own profile" ON public.alumni_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for verification documents
CREATE POLICY "Alumni can view own verification documents" ON public.alumni_verification_documents
FOR SELECT USING (alumni_id IN (SELECT id FROM public.alumni_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Alumni can insert own verification documents" ON public.alumni_verification_documents
FOR INSERT WITH CHECK (alumni_id IN (SELECT id FROM public.alumni_profiles WHERE user_id = auth.uid()));

-- RLS policies for mentorship
CREATE POLICY "Alumni can view mentorship they're involved in" ON public.alumni_mentorship
FOR SELECT USING (
  mentor_id IN (SELECT id FROM public.alumni_profiles WHERE user_id = auth.uid()) OR
  mentee_id IN (SELECT id FROM public.alumni_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Alumni can create mentorship requests" ON public.alumni_mentorship
FOR INSERT WITH CHECK (
  mentee_id IN (SELECT id FROM public.alumni_profiles WHERE user_id = auth.uid())
);

-- RLS policies for job posts
CREATE POLICY "Alumni can view all job posts" ON public.alumni_job_posts
FOR SELECT USING (status = 'active');

CREATE POLICY "Alumni can manage own job posts" ON public.alumni_job_posts
FOR ALL USING (posted_by IN (SELECT id FROM public.alumni_profiles WHERE user_id = auth.uid()));

-- RLS policies for events
CREATE POLICY "Alumni can view all events" ON public.alumni_events
FOR SELECT USING (true);

CREATE POLICY "Alumni can manage own events" ON public.alumni_events
FOR ALL USING (organizer_id IN (SELECT id FROM public.alumni_profiles WHERE user_id = auth.uid()));

-- Create storage bucket for alumni verification documents
INSERT INTO storage.buckets (id, name, public) VALUES ('alumni-documents', 'alumni-documents', false);

-- Storage policies for alumni documents
CREATE POLICY "Alumni can upload verification documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'alumni-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Alumni can view own verification documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'alumni-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
