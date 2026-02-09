-- Create mentorships table
CREATE TABLE public.mentorships (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    mentor_id UUID NOT NULL,
    price_aoa NUMERIC NOT NULL DEFAULT 0,
    duration_weeks INTEGER DEFAULT 4,
    max_students INTEGER DEFAULT 10,
    category TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mentorship_enrollments table
CREATE TABLE public.mentorship_enrollments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    mentorship_id UUID NOT NULL REFERENCES public.mentorships(id) ON DELETE CASCADE,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    payment_method TEXT DEFAULT 'multicaixa_express',
    payment_reference TEXT,
    payment_amount NUMERIC,
    paid_at TIMESTAMP WITH TIME ZONE,
    enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, mentorship_id)
);

-- Create mentorship_lessons table
CREATE TABLE public.mentorship_lessons (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    mentorship_id UUID NOT NULL REFERENCES public.mentorships(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    content TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    duration_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mentorship_materials table
CREATE TABLE public.mentorship_materials (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    mentorship_id UUID NOT NULL REFERENCES public.mentorships(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.mentorship_lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    file_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mentorship_comments table (for lesson comments)
CREATE TABLE public.mentorship_comments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES public.mentorship_lessons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.mentorship_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mentorship_chat_messages table (for real-time chat)
CREATE TABLE public.mentorship_chat_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    mentorship_id UUID NOT NULL REFERENCES public.mentorships(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.mentorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mentorships
CREATE POLICY "Mentorships are viewable by everyone" 
ON public.mentorships FOR SELECT USING (true);

CREATE POLICY "Admins can manage mentorships" 
ON public.mentorships FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Mentors can manage their own mentorships" 
ON public.mentorships FOR ALL USING (auth.uid() = mentor_id);

-- RLS Policies for mentorship_enrollments
CREATE POLICY "Users can view their own mentorship enrollments" 
ON public.mentorship_enrollments FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mentorship enrollments" 
ON public.mentorship_enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all mentorship enrollments" 
ON public.mentorship_enrollments FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Mentors can view enrollments for their mentorships" 
ON public.mentorship_enrollments FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.mentorships WHERE id = mentorship_id AND mentor_id = auth.uid()));

-- RLS Policies for mentorship_lessons
CREATE POLICY "Enrolled users can view lessons" 
ON public.mentorship_lessons FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.mentorship_enrollments 
    WHERE mentorship_id = mentorship_lessons.mentorship_id 
    AND user_id = auth.uid() 
    AND payment_status = 'confirmed'
));

CREATE POLICY "Mentors can manage lessons for their mentorships" 
ON public.mentorship_lessons FOR ALL 
USING (EXISTS (SELECT 1 FROM public.mentorships WHERE id = mentorship_id AND mentor_id = auth.uid()));

CREATE POLICY "Admins can manage all lessons" 
ON public.mentorship_lessons FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for mentorship_materials
CREATE POLICY "Enrolled users can view materials" 
ON public.mentorship_materials FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.mentorship_enrollments 
    WHERE mentorship_id = mentorship_materials.mentorship_id 
    AND user_id = auth.uid() 
    AND payment_status = 'confirmed'
));

CREATE POLICY "Mentors can manage materials for their mentorships" 
ON public.mentorship_materials FOR ALL 
USING (EXISTS (SELECT 1 FROM public.mentorships WHERE id = mentorship_id AND mentor_id = auth.uid()));

CREATE POLICY "Admins can manage all materials" 
ON public.mentorship_materials FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for mentorship_comments
CREATE POLICY "Enrolled users can view comments" 
ON public.mentorship_comments FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.mentorship_lessons ml
    JOIN public.mentorship_enrollments me ON me.mentorship_id = ml.mentorship_id
    WHERE ml.id = lesson_id AND me.user_id = auth.uid() AND me.payment_status = 'confirmed'
));

CREATE POLICY "Enrolled users can create comments" 
ON public.mentorship_comments FOR INSERT 
WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
        SELECT 1 FROM public.mentorship_lessons ml
        JOIN public.mentorship_enrollments me ON me.mentorship_id = ml.mentorship_id
        WHERE ml.id = lesson_id AND me.user_id = auth.uid() AND me.payment_status = 'confirmed'
    )
);

CREATE POLICY "Users can update their own comments" 
ON public.mentorship_comments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Moderators and admins can manage comments" 
ON public.mentorship_comments FOR ALL 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

-- RLS Policies for mentorship_chat_messages
CREATE POLICY "Enrolled users can view chat messages" 
ON public.mentorship_chat_messages FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.mentorship_enrollments 
    WHERE mentorship_id = mentorship_chat_messages.mentorship_id 
    AND user_id = auth.uid() 
    AND payment_status = 'confirmed'
));

CREATE POLICY "Enrolled users can send chat messages" 
ON public.mentorship_chat_messages FOR INSERT 
WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
        SELECT 1 FROM public.mentorship_enrollments 
        WHERE mentorship_id = mentorship_chat_messages.mentorship_id 
        AND user_id = auth.uid() 
        AND payment_status = 'confirmed'
    )
);

CREATE POLICY "Mentors can view and send chat messages for their mentorships" 
ON public.mentorship_chat_messages FOR ALL 
USING (EXISTS (SELECT 1 FROM public.mentorships WHERE id = mentorship_id AND mentor_id = auth.uid()));

CREATE POLICY "Admins can manage all chat messages" 
ON public.mentorship_chat_messages FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Enable realtime for chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.mentorship_chat_messages;

-- Create trigger for updated_at
CREATE TRIGGER update_mentorships_updated_at
BEFORE UPDATE ON public.mentorships
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentorship_lessons_updated_at
BEFORE UPDATE ON public.mentorship_lessons
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentorship_comments_updated_at
BEFORE UPDATE ON public.mentorship_comments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();