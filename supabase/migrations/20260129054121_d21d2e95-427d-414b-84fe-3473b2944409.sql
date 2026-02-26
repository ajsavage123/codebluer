-- Create message_likes table for proper like tracking
CREATE TABLE public.message_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.message_likes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view likes"
  ON public.message_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like"
  ON public.message_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
  ON public.message_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create a function to get like count for a message (optional but useful)
CREATE OR REPLACE FUNCTION public.get_message_like_count(p_message_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER FROM public.message_likes WHERE message_id = p_message_id;
$$;

-- Create a function to check if user has liked a message
CREATE OR REPLACE FUNCTION public.has_user_liked_message(p_message_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.message_likes 
    WHERE message_id = p_message_id AND user_id = p_user_id
  );
$$;