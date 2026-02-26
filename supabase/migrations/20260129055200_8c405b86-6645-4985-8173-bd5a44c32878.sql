-- Add input validation constraints for data quality and spam prevention

-- Message content: max 5000 chars, must have non-whitespace content
ALTER TABLE public.messages 
  ADD CONSTRAINT check_content_length 
  CHECK (char_length(content) <= 5000 AND char_length(trim(content)) > 0);

-- Profile name: max 100 chars, must have non-whitespace content if set
ALTER TABLE public.profiles 
  ADD CONSTRAINT check_name_length 
  CHECK (name IS NULL OR (
    char_length(name) <= 100 AND 
    char_length(trim(name)) > 0
  ));

-- Salary post location: max 200 chars, must have non-whitespace content
ALTER TABLE public.salary_posts
  ADD CONSTRAINT check_location_length
  CHECK (char_length(location) <= 200 AND char_length(trim(location)) > 0);

-- Salary post role: max 100 chars, must have non-whitespace content  
ALTER TABLE public.salary_posts
  ADD CONSTRAINT check_role_length
  CHECK (char_length(role) <= 100 AND char_length(trim(role)) > 0);