-- Add new fields to profiles table for complete user information
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS id_number TEXT,
ADD COLUMN IF NOT EXISTS academic_info TEXT,
ADD COLUMN IF NOT EXISTS employment_status TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS company TEXT;

-- Create table for external event participants (non-members)
CREATE TABLE public.external_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  age INTEGER NOT NULL,
  id_number TEXT NOT NULL,
  academic_info TEXT,
  employment_status TEXT,
  job_title TEXT,
  company TEXT,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on external_participants
ALTER TABLE public.external_participants ENABLE ROW LEVEL SECURITY;

-- Anyone can register as external participant (insert)
CREATE POLICY "Anyone can register as external participant"
ON public.external_participants
FOR INSERT
WITH CHECK (true);

-- Event creators can view their event's external participants
CREATE POLICY "Event creators can view external participants"
ON public.external_participants
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.events
  WHERE events.id = external_participants.event_id
  AND events.created_by = auth.uid()
));

-- Admins can view all external participants
CREATE POLICY "Admins can view all external participants"
ON public.external_participants
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));