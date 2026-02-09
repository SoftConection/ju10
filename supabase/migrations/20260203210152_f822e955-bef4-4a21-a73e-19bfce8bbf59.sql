-- =============================================
-- PLATAFORMA INTERNACIONAL DE TOPO
-- Webinars, Afiliados, Parceiros, Certificados
-- =============================================

-- Tabela de Instituições Parceiras
CREATE TABLE public.partner_institutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  website TEXT,
  description TEXT,
  country TEXT DEFAULT 'Angola',
  is_active BOOLEAN DEFAULT true,
  commission_rate NUMERIC DEFAULT 10,
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Afiliados
CREATE TABLE public.affiliates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  institution_id UUID REFERENCES public.partner_institutions(id) ON DELETE SET NULL,
  affiliate_code TEXT UNIQUE NOT NULL,
  commission_rate NUMERIC DEFAULT 10,
  total_referrals INTEGER DEFAULT 0,
  total_earnings NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  payout_method TEXT DEFAULT 'multicaixa',
  payout_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Referências de Afiliados
CREATE TABLE public.affiliate_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL,
  enrollment_type TEXT NOT NULL, -- 'course', 'mentorship', 'class', 'webinar'
  enrollment_id UUID NOT NULL,
  commission_amount NUMERIC NOT NULL DEFAULT 0,
  commission_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'paid'
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Webinars Agendados
CREATE TABLE public.webinars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  host_id UUID NOT NULL,
  thumbnail_url TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  max_participants INTEGER DEFAULT 500,
  stream_url TEXT,
  stream_platform TEXT DEFAULT 'youtube', -- 'youtube', 'vimeo', 'zoom'
  stream_key TEXT,
  replay_url TEXT,
  is_live BOOLEAN DEFAULT false,
  is_recorded BOOLEAN DEFAULT false,
  is_free BOOLEAN DEFAULT true,
  price_aoa NUMERIC DEFAULT 0,
  category TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'live', 'ended', 'cancelled'
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Registros em Webinars
CREATE TABLE public.webinar_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webinar_id UUID NOT NULL REFERENCES public.webinars(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  attended BOOLEAN DEFAULT false,
  attended_minutes INTEGER DEFAULT 0,
  payment_status TEXT DEFAULT 'free', -- 'free', 'pending', 'confirmed'
  payment_reference TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  UNIQUE(webinar_id, user_id)
);

-- Tabela de Salas de Reunião Virtual
CREATE TABLE public.meeting_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  host_id UUID NOT NULL,
  room_code TEXT UNIQUE NOT NULL,
  max_participants INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  allow_screen_share BOOLEAN DEFAULT true,
  allow_recording BOOLEAN DEFAULT false,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER DEFAULT 60,
  meeting_type TEXT DEFAULT 'mentorship', -- 'mentorship', 'consultation', 'class', 'open'
  related_id UUID, -- mentorship_id, class_id, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Participantes de Reunião
CREATE TABLE public.meeting_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.meeting_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE,
  is_host BOOLEAN DEFAULT false,
  UNIQUE(room_id, user_id)
);

-- Atualizar tabela de certificados para verificação online e badges
ALTER TABLE public.certificates 
ADD COLUMN IF NOT EXISTS verification_url TEXT,
ADD COLUMN IF NOT EXISTS qr_code_url TEXT,
ADD COLUMN IF NOT EXISTS badge_image_url TEXT,
ADD COLUMN IF NOT EXISTS badge_type TEXT DEFAULT 'completion', -- 'completion', 'excellence', 'specialist'
ADD COLUMN IF NOT EXISTS skills TEXT[],
ADD COLUMN IF NOT EXISTS issuer_name TEXT DEFAULT 'D1000 Formações',
ADD COLUMN IF NOT EXISTS issuer_logo TEXT,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Tabela para verificação pública de certificados
CREATE TABLE public.certificate_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  certificate_id UUID NOT NULL REFERENCES public.certificates(id) ON DELETE CASCADE,
  verified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_by_ip TEXT,
  verified_by_country TEXT
);

