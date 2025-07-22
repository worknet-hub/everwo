-- Ensure likes_count is always non-null and defaults to 0
ALTER TABLE public.thoughts
ALTER COLUMN likes_count SET DEFAULT 0;
UPDATE public.thoughts SET likes_count = 0 WHERE likes_count IS NULL;
UPDATE public.thoughts SET likes_count = 0 WHERE likes_count < 0;
ALTER TABLE public.thoughts
ALTER COLUMN likes_count SET NOT NULL; 