-- Allow users to update and delete their own salary posts within 24 hours
-- This balances data control with analytics integrity

-- Users can update their own salary posts within 24 hours of creation
CREATE POLICY "Users can update their own recent salary posts"
ON public.salary_posts FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id AND
  created_at > now() - interval '24 hours'
);

-- Users can delete their own salary posts within 24 hours of creation
CREATE POLICY "Users can delete their own recent salary posts"
ON public.salary_posts FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id AND
  created_at > now() - interval '24 hours'
);