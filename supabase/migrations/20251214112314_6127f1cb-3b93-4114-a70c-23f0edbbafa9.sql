-- Add new columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS province TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT;

-- Create class_groups table for turmas
CREATE TABLE public.class_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  schedule TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'Online',
  price_aoa DECIMAL(12, 2) NOT NULL,
  spots INTEGER NOT NULL DEFAULT 30,
  start_date DATE,
  end_date DATE,
  instructor TEXT,
  topics TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create class_enrollments table
CREATE TABLE public.class_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_group_id UUID NOT NULL REFERENCES public.class_groups(id) ON DELETE CASCADE,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_reference TEXT,
  payment_amount DECIMAL(12, 2),
  payment_method TEXT DEFAULT 'multicaixa_express',
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, class_group_id)
);

-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration_hours INTEGER,
  price_aoa DECIMAL(12, 2) NOT NULL,
  level TEXT DEFAULT 'Iniciante',
  category TEXT,
  image_url TEXT,
  modules INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create course_enrollments table
CREATE TABLE public.course_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_reference TEXT,
  payment_amount DECIMAL(12, 2),
  payment_method TEXT DEFAULT 'multicaixa_express',
  progress_percent INTEGER DEFAULT 0,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, course_id)
);

-- Create certificates table
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  class_group_id UUID REFERENCES public.class_groups(id) ON DELETE SET NULL,
  certificate_code TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  download_url TEXT
);

-- Enable RLS on all new tables
ALTER TABLE public.class_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for class_groups (public read)
CREATE POLICY "Class groups are viewable by everyone" 
ON public.class_groups 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage class groups" 
ON public.class_groups 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for class_enrollments
CREATE POLICY "Users can view their own class enrollments" 
ON public.class_enrollments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own class enrollments" 
ON public.class_enrollments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all class enrollments" 
ON public.class_enrollments 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage class enrollments" 
ON public.class_enrollments 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for courses (public read)
CREATE POLICY "Courses are viewable by everyone" 
ON public.courses 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage courses" 
ON public.courses 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for course_enrollments
CREATE POLICY "Users can view their own course enrollments" 
ON public.course_enrollments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own course enrollments" 
ON public.course_enrollments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all course enrollments" 
ON public.course_enrollments 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage course enrollments" 
ON public.course_enrollments 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for certificates
CREATE POLICY "Users can view their own certificates" 
ON public.certificates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage certificates" 
ON public.certificates 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at on new tables
CREATE TRIGGER update_class_groups_updated_at
BEFORE UPDATE ON public.class_groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();