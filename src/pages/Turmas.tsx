import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import d1000Logo from '@/assets/d1000-logo.jpg';
import { 
  Users, 
  Calendar,
  Clock, 
  ChevronRight,
  GraduationCap,
  MessageSquare,
  Award,
  MapPin,
  Video,
  BookOpen,
  Loader2
} from 'lucide-react';

interface ClassGroup {
  id: string;
  title: string;
  description: string | null;
  schedule: string;
  format: string;
  price_aoa: number;
  spots: number;
  start_date: string | null;
  instructor: string | null;
  topics: string[] | null;
}

const MOCK_CLASS_GROUPS: ClassGroup[] = [
  {
    id: 'mock-1',
    title: 'Marketing Digital Intensivo',
    description: 'Turma completa de marketing digital com foco em estratégias práticas e resultados rápidos.',
    schedule: 'Terças e Quintas, 19h às 21h',
    format: 'Online',
    price_aoa: 149700,
    spots: 25,
    start_date: '2025-01-15',
    instructor: 'Equipe JU10',
    topics: ['SEO', 'Redes Sociais', 'Tráfego Pago', 'E-mail Marketing', 'Analytics']
  },
  {
    id: 'mock-2',
    title: 'Gestão de Tráfego Pago',
    description: 'Domine Meta Ads e Google Ads com aulas práticas e cases reais de sucesso.',
    schedule: 'Segundas e Quartas, 20h às 22h',
    format: 'Online',
    price_aoa: 99700,
    spots: 20,
    start_date: '2025-01-20',
    instructor: 'Equipe JU10',
    topics: ['Meta Ads', 'Google Ads', 'Remarketing', 'Conversões', 'Otimização']
  },
  {
    id: 'mock-3',
    title: 'Imersão em Branding',
    description: 'Aprenda a construir marcas memoráveis e estratégias de posicionamento de mercado.',
    schedule: 'Sábados, 9h às 13h',
    format: 'Híbrido',
    price_aoa: 79700,
    spots: 15,
    start_date: '2025-02-01',
    instructor: 'Equipe JU10',
    topics: ['Identidade Visual', 'Posicionamento', 'Storytelling', 'Brand Voice']
  },
  {
    id: 'mock-4',
    title: 'Copywriting para Vendas',
    description: 'Técnicas avançadas de escrita persuasiva para aumentar suas conversões.',
    schedule: 'Terças, 19h às 21h30',
    format: 'Online',
    price_aoa: 69700,
    spots: 30,
    start_date: '2025-02-10',
    instructor: 'Equipe JU10',
    topics: ['Headlines', 'Storytelling', 'CTAs', 'E-mails de Venda', 'Landing Pages']
  }
];

