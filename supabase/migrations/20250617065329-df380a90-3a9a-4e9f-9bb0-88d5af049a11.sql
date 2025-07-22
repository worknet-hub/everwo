
-- Create communities table
CREATE TABLE IF NOT EXISTS public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community_members table
CREATE TABLE IF NOT EXISTS public.community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- Add community_id to thoughts table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='thoughts' AND column_name='community_id') THEN
    ALTER TABLE public.thoughts ADD COLUMN community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add mentions column to thoughts table for @mentions
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='thoughts' AND column_name='mentions') THEN
    ALTER TABLE public.thoughts ADD COLUMN mentions JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add parent_id for replies to thoughts table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='thoughts' AND column_name='parent_id') THEN
    ALTER TABLE public.thoughts ADD COLUMN parent_id UUID REFERENCES public.thoughts(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for communities
CREATE POLICY "Anyone can view communities" ON public.communities FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create communities" ON public.communities FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Community creators can update their communities" ON public.communities FOR UPDATE USING (auth.uid() = created_by);

-- RLS policies for community_members
CREATE POLICY "Anyone can view community memberships" ON public.community_members FOR SELECT USING (true);
CREATE POLICY "Users can join communities" ON public.community_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave communities" ON public.community_members FOR DELETE USING (auth.uid() = user_id);

-- Function to auto-join user to community when they post with community tag
CREATE OR REPLACE FUNCTION auto_join_community()
RETURNS TRIGGER AS $$
BEGIN
  -- If thought has a community_id, auto-join the user to that community
  IF NEW.community_id IS NOT NULL THEN
    INSERT INTO public.community_members (community_id, user_id)
    VALUES (NEW.community_id, NEW.user_id)
    ON CONFLICT (community_id, user_id) DO NOTHING;
    
    -- Update member count
    UPDATE public.communities 
    SET member_count = (
      SELECT COUNT(*) FROM public.community_members 
      WHERE community_id = NEW.community_id
    )
    WHERE id = NEW.community_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto-joining communities
DROP TRIGGER IF EXISTS auto_join_community_trigger ON public.thoughts;
CREATE TRIGGER auto_join_community_trigger
  AFTER INSERT ON public.thoughts
  FOR EACH ROW
  EXECUTE FUNCTION auto_join_community();

-- Function to create community if it doesn't exist
CREATE OR REPLACE FUNCTION create_community_if_not_exists(community_name TEXT, creator_id UUID)
RETURNS UUID AS $$
DECLARE
  community_id UUID;
BEGIN
  -- Check if community exists
  SELECT id INTO community_id FROM public.communities WHERE name = community_name;
  
  -- If not exists, create it
  IF community_id IS NULL THEN
    INSERT INTO public.communities (name, created_by, member_count)
    VALUES (community_name, creator_id, 0)
    RETURNING id INTO community_id;
  END IF;
  
  RETURN community_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for new tables
ALTER TABLE public.communities REPLICA IDENTITY FULL;
ALTER TABLE public.community_members REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.communities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_members;