-- Adicionar suporte a live streaming nos cursos
ALTER TABLE public.course_lessons
ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS live_scheduled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS live_status TEXT DEFAULT 'scheduled', -- 'scheduled', 'live', 'ended'
ADD COLUMN IF NOT EXISTS live_viewers INTEGER DEFAULT 0;

-- Enable RLS
ALTER TABLE public.partner_institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webinars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webinar_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Partner Institutions
CREATE POLICY "Partner institutions are viewable by everyone"
  ON public.partner_institutions FOR SELECT USING (true);

CREATE POLICY "Admins can manage partner institutions"
  ON public.partner_institutions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies: Affiliates
CREATE POLICY "Users can view their own affiliate profile"
  ON public.affiliates FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own affiliate profile"
  ON public.affiliates FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own affiliate profile"
  ON public.affiliates FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all affiliates"
  ON public.affiliates FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies: Affiliate Referrals
CREATE POLICY "Affiliates can view their own referrals"
  ON public.affiliate_referrals FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM affiliates 
    WHERE affiliates.id = affiliate_referrals.affiliate_id 
    AND affiliates.user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all referrals"
  ON public.affiliate_referrals FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies: Webinars
CREATE POLICY "Webinars are viewable by everyone"
  ON public.webinars FOR SELECT USING (true);

CREATE POLICY "Hosts can manage their webinars"
  ON public.webinars FOR ALL USING (auth.uid() = host_id);

CREATE POLICY "Admins can manage all webinars"
  ON public.webinars FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies: Webinar Registrations
CREATE POLICY "Users can view their own registrations"
  ON public.webinar_registrations FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can register for webinars"
  ON public.webinar_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Hosts can view their webinar registrations"
  ON public.webinar_registrations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM webinars 
    WHERE webinars.id = webinar_registrations.webinar_id 
    AND webinars.host_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all webinar registrations"
  ON public.webinar_registrations FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies: Meeting Rooms
CREATE POLICY "Meeting rooms viewable by participants"
  ON public.meeting_rooms FOR SELECT USING (true);

CREATE POLICY "Users can create meeting rooms"
  ON public.meeting_rooms FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can manage their meeting rooms"
  ON public.meeting_rooms FOR ALL USING (auth.uid() = host_id);

CREATE POLICY "Admins can manage all meeting rooms"
  ON public.meeting_rooms FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies: Meeting Participants
CREATE POLICY "Participants can view meeting info"
  ON public.meeting_participants FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can join meetings"
  ON public.meeting_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Hosts can manage meeting participants"
  ON public.meeting_participants FOR ALL
  USING (EXISTS (
    SELECT 1 FROM meeting_rooms 
    WHERE meeting_rooms.id = meeting_participants.room_id 
    AND meeting_rooms.host_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all meeting participants"
  ON public.meeting_participants FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies: Certificate Verifications (público para verificação)
CREATE POLICY "Anyone can verify certificates"
  ON public.certificate_verifications FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view verifications"
  ON public.certificate_verifications FOR SELECT USING (true);

-- Índices para performance
CREATE INDEX idx_affiliates_code ON public.affiliates(affiliate_code);
CREATE INDEX idx_affiliates_user ON public.affiliates(user_id);
CREATE INDEX idx_webinars_scheduled ON public.webinars(scheduled_at);
CREATE INDEX idx_webinars_status ON public.webinars(status);
CREATE INDEX idx_meeting_rooms_code ON public.meeting_rooms(room_code);
CREATE INDEX idx_certificates_code ON public.certificates(certificate_code);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_partner_institutions_updated_at
  BEFORE UPDATE ON public.partner_institutions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliates_updated_at
  BEFORE UPDATE ON public.affiliates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webinars_updated_at
  BEFORE UPDATE ON public.webinars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();