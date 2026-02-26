-- Add vote column to messages table for upvote/downvote tracking
-- We'll use a separate table for tracking individual votes

-- Create message_votes table for upvote/downvote tracking
CREATE TABLE public.message_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Enable RLS
ALTER TABLE public.message_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view votes"
ON public.message_votes
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can vote"
ON public.message_votes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes"
ON public.message_votes
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can remove their own votes"
ON public.message_votes
FOR DELETE
USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_message_votes_message_id ON public.message_votes(message_id);
CREATE INDEX idx_message_votes_user_id ON public.message_votes(user_id);

-- Enable realtime for votes
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_votes;