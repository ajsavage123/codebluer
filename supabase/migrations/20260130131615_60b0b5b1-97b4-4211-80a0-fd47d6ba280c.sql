-- Create topics table for threaded discussions within rooms
CREATE TABLE public.topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  created_by UUID,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  reply_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add topic_id to messages table to link messages to topics
ALTER TABLE public.messages 
ADD COLUMN topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX idx_topics_room_id ON public.topics(room_id);
CREATE INDEX idx_topics_created_at ON public.topics(created_at DESC);
CREATE INDEX idx_topics_room_pinned ON public.topics(room_id, is_pinned DESC, created_at DESC);
CREATE INDEX idx_messages_topic_id ON public.messages(topic_id);

-- Enable RLS on topics
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for topics

-- Anyone can view topics
CREATE POLICY "Topics are viewable by everyone"
ON public.topics
FOR SELECT
USING (true);

-- Authenticated users can create topics (anonymous or with their user_id)
CREATE POLICY "Authenticated users can create topics"
ON public.topics
FOR INSERT
WITH CHECK (
  CASE
    WHEN is_anonymous = true THEN created_by IS NULL
    ELSE auth.uid() = created_by
  END
);

-- Topic creators (non-anonymous) and admins can update their topics
CREATE POLICY "Topic creators and admins can update topics"
ON public.topics
FOR UPDATE
USING (
  (created_by IS NOT NULL AND auth.uid() = created_by) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Only admins can delete topics
CREATE POLICY "Only admins can delete topics"
ON public.topics
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_topics_updated_at
BEFORE UPDATE ON public.topics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update topic reply count when messages are added/removed
CREATE OR REPLACE FUNCTION public.update_topic_reply_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.topic_id IS NOT NULL THEN
      UPDATE public.topics 
      SET reply_count = reply_count + 1, updated_at = now()
      WHERE id = NEW.topic_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.topic_id IS NOT NULL THEN
      UPDATE public.topics 
      SET reply_count = GREATEST(0, reply_count - 1)
      WHERE id = OLD.topic_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger to update reply count
CREATE TRIGGER update_topic_reply_count_trigger
AFTER INSERT OR DELETE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_topic_reply_count();