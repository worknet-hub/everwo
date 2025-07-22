-- Trigger function to update comments_count on thoughts
CREATE OR REPLACE FUNCTION public.update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.thoughts
    SET comments_count = comments_count + 1
    WHERE id = NEW.parent_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.thoughts
    SET comments_count = GREATEST(comments_count - 1, 0)
    WHERE id = OLD.parent_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for replies (comments) on thoughts
DROP TRIGGER IF EXISTS trigger_update_comments_count_insert ON public.thoughts;
CREATE TRIGGER trigger_update_comments_count_insert
AFTER INSERT ON public.thoughts
FOR EACH ROW
WHEN (NEW.parent_id IS NOT NULL)
EXECUTE FUNCTION public.update_comments_count();

DROP TRIGGER IF EXISTS trigger_update_comments_count_delete ON public.thoughts;
CREATE TRIGGER trigger_update_comments_count_delete
AFTER DELETE ON public.thoughts
FOR EACH ROW
WHEN (OLD.parent_id IS NOT NULL)
EXECUTE FUNCTION public.update_comments_count(); 