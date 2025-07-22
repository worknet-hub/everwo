-- Add university visibility to thoughts table
-- First, update any existing rows that might have invalid visibility values
UPDATE public.thoughts 
SET visibility = 'public' 
WHERE visibility NOT IN ('public', 'connections', 'university');

-- Drop the existing check constraint
ALTER TABLE public.thoughts DROP CONSTRAINT IF EXISTS thoughts_visibility_check;

-- Add the new check constraint that includes university
ALTER TABLE public.thoughts 
ADD CONSTRAINT thoughts_visibility_check 
CHECK (visibility IN ('public', 'connections', 'university'));

-- Update the RLS policy to handle university visibility
DROP POLICY IF EXISTS "Users can view public thoughts" ON public.thoughts;

-- Create updated RLS policy for thoughts visibility
CREATE POLICY "Users can view public thoughts" ON public.thoughts
  FOR SELECT USING (
    visibility = 'public' OR 
    visibility = 'university' OR
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