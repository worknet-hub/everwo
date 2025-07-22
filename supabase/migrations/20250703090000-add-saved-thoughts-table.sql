-- Create saved_thoughts table
CREATE TABLE IF NOT EXISTS public.saved_thoughts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  thought_id UUID REFERENCES public.thoughts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, thought_id)
);

-- Enable Row Level Security
ALTER TABLE public.saved_thoughts ENABLE ROW LEVEL SECURITY;

-- Create policies for saved_thoughts
CREATE POLICY "Users can view own saved thoughts" ON public.saved_thoughts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own saved thoughts" ON public.saved_thoughts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved thoughts" ON public.saved_thoughts FOR DELETE USING (auth.uid() = user_id); 