const ClassCard = ({ classGroup, enrollmentCount, delay }: { 
  classGroup: ClassGroup; 
  enrollmentCount: number;
  delay: string;
}) => {
  const navigate = useNavigate();
  const spotsLeft = classGroup.spots - enrollmentCount;
  const spotsPercentage = (enrollmentCount / classGroup.spots) * 100;
  const isAlmostFull = spotsLeft <= 5;
  const isMock = classGroup.id.startsWith('mock-');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleEnroll = () => {
    if (isMock) {
      // For mock data, show a toast or do nothing
      return;
    }
    navigate(`/turmas/${classGroup.id}/inscricao`);
  };

  return (
    <div 
      className="bg-card border border-border rounded-2xl overflow-hidden card-hover animate-fade-in"
      style={{ animationDelay: delay, animationFillMode: 'both' }}
    >
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
              classGroup.format === 'Online' 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : classGroup.format === 'Presencial'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
            }`}>
              {classGroup.format === 'Online' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
              {classGroup.format}
            </div>
            <h3 className="text-xl font-display font-bold">{classGroup.title}</h3>
          </div>
          {isAlmostFull && spotsLeft > 0 && (
            <span className="bg-destructive/10 text-destructive px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
              Últimas vagas!
            </span>
          )}
        </div>

        {/* Description */}
        {classGroup.description && (
          <p className="text-muted-foreground mb-6 line-clamp-2">
            {classGroup.description}
          </p>
        )}

        {/* Meta */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {classGroup.start_date && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 shrink-0" />
              <span className="truncate">{formatDate(classGroup.start_date)}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 shrink-0" />
            <span className="truncate">{classGroup.schedule}</span>
          </div>
          {classGroup.instructor && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground col-span-2">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Por {classGroup.instructor}</span>
            </div>
          )}
        </div>

        {/* Topics */}
        {classGroup.topics && classGroup.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {classGroup.topics.slice(0, 5).map((topic, index) => (
              <span 
                key={index}
                className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs"
              >
                {topic}
              </span>
            ))}
          </div>
        )}

        {/* Spots Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              <Users className="w-4 h-4 inline mr-1" />
              {spotsLeft} vagas restantes
            </span>
            <span className="font-medium">{enrollmentCount}/{classGroup.spots}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isAlmostFull ? 'bg-destructive' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(spotsPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Price & CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-border">
          <div>
            <div className="text-2xl font-bold text-primary">
              {formatPrice(classGroup.price_aoa)}
            </div>
            <div className="text-xs text-muted-foreground">
              ou 12x de {formatPrice(classGroup.price_aoa / 12)}
            </div>
          </div>
          <Button 
            variant="ju10" 
            className="rounded-xl w-full sm:w-auto"
            onClick={handleEnroll}
            disabled={spotsLeft <= 0}
          >
            {spotsLeft <= 0 ? 'Esgotado' : 'Inscrever-se'}
            {spotsLeft > 0 && <ChevronRight className="w-4 h-4 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

const Turmas = () => {
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [enrollmentCounts, setEnrollmentCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClassGroups = async () => {
      try {
        const { data, error } = await supabase
          .from('class_groups')
          .select('*')
          .order('start_date', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          setClassGroups(data);

          // Fetch enrollment counts for each class
          const counts: Record<string, number> = {};
          for (const cg of data) {
            const { count } = await supabase
              .from('class_enrollments')
              .select('*', { count: 'exact', head: true })
              .eq('class_group_id', cg.id)
              .eq('payment_status', 'paid');
            counts[cg.id] = count || 0;
          }
          setEnrollmentCounts(counts);
        } else {
          // Use mock data if no real data exists
          setClassGroups(MOCK_CLASS_GROUPS);
          const mockCounts: Record<string, number> = {};
          MOCK_CLASS_GROUPS.forEach((cg, i) => {
            mockCounts[cg.id] = Math.floor(cg.spots * (0.5 + Math.random() * 0.3));
          });
          setEnrollmentCounts(mockCounts);
        }
      } catch (error) {
        console.error('Error fetching class groups:', error);
        setClassGroups(MOCK_CLASS_GROUPS);
      } finally {
        setLoading(false);
      }
    };

    fetchClassGroups();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Turmas | D1000 - Do Zero ao Topo"
        description="Participe de turmas exclusivas com aulas ao vivo, networking qualificado e certificado de conclusão. Formações D1000."
        keywords="turmas, aulas ao vivo, formações, D1000, marketing digital, liderança, JU10"
      />
      
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 md:pt-40 pb-16 px-4 md:px-8 bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 animate-fade-in">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Turmas</span>
          </div>
          
          <div className="max-w-3xl">
            {/* D1000 Branding */}
            <div 
              className="flex items-center gap-4 mb-8 animate-fade-in"
              style={{ animationDelay: '0.05s', animationFillMode: 'both' }}
            >
              <img 
                src={d1000Logo} 
                alt="D1000 - Do Zero ao Topo" 
                className="h-16 w-auto rounded-lg shadow-lg"
              />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Powered by</p>
                <p className="text-lg font-bold text-foreground">D1000 Formações</p>
              </div>
            </div>
            
            <div 
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-fade-in"
              style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
            >
              <GraduationCap className="w-4 h-4" />
              Próximas Turmas
            </div>
            
            <h1 
              className="text-4xl md:text-5xl font-display font-bold mb-6 animate-fade-in"
              style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
            >
              Turmas <span className="text-gradient-ju10">Exclusivas</span>
            </h1>
            
            <p 
              className="text-lg text-muted-foreground animate-fade-in"
              style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
            >
              Do zero ao topo. Aulas ao vivo em grupos pequenos, com conteúdo prático, 
              networking qualificado e acompanhamento de perto. Pagamento via Multicaixa Express.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 px-4 md:px-8 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Video, label: 'Aulas ao vivo' },
              { icon: Users, label: 'Turmas pequenas' },
              { icon: MessageSquare, label: 'Interação direta' },
              { icon: Award, label: 'Certificado' }
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

      {/* Classes Grid */}
      <section className="py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {classGroups.map((classGroup, index) => (
                <ClassCard 
                  key={classGroup.id} 
                  classGroup={classGroup}
                  enrollmentCount={enrollmentCounts[classGroup.id] || 0}
                  delay={`${0.1 + index * 0.1}s`} 
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 md:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold mb-4">
            Não encontrou uma turma ideal?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Entre em contato e seja avisado quando novas turmas abrirem.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="ju10" size="lg" className="rounded-xl">
              Receber Avisos
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            <Button asChild variant="ju10-outline" size="lg" className="rounded-xl">
              <Link to="/formacoes">
                Ver Formações Online
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Turmas;