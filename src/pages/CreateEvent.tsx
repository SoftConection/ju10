import { useState, useRef, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useGooglePlacesAutocomplete } from '@/hooks/useGooglePlacesAutocomplete';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { AuthSheet } from '@/components/AuthSheet';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { z } from 'zod';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Image as ImageIcon, 
  FileText,
  Loader2,
  ArrowLeft,
  Upload,
  ChevronRight
} from 'lucide-react';

const eventSchema = z.object({
  eventName: z.string().trim().min(1, 'Nome do evento é obrigatório').max(200, 'Nome deve ter menos de 200 caracteres'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora de início inválida (ex: 15:00)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora de fim inválida (ex: 16:00)'),
  location: z.string().trim().min(1, 'Local é obrigatório').max(300, 'Local deve ter menos de 300 caracteres'),
  description: z.string().trim().min(1, 'Descrição é obrigatória').max(2000, 'Descrição deve ter menos de 2000 caracteres'),
});

const CreateEvent = () => {
  const [eventName, setEventName] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const locationInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { onPlaceSelected } = useGooglePlacesAutocomplete(locationInputRef);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (!session?.user) {
        setShowAuthModal(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        setShowAuthModal(false);
      } else {
        setShowAuthModal(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    onPlaceSelected((place) => {
      const address = place.formatted_address || place.name || '';
      setLocation(address);
    });
  }, [onPlaceSelected]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Por favor, carregue uma imagem JPG, PNG, GIF ou WebP');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 5MB');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!startDate) {
      toast.error('Selecione uma data de início');
      return;
    }
    if (!endDate) {
      toast.error('Selecione uma data de fim');
      return;
    }
    if (!imageFile) {
      toast.error('Adicione uma imagem para o evento');
      return;
    }

    const validationResult = eventSchema.safeParse({
      eventName,
      startTime,
      endTime,
      location,
      description,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    const startDateTime = new Date(startDate);
    const [startHours, startMinutes] = startTime.split(':');
    startDateTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);

    const endDateTime = new Date(endDate);
    const [endHours, endMinutes] = endTime.split(':');
    endDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

    if (endDateTime <= startDateTime) {
      toast.error('A data/hora de fim deve ser depois da de início');
      return;
    }

    setIsSubmitting(true);

    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      const targetDate = new Date(startDate);
      const [hours, minutes] = startTime.split(':');
      targetDate.setHours(parseInt(hours) || 0, parseInt(minutes) || 0);

      const dateStr = format(startDate, "d 'de' MMMM, yyyy", { locale: pt });
      const timeStr = `${startTime} - ${endTime}`;

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .single();

      const creatorName = profile?.display_name || user.email?.split('@')[0] || 'Anónimo';

      const { error: insertError } = await supabase
        .from('events')
        .insert({
          title: eventName,
          description: description,
          date: dateStr,
          time: timeStr,
          address: location,
          background_image_url: publicUrl,
          target_date: targetDate.toISOString(),
          creator: creatorName,
        });

      if (insertError) throw insertError;

      toast.success('Evento criado com sucesso!');
      navigate('/my-events');
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error creating event:', error);
      toast.error('Erro ao criar evento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead 
        title="Criar Evento | JU10"
        description="Crie e publique um novo evento para a comunidade JU10"
      />
      <AuthSheet isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        {user ? (
          <main className="pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <Button
                  variant="ghost"
                  onClick={() => navigate(-1)}
                  className="mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <span>Eventos</span>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-foreground">Criar Novo</span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-display font-bold">
                  Criar <span className="text-gradient-ju10">Evento</span>
                </h1>
                <p className="text-muted-foreground mt-2">
                  Preencha as informações do seu evento para publicar na plataforma.
                </p>
              </div>

              <div className="grid lg:grid-cols-5 gap-8">
                {/* Image Upload */}
                <div className="lg:col-span-2">
                  <Card className="sticky top-24">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <ImageIcon className="w-5 h-5 text-primary" />
                        Imagem do Evento
                      </CardTitle>
                      <CardDescription>
                        Carregue uma imagem de capa (máx. 5MB)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                          "aspect-[4/3] rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300",
                          "flex items-center justify-center overflow-hidden",
                          imagePreview 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-primary hover:bg-primary/5"
                        )}
                      >
                        {imagePreview ? (
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="text-center p-6">
                            <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                            <p className="text-sm font-medium">Clique para carregar</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              JPG, PNG, GIF ou WebP
                            </p>
                          </div>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </div>
                      
                      {imagePreview && (
                        <Button
                          variant="outline"
                          className="w-full mt-4"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Alterar Imagem
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Form */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Event Name */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <FileText className="w-5 h-5 text-primary" />
                        Informações Básicas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="eventName">Nome do Evento *</Label>
                        <Input
                          id="eventName"
                          placeholder="Ex: Workshop de Marketing Digital"
                          value={eventName}
                          onChange={(e) => setEventName(e.target.value)}
                          className="mt-1.5"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Descrição *</Label>
                        <Textarea
                          id="description"
                          placeholder="Descreva o seu evento..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={5}
                          className="mt-1.5 resize-none"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Date & Time */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <CalendarIcon className="w-5 h-5 text-primary" />
                        Data e Hora
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Start */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Data de Início *</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal mt-1.5",
                                  !startDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startDate ? format(startDate, "dd/MM/yyyy") : "Selecionar"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={setStartDate}
                                initialFocus
                                locale={pt}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <Label htmlFor="startTime">Hora de Início *</Label>
                          <div className="relative mt-1.5">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="startTime"
                              placeholder="15:00"
                              value={startTime}
                              onChange={(e) => setStartTime(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </div>

                      {/* End */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Data de Fim *</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal mt-1.5",
                                  !endDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {endDate ? format(endDate, "dd/MM/yyyy") : "Selecionar"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={setEndDate}
                                initialFocus
                                locale={pt}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <Label htmlFor="endTime">Hora de Fim *</Label>
                          <div className="relative mt-1.5">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="endTime"
                              placeholder="18:00"
                              value={endTime}
                              onChange={(e) => setEndTime(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Location */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <MapPin className="w-5 h-5 text-primary" />
                        Localização
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Label htmlFor="location">Local do Evento *</Label>
                      <div className="relative mt-1.5">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          ref={locationInputRef}
                          id="location"
                          placeholder="Ex: Centro de Convenções, Luanda"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Submit */}
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full h-14 text-base"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        A criar evento...
                      </>
                    ) : (
                      <>
                        Criar Evento
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </main>
        ) : null}
      </div>
    </>
  );
};

export default CreateEvent;