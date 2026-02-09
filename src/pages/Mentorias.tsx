import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { MentorshipEnrollmentModal } from '@/components/MentorshipEnrollmentModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Target, 
  Clock, 
  CheckCircle2,
  ChevronRight,
  Star,
  Calendar,
  Video,
  MessageSquare,
  Zap,
  Loader2
} from 'lucide-react';

interface Mentorship {
  id: string;
  title: string;
  description: string;
  mentor_id: string;
  price_aoa: number;
  duration_weeks: number;
  max_students: number;
  category: string;
  image_url: string;
  is_active: boolean;
}

interface MentorshipCardData {
  id: string;
  title: string;
  description: string;
  mentor: string;
  mentorRole: string;
  mentorImage: string;
  duration: string;
  sessions: number;
  features: string[];
  price_aoa: number;
  popular?: boolean;
}

const MOCK_MENTORSHIPS: MentorshipCardData[] = [
  {
    id: '1',
    title: 'Mentoria Individual',
    description: 'Acompanhamento personalizado 1:1 para acelerar sua carreira ou negócio em marketing.',
    mentor: 'Equipe JU10',
    mentorRole: 'Especialistas em Marketing',
    mentorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    duration: '3 meses',
    sessions: 12,
    features: [
      '12 sessões individuais de 1 hora',
      'Análise completa do seu negócio',
      'Plano de ação personalizado',
      'Suporte via WhatsApp',
      'Materiais exclusivos',
      'Acesso a todos os cursos'
    ],
    price_aoa: 450000,
    popular: true
  },
  {
    id: '2',
    title: 'Mentoria em Grupo',
    description: 'Sessões em grupo com networking qualificado e troca de experiências entre participantes.',
    mentor: 'Equipe JU10',
    mentorRole: 'Especialistas em Marketing',
    mentorImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop',
    duration: '2 meses',
    sessions: 8,
    features: [
      '8 sessões em grupo de 2 horas',
      'Turmas com até 10 pessoas',
      'Networking qualificado',
      'Exercícios práticos',
      'Grupo exclusivo no WhatsApp',
      'Acesso a cursos selecionados'
    ],
    price_aoa: 225000
  },
  {
    id: '3',
    title: 'Mentoria Express',
    description: 'Sessões focadas para resolver desafios específicos e obter resultados rápidos.',
    mentor: 'Equipe JU10',
    mentorRole: 'Especialistas em Marketing',
    mentorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    duration: '1 mês',
    sessions: 4,
    features: [
      '4 sessões individuais de 1 hora',
      'Foco em problema específico',
      'Plano de ação objetivo',
      'Suporte por 30 dias',
      'Materiais de apoio'
    ],
    price_aoa: 150000
  }
];

