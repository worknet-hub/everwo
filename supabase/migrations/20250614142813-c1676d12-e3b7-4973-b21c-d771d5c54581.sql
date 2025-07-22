
DROP TYPE IF EXISTS public.conversation_details CASCADE;
CREATE TYPE public.conversation_details AS (
  partner_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  last_message_content TEXT,
  last_message_created_at TIMESTAMPTZ,
  is_last_message_read BOOLEAN
);

DROP FUNCTION IF EXISTS public.get_conversations(p_user_id UUID);
CREATE OR REPLACE FUNCTION public.get_conversations(p_user_id UUID)
RETURNS SETOF public.conversation_details AS $$
BEGIN
  RETURN QUERY
  WITH latest_messages AS (
    SELECT
      m.content,
      m.created_at,
      m.is_read,
      m.sender_id,
      m.receiver_id,
      ROW_NUMBER() OVER(
        PARTITION BY
          CASE
            WHEN m.sender_id = p_user_id THEN m.receiver_id
            ELSE m.sender_id
          END
        ORDER BY m.created_at DESC
      ) as rn
    FROM messages m
    WHERE m.sender_id = p_user_id OR m.receiver_id = p_user_id
  )
  SELECT
    p.id as partner_id,
    p.full_name,
    p.avatar_url,
    lm.content as last_message_content,
    lm.created_at as last_message_created_at,
    (lm.receiver_id != p_user_id OR lm.is_read) as is_last_message_read
  FROM latest_messages lm
  JOIN profiles p ON p.id = (
    CASE
      WHEN lm.sender_id = p_user_id THEN lm.receiver_id
      ELSE lm.sender_id
    END
  )
  WHERE lm.rn = 1
  ORDER BY lm.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;
