import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import d1000Logo from '@/assets/d1000-logo.jpg';
import {
  Video,
  Calendar,
  Clock,
  Users,
  Play,
  Bell,
  ChevronRight,
  Loader2,
  Radio,
  CalendarDays,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface Webinar {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  scheduled_at: string;
  duration_minutes: number;
  max_participants: number;
  is_live: boolean;
  is_free: boolean;
  price_aoa: number;
  status: string;
  category: string;
  stream_platform: string;
  replay_url: string;
  registrations_count?: number;
}

const WebinarCard = ({ 
  webinar, 
  isRegistered,
  onRegister 
}: { 
  webinar: Webinar; 
  isRegistered: boolean;
  onRegister: () => void;
}) => {
  const scheduledDate = new Date(webinar.scheduled_at);
  const isLive = webinar.status === 'live';
  const isEnded = webinar.status === 'ended';
  const isPast = scheduledDate < new Date() && !isLive;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-AO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-AO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden card-hover group">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={webinar.thumbnail_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=450&fit=crop'} 
          alt={webinar.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          {isLive ? (
            <Badge className="bg-red-500 text-white animate-pulse">
              <Radio className="w-3 h-3 mr-1" />
              AO VIVO
            </Badge>
          ) : isEnded && webinar.replay_url ? (
            <Badge className="bg-purple-500 text-white">
              <Play className="w-3 h-3 mr-1" />
              Replay Disponível
            </Badge>
          ) : (
            <Badge className="bg-primary text-white">
              <CalendarDays className="w-3 h-3 mr-1" />
              Agendado
            </Badge>
          )}
        </div>

        {/* Free Badge */}
        {webinar.is_free && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-green-500 text-white">Gratuito</Badge>
          </div>
        )}

        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
            <Play className="w-6 h-6 text-primary ml-1" />
          </div>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <div className="flex items-center gap-2 text-white text-sm">
            <Clock className="w-4 h-4" />
            {webinar.duration_minutes} min
          </div>
          <div className="flex items-center gap-2 text-white text-sm">
            <Users className="w-4 h-4" />
            {webinar.registrations_count || 0} / {webinar.max_participants}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            {webinar.category || 'Webinar'}
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground capitalize">
            {webinar.stream_platform}
          </span>
        </div>

        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {webinar.title}
        </h3>

        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {webinar.description}
        </p>

        {/* Schedule */}
        <div className="flex items-center gap-3 text-sm mb-6 p-3 bg-muted/50 rounded-xl">
          <Calendar className="w-5 h-5 text-primary" />
          <div>
            <p className="font-semibold text-foreground capitalize">
              {formatDate(scheduledDate)}
            </p>
            <p className="text-muted-foreground">
              {formatTime(scheduledDate)} (Hora de Angola)
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          {!webinar.is_free && (
            <div className="text-xl font-bold text-primary">
              {formatPrice(webinar.price_aoa)}
            </div>
          )}
          
          {isLive ? (
            <Button variant="ju10" className="ml-auto animate-pulse">
              <Radio className="w-4 h-4 mr-2" />
              Entrar Agora
            </Button>
          ) : isEnded && webinar.replay_url ? (
            <Button variant="outline" className="ml-auto">
              <Play className="w-4 h-4 mr-2" />
              Ver Replay
            </Button>
          ) : isRegistered ? (
            <Button variant="outline" className="ml-auto" disabled>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Inscrito
            </Button>
          ) : (
            <Button variant="ju10" className="ml-auto" onClick={onRegister}>
              <Bell className="w-4 h-4 mr-2" />
              Inscrever-se
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const Webinars = () => {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [registrations, setRegistrations] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'upcoming' | 'live' | 'past'>('upcoming');
  const { toast } = useToast();

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
    fetchWebinars();
  }, [filter]);

  useEffect(() => {
    if (user) {
      fetchUserRegistrations();
    }
  }, [user]);

  const fetchWebinars = async () => {
    try {
      setLoading(true);
      let query = supabase.from('webinars').select('*');

      const now = new Date().toISOString();

      if (filter === 'upcoming') {
        query = query.gte('scheduled_at', now).eq('status', 'scheduled').order('scheduled_at', { ascending: true });
      } else if (filter === 'live') {
        query = query.eq('status', 'live');
      } else {
        query = query.eq('status', 'ended').order('scheduled_at', { ascending: false });
      }

      const { data, error } = await query.limit(12);

      if (error) throw error;
      setWebinars(data || []);
    } catch (error) {
      console.error('Error fetching webinars:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRegistrations = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('webinar_registrations')
        .select('webinar_id')
        .eq('user_id', user.id);

      if (data) {
        setRegistrations(new Set(data.map(r => r.webinar_id)));
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const handleRegister = async (webinarId: string) => {
    if (!user) {
      toast({
        title: 'Autenticação necessária',
        description: 'Faça login para se inscrever no webinar.',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('webinar_registrations')
        .insert({
          webinar_id: webinarId,
          user_id: user.id,
        });

      if (error) throw error;

      setRegistrations(prev => new Set([...prev, webinarId]));
      toast({
        title: 'Inscrição confirmada!',
        description: 'Você receberá um lembrete antes do webinar começar.',
      });
    } catch (error: any) {
      if (error.code === '23505') {
        toast({
          title: 'Já está inscrito',
          description: 'Você já está inscrito neste webinar.',
        });
      } else {
        toast({
          title: 'Erro na inscrição',
          description: 'Ocorreu um erro. Tente novamente.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Webinars ao Vivo | D1000 - Formações Online"
        description="Participe de webinars ao vivo e aprenda com os melhores especialistas. Eventos online gratuitos e pagos sobre marketing, vendas, liderança e mais."
        keywords="webinars, eventos online, formação ao vivo, D1000, marketing, vendas, liderança"
      />
      
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-12 px-4 md:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Webinars</span>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <img 
              src={d1000Logo} 
              alt="D1000" 
              className="h-14 w-14 rounded-xl shadow-lg"
            />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">D1000 Apresenta</p>
              <h1 className="text-3xl md:text-4xl font-black">
                <span className="text-gradient-ju10">Webinars</span> ao Vivo
              </h1>
            </div>
          </div>

          <p className="text-lg text-muted-foreground max-w-2xl mb-8">
            Aprenda em tempo real com os melhores especialistas. Participe de eventos online, faça perguntas e conecte-se com a comunidade D1000.
          </p>

          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'upcoming', label: 'Próximos', icon: Calendar },
              { key: 'live', label: 'Ao Vivo', icon: Radio },
              { key: 'past', label: 'Replays', icon: Play },
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={filter === tab.key ? 'ju10' : 'outline'}
                onClick={() => setFilter(tab.key as any)}
                className="rounded-xl"
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Webinars Grid */}
      <section className="py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : webinars.length === 0 ? (
            <div className="text-center py-20">
              <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Nenhum webinar encontrado</h3>
              <p className="text-muted-foreground mb-6">
                {filter === 'live' 
                  ? 'Não há webinars ao vivo no momento.'
                  : filter === 'past'
                  ? 'Nenhum replay disponível ainda.'
                  : 'Novos webinars serão anunciados em breve!'}
              </p>
              <Button asChild variant="outline">
                <Link to="/formacoes">Ver Formações</Link>
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {webinars.map((webinar) => (
                <WebinarCard
                  key={webinar.id}
                  webinar={webinar}
                  isRegistered={registrations.has(webinar.id)}
                  onRegister={() => handleRegister(webinar.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 md:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Quer hospedar um webinar?
          </h2>
          <p className="text-muted-foreground mb-6">
            Entre em contacto conosco para organizar seu próprio evento na plataforma D1000.
          </p>
          <Button asChild variant="ju10" size="lg" className="rounded-xl">
            <Link to="/empresas">
              <ExternalLink className="w-5 h-5 mr-2" />
              Planos Empresariais
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Webinars;
