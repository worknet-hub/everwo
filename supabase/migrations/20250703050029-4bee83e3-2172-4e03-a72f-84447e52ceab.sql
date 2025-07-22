
-- Add real-time support for thoughts table
ALTER TABLE public.thoughts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.thoughts;

-- Add real-time support for thought_likes table  
ALTER TABLE public.thought_likes REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.thought_likes;

-- Add real-time support for notifications table
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create function to create notifications for likes
CREATE OR REPLACE FUNCTION public.create_like_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Don't create notification if user likes their own thought
  IF (SELECT user_id FROM thoughts WHERE id = NEW.thought_id) != NEW.user_id THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      content,
      link
    ) VALUES (
      (SELECT user_id FROM thoughts WHERE id = NEW.thought_id),
      'like',
      'New Like',
      (SELECT full_name FROM profiles WHERE id = NEW.user_id) || ' liked your thought',
      '/thought/' || NEW.thought_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for like notifications
CREATE TRIGGER on_thought_liked
  AFTER INSERT ON public.thought_likes
  FOR EACH ROW EXECUTE FUNCTION public.create_like_notification();

-- Create function to create notifications for mentions
CREATE OR REPLACE FUNCTION public.create_mention_notification()
RETURNS TRIGGER AS $$
DECLARE
  mention_record RECORD;
  mentioned_user_id UUID;
BEGIN
  -- Process mentions in the new thought
  FOR mention_record IN 
    SELECT jsonb_array_elements(NEW.mentions) as mention
  LOOP
    IF (mention_record.mention->>'type')::text = 'person' THEN
      -- Find user by name from mention
      SELECT id INTO mentioned_user_id 
      FROM profiles 
      WHERE full_name = (mention_record.mention->>'name')::text
      LIMIT 1;
      
      IF mentioned_user_id IS NOT NULL AND mentioned_user_id != NEW.user_id THEN
        INSERT INTO public.notifications (
          user_id,
          type,
          title,
          content,
          link
        ) VALUES (
          mentioned_user_id,
          'mention',
          'You were mentioned',
          (SELECT full_name FROM profiles WHERE id = NEW.user_id) || ' mentioned you in a thought',
          '/thought/' || NEW.id
        );
      END IF;
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for mention notifications
CREATE TRIGGER on_thought_mention
  AFTER INSERT ON public.thoughts
  FOR EACH ROW EXECUTE FUNCTION public.create_mention_notification();

-- Create function to create notifications for community interests
CREATE OR REPLACE FUNCTION public.create_community_interest_notification()
RETURNS TRIGGER AS $$
DECLARE
  interest_user RECORD;
BEGIN
  -- If thought has a community, notify users with matching interests
  IF NEW.community_id IS NOT NULL THEN
    FOR interest_user IN 
      SELECT DISTINCT p.id as user_id, p.full_name
      FROM profiles p
      WHERE (SELECT name FROM communities WHERE id = NEW.community_id) = ANY(p.interests)
      AND p.id != NEW.user_id
    LOOP
      INSERT INTO public.notifications (
        user_id,
        type,
        title,
        content,
        link
      ) VALUES (
        interest_user.user_id,
        'community',
        'New post in your interest',
        (SELECT full_name FROM profiles WHERE id = NEW.user_id) || ' posted in ' || (SELECT name FROM communities WHERE id = NEW.community_id),
        '/thought/' || NEW.id
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for community interest notifications
CREATE TRIGGER on_community_post
  AFTER INSERT ON public.thoughts
  FOR EACH ROW EXECUTE FUNCTION public.create_community_interest_notification();

-- Allow system to insert notifications
CREATE POLICY "System can insert notifications" ON public.notifications
FOR INSERT WITH CHECK (true);
