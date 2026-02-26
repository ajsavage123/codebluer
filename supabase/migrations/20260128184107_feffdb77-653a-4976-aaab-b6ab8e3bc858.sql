-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('user', 'verified', 'paid', 'admin');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create room_type enum
CREATE TYPE public.room_type AS ENUM ('general', 'salary', 'career', 'leadership', 'entrepreneurship', 'certifications', 'students', 'library');

-- Create rooms table
CREATE TABLE public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    type room_type NOT NULL DEFAULT 'general',
    icon TEXT NOT NULL DEFAULT 'MessageCircle',
    is_system BOOLEAN NOT NULL DEFAULT false,
    is_anonymous BOOLEAN NOT NULL DEFAULT false,
    member_count INTEGER NOT NULL DEFAULT 0,
    message_count INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on rooms
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Create messages table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN NOT NULL DEFAULT false,
    likes INTEGER NOT NULL DEFAULT 0,
    replies INTEGER NOT NULL DEFAULT 0,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    reply_to UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create salary_posts table (anonymous)
CREATE TABLE public.salary_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('emt', 'paramedic')),
    location TEXT NOT NULL,
    experience_years INTEGER NOT NULL CHECK (experience_years >= 0),
    working_hours INTEGER NOT NULL CHECK (working_hours IN (8, 12)),
    sector TEXT NOT NULL CHECK (sector IN ('private', 'government', 'ngo')),
    salary INTEGER NOT NULL CHECK (salary > 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on salary_posts
ALTER TABLE public.salary_posts ENABLE ROW LEVEL SECURITY;

-- Create tools table
CREATE TABLE public.tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('internal', 'external')),
    url TEXT,
    icon TEXT NOT NULL DEFAULT 'Wrench',
    category TEXT NOT NULL CHECK (category IN ('salary', 'drugs', 'protocols', 'ecg', 'study', 'guidelines')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on tools
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for rooms
CREATE POLICY "Rooms are viewable by everyone"
ON public.rooms FOR SELECT
USING (true);

CREATE POLICY "Verified/Paid users can create rooms"
ON public.rooms FOR INSERT
TO authenticated
WITH CHECK (
    public.has_role(auth.uid(), 'verified') OR 
    public.has_role(auth.uid(), 'paid') OR 
    public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Room creators and admins can update rooms"
ON public.rooms FOR UPDATE
TO authenticated
USING (
    created_by = auth.uid() OR 
    public.has_role(auth.uid(), 'admin')
);

-- RLS Policies for messages
CREATE POLICY "Messages are viewable by everyone"
ON public.messages FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages"
ON public.messages FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
ON public.messages FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for salary_posts (anonymous - users can only see aggregated data)
CREATE POLICY "Salary posts are viewable by authenticated users"
ON public.salary_posts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create salary posts"
ON public.salary_posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for tools
CREATE POLICY "Tools are viewable by everyone"
ON public.tools FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage tools"
ON public.tools FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
BEFORE UPDATE ON public.rooms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'name');
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Insert default system rooms
INSERT INTO public.rooms (name, description, type, icon, is_system, is_anonymous) VALUES
('General Discussion', 'Open discussions for all EMTs and Paramedics', 'general', 'MessageCircle', true, false),
('Salary / Pay Transparency', 'Anonymous salary discussions and comparisons', 'salary', 'DollarSign', true, true),
('Career Counselor', 'Career guidance and job discussions', 'career', 'Briefcase', true, false),
('Leadership & Rights', 'EMT/Paramedic rights and policy discussions', 'leadership', 'Shield', true, false),
('Entrepreneurship', 'EMT/Paramedic-led ideas and startups', 'entrepreneurship', 'Lightbulb', true, false),
('Certifications & Upskilling', 'BLS, ACLS, ATLS, PHTLS, and exam prep', 'certifications', 'Award', true, false),
('Students & Interns', 'Student and internship guidance', 'students', 'GraduationCap', true, false),
('Library', 'Books, study materials, and resources', 'library', 'BookOpen', true, false);

-- Insert default tools
INSERT INTO public.tools (name, description, type, icon, category) VALUES
('Salary Insights', 'Compare salaries across roles, experience, and sectors', 'internal', 'BarChart3', 'salary');

INSERT INTO public.tools (name, description, type, url, icon, category) VALUES
('Medscape Drug Reference', 'Comprehensive drug information and dosing', 'external', 'https://reference.medscape.com/drugs', 'Pill', 'drugs'),
('EMT Protocol Guide', 'Standard emergency protocols and procedures', 'external', 'https://www.emsprotocols.net', 'FileText', 'protocols'),
('ECG Pocket Brain', 'Quick ECG interpretation guide', 'external', 'https://www.ecgpocketbrain.com', 'Activity', 'ecg'),
('NREMT Practice Tests', 'Free practice tests for certification', 'external', 'https://www.nremt.org', 'ClipboardCheck', 'study'),
('NAEMSP Guidelines', 'National EMS guidelines and standards', 'external', 'https://naemsp.org/resources', 'BookOpen', 'guidelines');