-- Create RPC function to create notifications (bypasses RLS)
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_content TEXT,
  p_link TEXT DEFAULT NULL,
  p_is_read BOOLEAN DEFAULT FALSE
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_notification_id UUID;
BEGIN
  -- Insert the notification
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    content,
    link,
    is_read
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_content,
    p_link,
    p_is_read
  ) RETURNING id INTO new_notification_id;

  -- Return success response
  RETURN json_build_object(
    'success', true,
    'id', new_notification_id
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Return error response
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Create RPC function to mark notification as read (bypasses RLS)
CREATE OR REPLACE FUNCTION public.mark_notification_read(
  p_notification_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the notification
  UPDATE public.notifications 
  SET is_read = true 
  WHERE id = p_notification_id;

  -- Return success response
  RETURN json_build_object(
    'success', true,
    'rows_affected', ROW_COUNT
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Return error response
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Create RPC function to mark all notifications as read (bypasses RLS)
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read(
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  -- Update all unread notifications for the user
  UPDATE public.notifications 
  SET is_read = true 
  WHERE user_id = p_user_id AND is_read = false;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;

  -- Return success response
  RETURN json_build_object(
    'success', true,
    'rows_affected', affected_rows
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Return error response
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Create RPC function to create like notification (bypasses RLS)
CREATE OR REPLACE FUNCTION public.create_like_notification_rpc(
  p_thought_id UUID,
  p_liker_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  thought_owner_id UUID;
  liker_name TEXT;
  new_notification_id UUID;
BEGIN
  -- Get the thought owner's ID
  SELECT user_id INTO thought_owner_id 
  FROM public.thoughts 
  WHERE id = p_thought_id;
  
  -- Don't create notification if user likes their own thought
  IF thought_owner_id = p_liker_id THEN
    RETURN json_build_object('success', true, 'message', 'Own like, no notification needed');
  END IF;
  
  -- Get the liker's name
  SELECT COALESCE(full_name, username, 'Someone') INTO liker_name 
  FROM public.profiles 
  WHERE id = p_liker_id;
  
  -- Insert the notification
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    content,
    link,
    is_read
  ) VALUES (
    thought_owner_id,
    'like',
    'New Like',
    liker_name || ' liked your thought',
    '/thought/' || p_thought_id,
    false
  ) RETURNING id INTO new_notification_id;

  -- Return success response
  RETURN json_build_object(
    'success', true,
    'id', new_notification_id
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Return error response
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Create RPC function to create comment notification (bypasses RLS)
CREATE OR REPLACE FUNCTION public.create_comment_notification_rpc(
  p_thought_id UUID,
  p_commenter_id UUID,
  p_comment_content TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  thought_owner_id UUID;
  commenter_name TEXT;
  new_notification_id UUID;
BEGIN
  -- Get the thought owner's ID
  SELECT user_id INTO thought_owner_id 
  FROM public.thoughts 
  WHERE id = p_thought_id;
  
  -- Don't create notification if user comments on their own thought
  IF thought_owner_id = p_commenter_id THEN
    RETURN json_build_object('success', true, 'message', 'Own comment, no notification needed');
  END IF;
  
  -- Get the commenter's name
  SELECT COALESCE(full_name, username, 'Someone') INTO commenter_name 
  FROM public.profiles 
  WHERE id = p_commenter_id;
  
  -- Insert the notification
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    content,
    link,
    is_read
  ) VALUES (
    thought_owner_id,
    'comment',
    'New Comment',
    commenter_name || ' commented on your thought: "' || LEFT(p_comment_content, 50) || CASE WHEN LENGTH(p_comment_content) > 50 THEN '...' ELSE '' END || '"',
    '/thought/' || p_thought_id,
    false
  ) RETURNING id INTO new_notification_id;

  -- Return success response
  RETURN json_build_object(
    'success', true,
    'id', new_notification_id
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Return error response
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$; 