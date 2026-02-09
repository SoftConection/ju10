-- Create course modules table
CREATE TABLE public.course_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create course lessons table
CREATE TABLE public.course_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  video_type TEXT DEFAULT 'youtube', -- 'youtube', 'vimeo', 'upload'
  duration_minutes INTEGER,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lesson progress table
CREATE TABLE public.lesson_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  progress_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for course_modules
CREATE POLICY "Course modules are viewable by everyone"
ON public.course_modules FOR SELECT
USING (true);

CREATE POLICY "Admins can manage course modules"
ON public.course_modules FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for course_lessons
CREATE POLICY "Free lessons are viewable by everyone"
ON public.course_lessons FOR SELECT
USING (is_free = true);

CREATE POLICY "Enrolled users can view all lessons"
ON public.course_lessons FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.course_enrollments ce
    JOIN public.course_modules cm ON cm.course_id = ce.course_id
    WHERE cm.id = course_lessons.module_id
    AND ce.user_id = auth.uid()
    AND ce.payment_status = 'confirmed'
  )
);

CREATE POLICY "Admins can manage course lessons"
ON public.course_lessons FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for lesson_progress
CREATE POLICY "Users can view their own progress"
ON public.lesson_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
ON public.lesson_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON public.lesson_progress FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress"
ON public.lesson_progress FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_course_modules_updated_at
BEFORE UPDATE ON public.course_modules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_lessons_updated_at
BEFORE UPDATE ON public.course_lessons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lesson_progress_updated_at
BEFORE UPDATE ON public.lesson_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();