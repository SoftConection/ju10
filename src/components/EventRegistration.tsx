import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Check, X } from 'lucide-react';

interface EventRegistrationProps {
  eventId: string;
  onRegister: () => void;
  isRegistered: boolean;
  className?: string;
  onAuthRequired?: () => void;
  targetDate?: Date;
}

export const EventRegistration: React.FC<EventRegistrationProps> = ({ 
  eventId,
  onRegister, 
  isRegistered: initialIsRegistered,
  className = "",
  onAuthRequired,
  targetDate
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isRegistered, setIsRegistered] = useState(initialIsRegistered);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkRegistration(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkRegistration(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [eventId]);

  const checkRegistration = async (userId: string) => {
    const { data } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .maybeSingle();
    
    setIsRegistered(!!data);
  };

  const getEventStatus = () => {
    if (!targetDate) return 'upcoming';
    const now = new Date().getTime();
    const target = targetDate.getTime();
    const distance = target - now;
    const oneHour = 1000 * 60 * 60;
    
    if (distance < -oneHour) return 'ended';
    if (distance >= -oneHour && distance <= oneHour) return 'happening';
    return 'upcoming';
  };

  const eventStatus = getEventStatus();
  const isPastEvent = eventStatus === 'ended';

  const handleRegister = async () => {
    if (isPastEvent) {
      toast({
        title: 'Evento encerrado',
        description: 'Não é possível se inscrever em eventos passados',
        variant: 'destructive'
      });
      return;
    }

    if (!user) {
      if (onAuthRequired) {
        onAuthRequired();
      } else {
        toast({
          title: 'Login necessário',
          description: 'Faça login para se inscrever em eventos',
          variant: 'destructive'
        });
      }
      return;
    }

    setLoading(true);
    
    try {
      if (isRegistered) {
        const { error } = await supabase
          .from('event_registrations')
          .delete()
          .eq('user_id', user.id)
          .eq('event_id', eventId);

        if (error) throw error;

        setIsRegistered(false);
        toast({
          title: 'Inscrição cancelada',
          description: 'Você foi removido deste evento'
        });
      } else {
        const { error } = await supabase
          .from('event_registrations')
          .insert({
            user_id: user.id,
            event_id: eventId
          });

        if (error) throw error;

        setIsRegistered(true);
        onRegister();
        toast({
          title: 'Inscrito!',
          description: 'Você foi inscrito com sucesso neste evento'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getButtonStyles = () => {
    if (isPastEvent) {
      return 'bg-muted text-muted-foreground cursor-not-allowed';
    }
    if (isRegistered) {
      return 'bg-secondary text-secondary-foreground hover:bg-destructive hover:text-destructive-foreground';
    }
    return 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-ju10-lg';
  };

  const getButtonText = () => {
    if (loading) return 'Aguarde...';
    if (isPastEvent) return 'Evento Encerrado';
    if (isRegistered) return 'Cancelar Inscrição';
    return 'Inscrever-se';
  };

  const getButtonIcon = () => {
    if (loading) return null;
    if (isPastEvent) return null;
    if (isRegistered) return <X className="w-4 h-4" />;
    return <ArrowRight className="w-4 h-4" />;
  };

  return (
    <div className={`w-full ${className}`}>
      <button 
        onClick={handleRegister}
        disabled={loading || isPastEvent}
        className={`
          w-full h-14 flex items-center justify-center gap-3 
          font-semibold text-sm uppercase tracking-wide
          rounded-xl transition-all duration-300 ease-out
          disabled:opacity-50 disabled:cursor-not-allowed
          active:scale-[0.98]
          ${getButtonStyles()}
        `}
        aria-label={isPastEvent ? "Evento encerrado" : isRegistered ? "Cancelar inscrição" : "Inscrever-se no evento"}
      >
        {isRegistered && !isPastEvent && !loading && (
          <Check className="w-4 h-4" />
        )}
        <span>{getButtonText()}</span>
        {getButtonIcon()}
      </button>
    </div>
  );
};
