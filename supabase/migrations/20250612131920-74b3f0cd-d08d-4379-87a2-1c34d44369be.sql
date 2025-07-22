i
-- Create profiles table with all required fields
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  college_name TEXT,
  college_verified BOOLEAN DEFAULT FALSE,
  skills TEXT[] DEFAULT '{}',
  portfolio TEXT[] DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0.0 AND rating <= 5.0),
  badges TEXT[] DEFAULT '{}',
  availability_status TEXT DEFAULT 'available',
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create thoughts table
CREATE TABLE IF NOT EXISTS public.thoughts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create thought_likes table
CREATE TABLE IF NOT EXISTS public.thought_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thought_id UUID REFERENCES public.thoughts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(thought_id, user_id)
);

-- Create thought_comments table
CREATE TABLE IF NOT EXISTS public.thought_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thought_id UUID REFERENCES public.thoughts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gigs/jobs table
CREATE TABLE IF NOT EXISTS public.gigs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price_amount INTEGER NOT NULL,
  price_type TEXT DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'hourly')),
  duration TEXT,
  location_type TEXT DEFAULT 'remote' CHECK (location_type IN ('remote', 'hybrid', 'on-site')),
  skills TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  applicants_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gig_applications table
CREATE TABLE IF NOT EXISTS public.gig_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID REFERENCES public.gigs(id) ON DELETE CASCADE NOT NULL,
  applicant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  cover_letter TEXT,
  proposed_rate INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(gig_id, applicant_id)
);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_members table
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create task_comments table
CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create connections table for networking
CREATE TABLE IF NOT EXISTS public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  addressee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thoughts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thought_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thought_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gig_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for thoughts
CREATE POLICY "Users can view all thoughts" ON public.thoughts FOR SELECT USING (true);
CREATE POLICY "Users can create thoughts" ON public.thoughts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own thoughts" ON public.thoughts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own thoughts" ON public.thoughts FOR DELETE USING (auth.uid() = user_id);

-- Create policies for thought_likes
CREATE POLICY "Users can view all likes" ON public.thought_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage own likes" ON public.thought_likes FOR ALL USING (auth.uid() = user_id);

-- Create policies for thought_comments
CREATE POLICY "Users can view all comments" ON public.thought_comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON public.thought_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON public.thought_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.thought_comments FOR DELETE USING (auth.uid() = user_id);

-- Create policies for gigs
CREATE POLICY "Users can view all gigs" ON public.gigs FOR SELECT USING (true);
CREATE POLICY "Users can create gigs" ON public.gigs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own gigs" ON public.gigs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own gigs" ON public.gigs FOR DELETE USING (auth.uid() = user_id);

-- Create policies for gig_applications
CREATE POLICY "Users can view applications for their gigs or own applications" ON public.gig_applications FOR SELECT USING (
  auth.uid() = applicant_id OR 
  auth.uid() IN (SELECT user_id FROM public.gigs WHERE id = gig_id)
);
CREATE POLICY "Users can create applications" ON public.gig_applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "Users can update own applications" ON public.gig_applications FOR UPDATE USING (auth.uid() = applicant_id);

-- Create policies for projects
CREATE POLICY "Users can view projects they're members of" ON public.projects FOR SELECT USING (
  id IN (SELECT project_id FROM public.project_members WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = owner_id);

-- Create policies for project_members
CREATE POLICY "Users can view members of their projects" ON public.project_members FOR SELECT USING (
  project_id IN (SELECT project_id FROM public.project_members WHERE user_id = auth.uid())
);
CREATE POLICY "Project owners can manage members" ON public.project_members FOR ALL USING (
  project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid())
);

-- Create policies for tasks
CREATE POLICY "Users can view tasks in their projects" ON public.tasks FOR SELECT USING (
  project_id IN (SELECT project_id FROM public.project_members WHERE user_id = auth.uid())
);
CREATE POLICY "Project members can create tasks" ON public.tasks FOR INSERT WITH CHECK (
  project_id IN (SELECT project_id FROM public.project_members WHERE user_id = auth.uid())
);
CREATE POLICY "Project members can update tasks" ON public.tasks FOR UPDATE USING (
  project_id IN (SELECT project_id FROM public.project_members WHERE user_id = auth.uid())
);

-- Create policies for task_comments
CREATE POLICY "Users can view comments on tasks in their projects" ON public.task_comments FOR SELECT USING (
  task_id IN (
    SELECT t.id FROM public.tasks t 
    JOIN public.project_members pm ON t.project_id = pm.project_id 
    WHERE pm.user_id = auth.uid()
  )
);
CREATE POLICY "Users can create comments on tasks in their projects" ON public.task_comments FOR INSERT WITH CHECK (
  auth.uid() = user_id AND 
  task_id IN (
    SELECT t.id FROM public.tasks t 
    JOIN public.project_members pm ON t.project_id = pm.project_id 
    WHERE pm.user_id = auth.uid()
  )
);

-- Create policies for connections
CREATE POLICY "Users can view own connections" ON public.connections FOR SELECT USING (
  auth.uid() = requester_id OR auth.uid() = addressee_id
);
CREATE POLICY "Users can create connections" ON public.connections FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update connections they're part of" ON public.connections FOR UPDATE USING (
  auth.uid() = requester_id OR auth.uid() = addressee_id
);

-- Create policies for messages
CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update their received messages" ON public.messages FOR UPDATE USING (auth.uid() = receiver_id);

-- Create policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
