-- Add DELETE policy for messages table
CREATE POLICY "Users can delete their own messages" ON public.messages 
FOR DELETE USING (auth.uid() = sender_id); 

-- Allow both the comment author and the thought owner to delete comments
CREATE POLICY "Comment author or thought owner can delete comment" ON public.thought_comments
FOR DELETE USING (
  auth.uid() = user_id
  OR thought_id IN (SELECT id FROM public.thoughts WHERE user_id = auth.uid())
); 