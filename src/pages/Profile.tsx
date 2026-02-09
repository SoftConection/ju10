import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { Navbar } from '@/components/Navbar';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MemberProfileForm } from '@/components/MemberProfileForm';
import { 
  User as UserIcon, 
  Calendar, 
  MapPin, 
  Settings, 
  LogOut,
  Ticket,
  PlusCircle,
  Mail,
  Clock,
  FileText
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  address: string;
  background_image_url: string;
  target_date: string;
}

interface Registration {
  id: string;
  registered_at: string;
  event: Event;
}

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<Registration[]>([]);
  const [activeTab, setActiveTab] = useState<'registrations' | 'created' | 'settings'>('registrations');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate('/auth');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate('/auth');
      } else {
        fetchProfileData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfileData = async (userId: string) => {
    setLoading(true);
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
        setDisplayName(profileData.display_name || '');
      }

      // Fetch created events
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('created_by', userId)
        .order('target_date', { ascending: false });

      if (eventsData) {
        setCreatedEvents(eventsData);
      }

      // Fetch registered events
      const { data: registrationsData } = await supabase
        .from('event_registrations')
        .select(`
          id,
          registered_at,
          event:events (
            id,
            title,
            date,
            time,
            address,
            background_image_url,
            target_date
          )
        `)
        .eq('user_id', userId)
        .order('registered_at', { ascending: false });

      if (registrationsData) {
        const validRegistrations = registrationsData
          .filter(r => r.event)
          .map(r => ({
            id: r.id,
            registered_at: r.registered_at,
            event: r.event as unknown as Event
          }));
        setRegisteredEvents(validRegistrations);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram salvas com sucesso.'
      });
      
      if (profile) {
        setProfile({ ...profile, display_name: displayName });
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const isEventPast = (targetDate: string) => {
    return new Date(targetDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground text-sm">Carregando perfil...</span>
        </div>
      </div>
    );
  }

  const TabButton = ({ 
    tab, 
    label, 
    icon: Icon, 
    count 
  }: { 
    tab: typeof activeTab; 
    label: string; 
    icon: React.ElementType; 
    count?: number 
  }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`
        flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200
        border-b-2 -mb-px
        ${activeTab === tab 
          ? 'border-primary text-primary' 
          : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
        }
      `}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      {count !== undefined && (
        <span className={`
          px-2 py-0.5 text-xs rounded-full
          ${activeTab === tab ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
        `}>
          {count}
        </span>
      )}
    </button>
  );

  const EventCard = ({ event, showStatus = false, registeredAt }: { event: Event; showStatus?: boolean; registeredAt?: string }) => {
    const isPast = isEventPast(event.target_date);
    
    return (
      <div 
        onClick={() => navigate(`/event/${event.id}`)}
        className="group bg-card rounded-xl overflow-hidden border border-border shadow-soft hover:shadow-soft-lg transition-all duration-300 cursor-pointer hover:-translate-y-1"
      >
        <div className="relative h-32 md:h-40 overflow-hidden">
          <img 
            src={event.background_image_url} 
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
          {showStatus && (
            <span className={`
              absolute top-3 right-3 px-2 py-1 text-xs font-semibold rounded-lg
              ${isPast ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground'}
            `}>
              {isPast ? 'Encerrado' : 'Próximo'}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-foreground line-clamp-1 mb-2 group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{event.date} às {event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <MapPin className="w-3.5 h-3.5" />
            <span className="line-clamp-1">{event.address}</span>
          </div>
          {registeredAt && (
            <div className="flex items-center gap-2 text-primary text-xs mt-2 pt-2 border-t border-border">
              <Clock className="w-3.5 h-3.5" />
              <span>Inscrito em {formatDate(registeredAt)}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <SEOHead 
        title="Meu Perfil | JU10"
        description="Gerencie seu perfil, veja seus eventos e configurações da conta."
      />
      <Navbar />

      <main className="min-h-screen bg-background pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          {/* Profile Header */}
          <div className="bg-card rounded-2xl border border-border shadow-soft p-6 md:p-8 mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center shadow-ju10">
                <UserIcon className="w-10 h-10 md:w-12 md:h-12 text-primary-foreground" />
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display mb-1">
                  {profile?.display_name || 'Usuário'}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                  <Mail className="w-4 h-4" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="bg-secondary px-3 py-1.5 rounded-lg">
                    <span className="text-secondary-foreground text-xs font-medium">
                      {registeredEvents.length} inscrições
                    </span>
                  </div>
                  <div className="bg-secondary px-3 py-1.5 rounded-lg">
                    <span className="text-secondary-foreground text-xs font-medium">
                      {createdEvents.length} eventos criados
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="ju10-outline"
                  size="sm"
                  onClick={() => navigate('/create-event')}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden md:inline">Criar Evento</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
            <div className="flex border-b border-border px-2 overflow-x-auto scrollbar-hide">
              <TabButton 
                tab="registrations" 
                label="Inscrições" 
                icon={Ticket} 
                count={registeredEvents.length} 
              />
              <TabButton 
                tab="created" 
                label="Meus Eventos" 
                icon={Calendar} 
                count={createdEvents.length} 
              />
              <TabButton 
                tab="settings" 
                label="Configurações" 
                icon={Settings} 
              />
            </div>

            <div className="p-4 md:p-6">
              {/* Registrations Tab */}
              {activeTab === 'registrations' && (
                <div>
                  {registeredEvents.length === 0 ? (
                    <div className="text-center py-12">
                      <Ticket className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Nenhuma inscrição
                      </h3>
                      <p className="text-muted-foreground text-sm mb-6">
                        Você ainda não se inscreveu em nenhum evento.
                      </p>
                      <Button variant="ju10" onClick={() => navigate('/')}>
                        Descobrir Eventos
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {registeredEvents.map((registration) => (
                        <EventCard 
                          key={registration.id} 
                          event={registration.event} 
                          showStatus
                          registeredAt={registration.registered_at}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Created Events Tab */}
              {activeTab === 'created' && (
                <div>
                  {createdEvents.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Nenhum evento criado
                      </h3>
                      <p className="text-muted-foreground text-sm mb-6">
                        Você ainda não criou nenhum evento.
                      </p>
                      <Button variant="ju10" onClick={() => navigate('/create-event')}>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Criar Primeiro Evento
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {createdEvents.map((event) => (
                        <EventCard key={event.id} event={event} showStatus />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  {/* Member Profile Form */}
                  {user && (
                    <MemberProfileForm userId={user.id} />
                  )}
                  
                  {/* Account Actions */}
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Conta
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Email
                        </label>
                        <p className="text-muted-foreground text-sm">{user?.email}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Membro desde
                        </label>
                        <p className="text-muted-foreground text-sm">
                          {profile?.created_at ? formatDate(profile.created_at) : '-'}
                        </p>
                      </div>
                      
                      <div className="pt-4 border-t border-border">
                        <Button
                          variant="outline"
                          onClick={handleSignOut}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sair da Conta
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Profile;
