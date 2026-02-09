import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from './Navbar';
import { EventCountdown } from './EventCountdown';
import { EventMeta } from './EventMeta';
import { EventHeader } from './EventHeader';
import { EventDescription } from './EventDescription';
import { EventLocation } from './EventLocation';
import { EventRegistration } from './EventRegistration';
import { EventExternalRegistration } from './EventExternalRegistration';
import { EventParticipantsPanel } from './EventParticipantsPanel';
import { AuthSheet } from './AuthSheet';
import { SEOHead } from './SEOHead';
import { RotatingBadge } from './RotatingBadge';
import { Button } from './ui/button';
import { ArrowLeft, Users } from 'lucide-react';
import { User, Session } from '@supabase/supabase-js';

interface Event {
  id: string;
  title: string;
  creator: string;
  description: string;
  date: string;
  time: string;
  address: string;
  background_image_url: string;
  target_date: string;
  created_by: string;
}

export const EventDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [showExternalForm, setShowExternalForm] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);
  
  useEffect(() => {
    fetchEvent();
    checkRegistration();
  }, [id]);
  
  const fetchEvent = async () => {
    const { data, error } = id
      ? await supabase.from('events').select('*').eq('id', id).maybeSingle()
      : await supabase.from('events').select('*').limit(1).maybeSingle();
    
    if (error) {
      if (import.meta.env.DEV) console.error('Error fetching event:', error);
      setNotFound(true);
    } else if (!data) {
      setNotFound(true);
    } else {
      setEvent(data);
    }
    setLoading(false);
  };

  const checkRegistration = async () => {
    if (!id) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('event_id', id)
      .maybeSingle();
    
    setIsRegistered(!!data);
  };

  const handleGetDirections = () => {
    window.open('https://maps.google.com', '_blank');
  };

  const isEventLive = () => {
    if (!event) return false;
    const now = new Date().getTime();
    const target = new Date(event.target_date).getTime();
    const distance = target - now;
    const oneHour = 1000 * 60 * 60;
    return distance >= -oneHour && distance <= oneHour;
  };

  const isEventCreator = () => {
    return user && event && user.id === event.created_by;
  };

  const handleExternalSuccess = () => {
    setShowExternalForm(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground text-sm">Carregando...</span>
        </div>
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background px-4">
        <SEOHead 
          title="Evento não encontrado"
          description="O evento que você procura não existe ou foi removido."
        />
        <Navbar />
        <div className="text-center mt-20 max-w-md">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🔍</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground font-display">
            Evento não encontrado
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            O evento que você procura não existe ou foi removido.
          </p>
          <Button
            onClick={() => navigate('/eventos')}
            variant="ju10"
            size="lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ver todos os eventos
          </Button>
        </div>
      </div>
    );
  }

  // Show participants panel for event creators
  if (showParticipants && isEventCreator()) {
    return (
      <>
        <SEOHead 
          title={`Participantes - ${event.title} | JU10`}
          description={`Lista de participantes do evento ${event.title}`}
        />
        <Navbar />
        <main className="min-h-screen bg-background pt-24 pb-12">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <Button
              variant="ghost"
              className="mb-6"
              onClick={() => setShowParticipants(false)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Evento
            </Button>
            <EventParticipantsPanel eventId={event.id} eventTitle={event.title} />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SEOHead 
        title={`${event.title} | JU10`}
        description={event.description.substring(0, 160)}
        image={event.background_image_url}
        keywords={`evento, ${event.title}, ${event.address}, JU10, Juventude 10`}
      />
      <Navbar />

      <main className="flex min-h-screen justify-center items-start w-full relative bg-background mx-auto my-0 lg:flex-row flex-col">
        {/* Hero Image Section */}
        <div 
          className="lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-[calc(100%-540px)] relative w-full h-[50vh] md:h-[60vh] lg:h-screen flex flex-col justify-end overflow-hidden"
          role="img" 
          aria-label="Imagem de fundo do evento"
        >
          {/* Background Image with Zoom Animation */}
          <div 
            className="absolute inset-0 animate-[zoom-in_1.2s_ease-out_forwards]" 
            style={{
              backgroundImage: `url("${event.background_image_url}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/20 to-transparent" />
          
          {/* Countdown */}
          <div className="relative z-10 p-6 md:p-10 lg:p-12 animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
            <EventCountdown targetDate={new Date(event.target_date)} />
          </div>
        </div>
        
        {/* Content Section */}
        <aside className="lg:fixed lg:right-0 lg:top-0 lg:h-screen lg:w-[540px] w-full bg-background lg:overflow-y-auto">
          <div className="flex w-full flex-col items-start gap-8 relative p-6 md:p-10 pb-32 lg:pb-28 opacity-0 animate-fade-in [animation-delay:200ms]">
            {/* Meta & Header */}
            <div className="flex flex-col items-start gap-4 self-stretch relative">
              <EventMeta date={event.date} time={event.time} />
              <EventHeader title={event.title} creator={event.creator} />
            </div>
            
            {/* Description */}
            <EventDescription description={event.description} />
            
            {/* Location */}
            <EventLocation address={event.address} onGetDirections={handleGetDirections} />

            {/* Event Creator Actions */}
            {isEventCreator() && (
              <div className="w-full bg-secondary/50 rounded-xl p-4 border border-border">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Gerenciar Evento</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowParticipants(true)}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Ver Participantes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/event/${event.id}/edit`)}
                  >
                    Editar Evento
                  </Button>
                </div>
              </div>
            )}

            {/* External Registration Option (for non-logged users) */}
            {!user && (
              <div className="w-full bg-secondary/50 rounded-xl p-4 border border-border">
                <p className="text-sm text-muted-foreground mb-3">
                  Não é membro da JU10? Inscreva-se como participante externo.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setShowExternalForm(true)}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Inscrever como Participante Externo
                </Button>
              </div>
            )}
          </div>
          
          {/* Fixed Registration Button */}
          <div className="fixed lg:right-0 lg:w-[540px] bottom-0 left-0 right-0 w-full bg-background/95 backdrop-blur-md py-4 px-6 md:px-10 border-t border-border shadow-soft-lg lg:shadow-none">
            <EventRegistration 
              eventId={event.id}
              onRegister={checkRegistration} 
              isRegistered={isRegistered}
              onAuthRequired={() => setIsAuthOpen(true)}
              targetDate={new Date(event.target_date)}
              className="opacity-0 animate-fade-in [animation-delay:400ms]" 
            />
          </div>
        </aside>
      </main>
      
      <AuthSheet isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      
      {/* External Registration Modal */}
      <EventExternalRegistration
        eventId={event.id}
        eventTitle={event.title}
        isOpen={showExternalForm}
        onClose={() => setShowExternalForm(false)}
        onSuccess={handleExternalSuccess}
      />
    </>
  );
};
