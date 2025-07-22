-- Trigger function to update likes_count on thoughts
CREATE OR REPLACE FUNCTION public.update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.thoughts
    SET likes_count = likes_count + 1
    WHERE id = NEW.thought_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.thoughts
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.thought_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for likes on thoughts
DROP TRIGGER IF EXISTS trigger_update_likes_count_insert ON public.thought_likes;
CREATE TRIGGER trigger_update_likes_count_insert
AFTER INSERT ON public.thought_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_likes_count();

DROP TRIGGER IF EXISTS trigger_update_likes_count_delete ON public.thought_likes;
CREATE TRIGGER trigger_update_likes_count_delete
AFTER DELETE ON public.thought_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_likes_count(); 