-- Fix: Anonymous Messages should not store user_id for true anonymity
-- This protects users from de-anonymization in sensitive salary discussions

-- Step 1: Make user_id nullable for anonymous messages
ALTER TABLE public.messages ALTER COLUMN user_id DROP NOT NULL;

-- Step 2: Drop the existing INSERT policy that requires user_id = auth.uid()
DROP POLICY IF EXISTS "Authenticated users can create messages" ON public.messages;

-- Step 3: Create a new INSERT policy that handles both anonymous and non-anonymous messages
CREATE POLICY "Authenticated users can create messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  CASE 
    WHEN is_anonymous = true THEN user_id IS NULL
    ELSE auth.uid() = user_id
  END
);

-- Step 4: Update the DELETE policy to only allow deleting non-anonymous messages
-- (Anonymous messages cannot be deleted since we don't know who posted them)
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;

CREATE POLICY "Users can delete their own non-anonymous messages"
ON public.messages
FOR DELETE
TO authenticated
USING (user_id IS NOT NULL AND auth.uid() = user_id);

-- Step 5: Update the UPDATE policy similarly
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

CREATE POLICY "Users can update their own non-anonymous messages"
ON public.messages
FOR UPDATE
TO authenticated
USING (user_id IS NOT NULL AND auth.uid() = user_id);