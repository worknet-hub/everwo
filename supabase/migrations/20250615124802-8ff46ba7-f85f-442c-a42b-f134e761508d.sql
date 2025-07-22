
-- Add interests column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN interests text[] DEFAULT '{}';

-- Add visibility and community_tag columns to thoughts table
ALTER TABLE public.thoughts 
ADD COLUMN visibility text DEFAULT 'public' CHECK (visibility IN ('public', 'connections')),
ADD COLUMN community_tag text;

-- Create index for better performance on community queries
CREATE INDEX idx_thoughts_community_tag ON public.thoughts(community_tag) WHERE community_tag IS NOT NULL;
CREATE INDEX idx_thoughts_visibility ON public.thoughts(visibility);
CREATE INDEX idx_profiles_interests ON public.profiles USING GIN(interests);

-- Create a function to validate community tags
CREATE OR REPLACE FUNCTION validate_community_tag()
RETURNS TRIGGER AS $$
BEGIN
  -- If visibility is not public, community_tag must be null
  IF NEW.visibility != 'public' AND NEW.community_tag IS NOT NULL THEN
    RAISE EXCEPTION 'Community tags are only allowed for public thoughts';
  END IF;
  
  -- If community_tag is provided, it must be in user's interests
  IF NEW.community_tag IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = NEW.user_id 
      AND NEW.community_tag = ANY(interests)
    ) THEN
      RAISE EXCEPTION 'Community tag must be one of user''s selected interests';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate community tags
CREATE TRIGGER validate_community_tag_trigger
  BEFORE INSERT OR UPDATE ON public.thoughts
  FOR EACH ROW
  EXECUTE FUNCTION validate_community_tag();

-- Enable RLS on thoughts table if not already enabled
ALTER TABLE public.thoughts ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for thoughts visibility
CREATE POLICY "Users can view public thoughts" ON public.thoughts
  FOR SELECT USING (
    visibility = 'public' OR 
    (visibility = 'connections' AND user_id IN (
      SELECT CASE 
        WHEN requester_id = auth.uid() THEN addressee_id
        ELSE requester_id
      END
      FROM public.connections 
      WHERE status = 'accepted' 
      AND (requester_id = auth.uid() OR addressee_id = auth.uid())
    )) OR
    user_id = auth.uid()
  );

-- Create RLS policy for inserting thoughts
CREATE POLICY "Users can insert their own thoughts" ON public.thoughts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policy for updating thoughts
CREATE POLICY "Users can update their own thoughts" ON public.thoughts
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policy for deleting thoughts
CREATE POLICY "Users can delete their own thoughts" ON public.thoughts
  FOR DELETE USING (auth.uid() = user_id);
