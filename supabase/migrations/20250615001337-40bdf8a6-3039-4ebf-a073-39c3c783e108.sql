
-- Add reply_to_id column to messages table to support replies
ALTER TABLE public.messages 
ADD COLUMN reply_to_id uuid REFERENCES public.messages(id);

-- Create index for better performance on reply queries
CREATE INDEX idx_messages_reply_to_id ON public.messages(reply_to_id);
