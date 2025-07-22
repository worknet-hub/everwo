-- Add viewed_at column to connections table
ALTER TABLE public.connections 
ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMP WITH TIME ZONE;

-- Add index for better performance when querying unviewed requests
CREATE INDEX IF NOT EXISTS idx_connections_addressee_status_viewed 
ON public.connections(addressee_id, status, viewed_at) 
WHERE status = 'pending'; 