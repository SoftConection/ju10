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
  Globe,
  Building2,
  Users,
  Award,
  ChevronRight,
  Loader2,
  ExternalLink,
  MapPin,
  GraduationCap,
  TrendingUp,
  Handshake,
  CheckCircle2,
  Mail
} from 'lucide-react';

interface Institution {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  website: string;
  description: string;
  country: string;
  is_active: boolean;
}

const InstitutionCard = ({ institution }: { institution: Institution }) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 card-hover group">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
          {institution.logo_url ? (
            <img 
              src={institution.logo_url} 
              alt={institution.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Building2 className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
            {institution.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            {institution.country}
          </div>
        </div>
        <Badge variant="secondary" className="text-xs">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Parceiro
        </Badge>
      </div>

      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
        {institution.description || 'Instituição parceira da D1000 Formações.'}
      </p>

      {institution.website && (
        <Button asChild variant="outline" size="sm" className="w-full rounded-xl">
          <a href={institution.website} target="_blank" rel="noopener noreferrer">
            <Globe className="w-4 h-4 mr-2" />
            Visitar Website
            <ExternalLink className="w-3 h-3 ml-auto" />
          </a>
        </Button>
      )}
    </div>
  );
};

const Partners = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      const { data, error } = await supabase
        .from('partner_institutions')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setInstitutions(data || []);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: GraduationCap,
      title: 'Acesso a Formações',
      description: 'Ofereça as formações D1000 para seus alunos e colaboradores com preços especiais.',
    },
    {
      icon: TrendingUp,
      title: 'Comissões Atrativas',
      description: 'Ganhe comissões por cada aluno indicado que se inscrever nas nossas formações.',
    },
    {
      icon: Award,
      title: 'Certificação Conjunta',
      description: 'Emita certificados com a marca da sua instituição em parceria com a D1000.',
    },
    {
      icon: Users,
      title: 'Suporte Dedicado',
      description: 'Tenha um gestor de conta dedicado para sua instituição.',
    },
    {
      icon: Handshake,
      title: 'Co-branding',
      description: 'Material de marketing personalizado com a identidade da sua instituição.',
    },
    {
      icon: Globe,
      title: 'Alcance Global',
      description: 'Faça parte de uma rede internacional de instituições de ensino.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Parceiros Institucionais | D1000 - Rede Global de Educação"
        description="Junte-se à rede global de instituições parceiras da D1000. Ofereça formações de qualidade e ganhe comissões por indicações."
        keywords="parceiros, instituições, afiliados, D1000, formações, educação, universidades"
      />
      
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-16 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-orange-50/20 dark:to-orange-950/10" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Parceiros</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={d1000Logo} 
                  alt="D1000" 
                  className="h-14 w-14 rounded-xl shadow-lg"
                />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">D1000 Network</p>
                  <h1 className="text-3xl md:text-4xl font-black">
                    Parceiros <span className="text-gradient-ju10">Institucionais</span>
                  </h1>
                </div>
              </div>

              <p className="text-lg text-muted-foreground mb-8 max-w-xl">
                Faça parte da maior rede de formação profissional de Angola. Conecte sua instituição à D1000 e ofereça formações de qualidade internacional aos seus alunos.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button asChild variant="ju10" size="lg" className="rounded-xl shadow-xl shadow-primary/25">
                  <a href="mailto:parceiros@d1000.ao">
                    <Handshake className="w-5 h-5 mr-2" />
                    Tornar-se Parceiro
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-xl">
                  <Link to="/empresas">
                    <Building2 className="w-5 h-5 mr-2" />
                    Planos Empresariais
                  </Link>
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: institutions.length || '10+', label: 'Instituições Parceiras' },
                { value: '5+', label: 'Países' },
                { value: '1000+', label: 'Alunos Beneficiados' },
                { value: '10%', label: 'Comissão Média' },
              ].map((stat, i) => (
                <div 
                  key={stat.label}
                  className="bg-card border border-border rounded-2xl p-6 text-center"
                >
                  <div className="text-3xl font-black text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 md:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Vantagens de ser <span className="text-gradient-ju10">Parceiro</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Descubra os benefícios exclusivos para instituições parceiras da D1000.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <div 
                key={benefit.title}
                className="bg-card border border-border rounded-2xl p-6 card-hover"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Nossos <span className="text-gradient-ju10">Parceiros</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Instituições de ensino que confiam na D1000 para formação dos seus alunos.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : institutions.length === 0 ? (
            <div className="text-center py-16 bg-muted/30 rounded-3xl">
              <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Seja o primeiro parceiro!</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Estamos a expandir a nossa rede de parceiros. Entre em contacto para fazer parte desta comunidade.
              </p>
              <Button asChild variant="ju10">
                <a href="mailto:parceiros@d1000.ao">
                  <Mail className="w-4 h-4 mr-2" />
                  Contactar
                </a>
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {institutions.map((institution) => (
                <InstitutionCard key={institution.id} institution={institution} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 md:px-8 bg-gradient-to-br from-primary/10 via-background to-orange-50/20 dark:to-orange-950/10">
        <div className="max-w-4xl mx-auto text-center">
          <Handshake className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Pronto para fazer <span className="text-gradient-ju10">Parceria</span>?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Junte-se à rede D1000 e transforme a educação na sua instituição. Oferecemos suporte completo para uma parceria de sucesso.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild variant="ju10" size="lg" className="rounded-xl shadow-xl shadow-primary/30">
              <a href="mailto:parceiros@d1000.ao">
                <Mail className="w-5 h-5 mr-2" />
                Contactar Equipa de Parcerias
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Partners;