const MentorshipCard = ({ 
  mentorship, 
  delay,
  onEnroll,
  isEnrolled,
  hasConfirmedPayment
}: { 
  mentorship: MentorshipCardData; 
  delay: string;
  onEnroll: () => void;
  isEnrolled: boolean;
  hasConfirmedPayment: boolean;
}) => {
  const navigate = useNavigate();
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleClick = () => {
    if (hasConfirmedPayment) {
      navigate(`/mentoria/${mentorship.id}`);
    } else {
      onEnroll();
    }
  };

  return (
    <div 
      className={`relative bg-card border rounded-2xl overflow-hidden card-hover animate-fade-in ${
        mentorship.popular ? 'border-primary' : 'border-border'
      }`}
      style={{ animationDelay: delay, animationFillMode: 'both' }}
    >
      {mentorship.popular && (
        <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-2 text-sm font-semibold">
          Mais Popular
        </div>
      )}
      
      <div className={`p-8 ${mentorship.popular ? 'pt-14' : ''}`}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <img 
            src={mentorship.mentorImage} 
            alt={mentorship.mentor}
            className="w-16 h-16 rounded-full object-cover border-2 border-primary"
          />
          <div>
            <h3 className="text-xl font-display font-bold">{mentorship.title}</h3>
            <p className="text-sm text-muted-foreground">{mentorship.mentor}</p>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-muted-foreground mb-6">
          {mentorship.description}
        </p>
        
        {/* Meta */}
        <div className="flex items-center gap-6 mb-6 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            {mentorship.duration}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Video className="w-4 h-4" />
            {mentorship.sessions} sessões
          </div>
        </div>
        
        {/* Features */}
        <div className="space-y-3 mb-8">
          {mentorship.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
        
        {/* Price & CTA */}
        <div className="pt-6 border-t border-border">
          <div className="mb-4">
            <div className="text-3xl font-bold text-primary">
              {formatPrice(mentorship.price_aoa)}
            </div>
            <div className="text-sm text-muted-foreground">
              ou 12x de {formatPrice(mentorship.price_aoa / 12)}
            </div>
          </div>
          <Button 
            variant={mentorship.popular ? 'ju10' : 'ju10-outline'} 
            className="w-full rounded-xl"
            onClick={handleClick}
          >
            {hasConfirmedPayment ? (
              <>
                Aceder à Mentoria
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            ) : isEnrolled ? (
              <>
                Aguardando Pagamento
                <Clock className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Quero Esta Mentoria
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

const Mentorias = () => {
  const [mentorships, setMentorships] = useState<MentorshipCardData[]>(MOCK_MENTORSHIPS);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<Map<string, { status: string }>>(new Map());
  const [selectedMentorship, setSelectedMentorship] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchMentorships();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserEnrollments();
    }
  }, [user]);

  const fetchMentorships = async () => {
    try {
      const { data, error } = await supabase
        .from('mentorships')
        .select('*')
        .eq('is_active', true)
        .order('created_at');

      if (error) throw error;

      if (data && data.length > 0) {
        // Transform DB data to card format
        const transformed = data.map((m, index) => ({
          id: m.id,
          title: m.title,
          description: m.description || '',
          mentor: 'Equipe JU10',
          mentorRole: 'Especialistas em Marketing',
          mentorImage: m.image_url || `https://images.unsplash.com/photo-147209964578${index}-5658abf4ff4e?w=200&h=200&fit=crop`,
          duration: `${m.duration_weeks} semanas`,
          sessions: m.duration_weeks * 2,
          features: [
            `${m.duration_weeks * 2} sessões de mentoria`,
            'Acompanhamento personalizado',
            'Materiais exclusivos',
            'Suporte contínuo',
          ],
          price_aoa: m.price_aoa,
          popular: index === 0,
        }));
        setMentorships(transformed);
      }
    } catch (error) {
      console.error('Error fetching mentorships:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEnrollments = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('mentorship_enrollments')
        .select('mentorship_id, payment_status')
        .eq('user_id', user.id);

      if (data) {
        const enrollmentMap = new Map(
          data.map(e => [e.mentorship_id, { status: e.payment_status }])
        );
        setEnrollments(enrollmentMap);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  const handleEnroll = (mentorship: MentorshipCardData) => {
    if (!user) {
      toast({
        title: 'Autenticação necessária',
        description: 'Faça login para se inscrever na mentoria.',
      });
      return;
    }

    setSelectedMentorship({
      id: mentorship.id,
      title: mentorship.title,
      price_aoa: mentorship.price_aoa,
      duration_weeks: parseInt(mentorship.duration.split(' ')[0]) || 4,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Mentorias de Marketing | JU10 - Juventude 10"
        description="Mentorias personalizadas em marketing. Acompanhamento individual ou em grupo para acelerar sua carreira e seus resultados."
        keywords="mentoria marketing, coaching marketing digital, acompanhamento profissional, desenvolvimento de carreira, JU10"
      />
      
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 md:pt-40 pb-16 px-4 md:px-8 bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 animate-fade-in">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Mentorias</span>
          </div>
          
          <div className="max-w-3xl">
            <div 
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-fade-in"
              style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
            >
              <Target className="w-4 h-4" />
              Acompanhamento Personalizado
            </div>
            
            <h1 
              className="text-4xl md:text-5xl font-display font-bold mb-6 animate-fade-in"
              style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
            >
              Mentorias em <span className="text-gradient-ju10">Marketing</span>
            </h1>
            
            <p 
              className="text-lg text-muted-foreground animate-fade-in"
              style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
            >
              Acelere seu crescimento com acompanhamento de especialistas. 
              Mentorias individuais ou em grupo para todos os níveis.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 px-4 md:px-8 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Video, label: 'Sessões ao vivo' },
              { icon: MessageSquare, label: 'Suporte contínuo' },
              { icon: Calendar, label: 'Horários flexíveis' },
              { icon: Zap, label: 'Resultados rápidos' }
            ].map((item, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 animate-fade-in"
                style={{ animationDelay: `${0.1 + index * 0.1}s`, animationFillMode: 'both' }}
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mentorships Grid */}
      <section className="py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {mentorships.map((mentorship, index) => (
                <MentorshipCard 
                  key={mentorship.id} 
                  mentorship={mentorship} 
                  delay={`${0.1 + index * 0.15}s`}
                  onEnroll={() => handleEnroll(mentorship)}
                  isEnrolled={enrollments.has(mentorship.id)}
                  hasConfirmedPayment={enrollments.get(mentorship.id)?.status === 'confirmed'}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Como Funciona
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Um processo simples para começar sua jornada de mentoria
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Escolha', description: 'Selecione o tipo de mentoria ideal para você' },
              { step: '02', title: 'Inscrição', description: 'Faça sua inscrição e efetue o pagamento' },
              { step: '03', title: 'Diagnóstico', description: 'Analisamos sua situação atual e definimos metas' },
              { step: '04', title: 'Execução', description: 'Acompanhamento contínuo até alcançar resultados' }
            ].map((item, index) => (
              <div 
                key={index}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${0.1 + index * 0.1}s`, animationFillMode: 'both' }}
              >
                <div className="text-5xl font-display font-bold text-primary/20 mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              O Que Dizem Nossos Mentorados
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                name: 'Ana Silva', 
                role: 'Empreendedora', 
                text: 'A mentoria transformou completamente minha visão de marketing. Consegui triplicar minhas vendas em 3 meses.',
                rating: 5
              },
              { 
                name: 'Carlos Santos', 
                role: 'Gestor de Marketing', 
                text: 'O acompanhamento personalizado fez toda diferença. Hoje lidero uma equipe com muito mais confiança.',
                rating: 5
              },
              { 
                name: 'Maria Oliveira', 
                role: 'Freelancer', 
                text: 'Investimento que vale cada centavo. O networking e conhecimento adquirido são impagáveis.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <div 
                key={index}
                className="bg-card border border-border rounded-2xl p-6 animate-fade-in"
                style={{ animationDelay: `${0.1 + index * 0.1}s`, animationFillMode: 'both' }}
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 md:px-8 bg-foreground text-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
            Pronto para acelerar seus resultados?
          </h2>
          <p className="text-lg text-background/70 mb-8">
            Agende uma conversa gratuita e descubra qual mentoria é ideal para você.
          </p>
          <Button 
            variant="ju10" 
            size="lg" 
            className="rounded-xl"
          >
            Agendar Conversa Gratuita
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Enrollment Modal */}
      <MentorshipEnrollmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMentorship(null);
          fetchUserEnrollments();
        }}
        mentorship={selectedMentorship}
      />
    </div>
  );
};

export default Mentorias;
