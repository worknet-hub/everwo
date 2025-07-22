
-- Fix RLS policies for connections table
DROP POLICY IF EXISTS "Users can create connection requests" ON public.connections;
DROP POLICY IF EXISTS "Users can create connections" ON public.connections;

-- Create a single, clear policy for inserting connections
CREATE POLICY "Users can create connection requests" ON public.connections
FOR INSERT 
WITH CHECK (auth.uid() = requester_id);

-- Fix RLS policies for thoughts table  
DROP POLICY IF EXISTS "Users can create thoughts" ON public.thoughts;
DROP POLICY IF EXISTS "Users can insert their own thoughts" ON public.thoughts;

-- Create a single, clear policy for inserting thoughts
CREATE POLICY "Users can create thoughts" ON public.thoughts
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Ensure profiles table has proper policies for the admin user
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles" ON public.profiles
FOR SELECT 
USING (true);

-- Make sure connections can be viewed by users involved
DROP POLICY IF EXISTS "Users can view own connections" ON public.connections;
DROP POLICY IF EXISTS "Users can view their connections" ON public.connections;

CREATE POLICY "Users can view their connections" ON public.connections
FOR SELECT 
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Ensure thoughts visibility works correctly
DROP POLICY IF EXISTS "Users can view all thoughts" ON public.thoughts;
DROP POLICY IF EXISTS "Users can view public thoughts" ON public.thoughts;

CREATE POLICY "Users can view thoughts" ON public.thoughts
FOR SELECT 
USING (
  visibility = 'public' OR 
  user_id = auth.uid() OR 
  (visibility = 'connections' AND user_id IN (
    SELECT CASE 
      WHEN requester_id = auth.uid() THEN addressee_id
      ELSE requester_id
    END
    FROM connections 
    WHERE status = 'accepted' 
    AND (requester_id = auth.uid() OR addressee_id = auth.uid())
  ))
);
