
-- Add RLS policies for connections table
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Users can view connections where they are either requester or addressee
CREATE POLICY "Users can view their connections" ON public.connections
FOR SELECT USING (
  auth.uid() = requester_id OR auth.uid() = addressee_id
);

-- Users can create connection requests
CREATE POLICY "Users can create connection requests" ON public.connections
FOR INSERT WITH CHECK (
  auth.uid() = requester_id
);

-- Users can update connections where they are the addressee (accepting/rejecting)
CREATE POLICY "Users can update received connection requests" ON public.connections
FOR UPDATE USING (
  auth.uid() = addressee_id
);

-- Enable RLS on messages table (if not already enabled)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them with correct logic
DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to connected users" ON public.messages;
DROP POLICY IF EXISTS "Users can update their sent messages" ON public.messages;

-- Users can view messages they sent or received
CREATE POLICY "Users can view their messages" ON public.messages
FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);

-- Users can send messages only to connected users
CREATE POLICY "Users can send messages to connected users" ON public.messages
FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.connections 
    WHERE status = 'accepted' 
    AND ((requester_id = auth.uid() AND addressee_id = receiver_id) 
         OR (addressee_id = auth.uid() AND requester_id = receiver_id))
  )
);

-- Users can update messages they sent (for read status, etc.)
CREATE POLICY "Users can update their sent messages" ON public.messages
FOR UPDATE USING (auth.uid() = sender_id);

-- Create function to check if users are connected
CREATE OR REPLACE FUNCTION public.are_users_connected(user1_id uuid, user2_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.connections
    WHERE status = 'accepted'
    AND ((requester_id = user1_id AND addressee_id = user2_id)
         OR (requester_id = user2_id AND addressee_id = user1_id))
  );
$$;

-- Create function to get connection status between users
CREATE OR REPLACE FUNCTION public.get_connection_status(user1_id uuid, user2_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT status FROM public.connections
     WHERE (requester_id = user1_id AND addressee_id = user2_id)
        OR (requester_id = user2_id AND addressee_id = user1_id)
     LIMIT 1),
    'none'
  );
$$;

-- Create function to get user connections with profile data
CREATE OR REPLACE FUNCTION public.get_user_connections(p_user_id uuid)
RETURNS TABLE (
  connection_id uuid,
  partner_id uuid,
  partner_name text,
  partner_avatar text,
  status text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    c.id as connection_id,
    CASE 
      WHEN c.requester_id = p_user_id THEN c.addressee_id
      ELSE c.requester_id
    END as partner_id,
    p.full_name as partner_name,
    p.avatar_url as partner_avatar,
    c.status,
    c.created_at
  FROM public.connections c
  JOIN public.profiles p ON p.id = CASE 
    WHEN c.requester_id = p_user_id THEN c.addressee_id
    ELSE c.requester_id
  END
  WHERE (c.requester_id = p_user_id OR c.addressee_id = p_user_id);
$$;
