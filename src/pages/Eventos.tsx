import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Clock, Users, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  address: string;
  background_image_url: string;
  target_date: string;
}

const Eventos = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("target_date", { ascending: true });

      if (!error && data) {
        // Filter out past events
        const now = new Date();
        const upcomingEvents = data.filter(
          (event) => new Date(event.target_date) > now
        );
        setEvents(upcomingEvents);
      }
      setLoading(false);
    };

    fetchEvents();
  }, []);

  const isEventLive = (targetDate: string) => {
    const eventDate = new Date(targetDate);
    const now = new Date();
    const diffMs = eventDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours <= 1 && diffHours >= -2;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
              <Sparkles className="w-3 h-3 mr-1" />
              Networking & Aprendizagem
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
              Eventos <span className="text-primary">Exclusivos</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Participe dos nossos eventos presenciais e online. 
              Conecte-se com profissionais, aprenda com especialistas e 
              expanda sua rede de contactos.
            </p>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="h-48 bg-muted" />
                  <CardContent className="p-6">
                    <div className="h-6 bg-muted rounded mb-4" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Nenhum evento disponível</h3>
              <p className="text-muted-foreground">
                Novos eventos serão anunciados em breve. Fique atento!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => {
                const isLive = isEventLive(event.target_date);
                const eventDate = new Date(event.target_date);
                
                return (
                  <Card 
                    key={event.id} 
                    className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 cursor-pointer"
                    onClick={() => navigate(`/evento/${event.id}`)}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={event.background_image_url || "/placeholder.svg"}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                      
                      {isLive && (
                        <Badge className="absolute top-4 left-4 bg-red-500 text-white animate-pulse">
                          🔴 AO VIVO
                        </Badge>
                      )}
                      
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-2 text-sm text-white/90">
                          <Calendar className="w-4 h-4" />
                          <span>{format(eventDate, "d 'de' MMMM", { locale: pt })}</span>
                          <Clock className="w-4 h-4 ml-2" />
                          <span>{event.time}</span>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {event.description}
                      </p>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="line-clamp-1">{event.address}</span>
                      </div>
                      
                      <Button 
                        className="w-full group/btn"
                        variant="outline"
                      >
                        Ver Detalhes
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Quer organizar um evento connosco?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Entre em contacto com a nossa equipa para discutir parcerias 
            e oportunidades de co-organização de eventos.
          </p>
          <Button size="lg" className="group">
            <Users className="w-5 h-5 mr-2" />
            Fale Connosco
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Eventos;
