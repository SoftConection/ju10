import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  Lightbulb, 
  GraduationCap, 
  Users, 
  Briefcase,
  Target,
  TrendingUp,
  Award,
  ChevronRight
} from 'lucide-react';

const ServiceCard = ({ 
  icon: Icon, 
  title, 
  description, 
  link,
  delay 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  link: string;
  delay: string;
}) => (
  <Link 
    to={link}
    className="group relative bg-card border border-border rounded-2xl p-8 card-hover animate-fade-in"
    style={{ animationDelay: delay, animationFillMode: 'both' }}
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-tr-2xl rounded-bl-full" />
    <div className="relative">
      <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
        <Icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
      </div>
      <h3 className="text-xl font-display font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
        {title}
      </h3>
      <p className="text-muted-foreground mb-4 leading-relaxed">
        {description}
      </p>
      <span className="inline-flex items-center text-primary font-semibold text-sm uppercase tracking-wide group-hover:gap-3 transition-all duration-300">
        Saiba mais <ChevronRight className="w-4 h-4 ml-1" />
      </span>
    </div>
  </Link>
);

const StatCard = ({ value, label, delay }: { value: string; label: string; delay: string }) => (
  <div 
    className="text-center animate-fade-in"
    style={{ animationDelay: delay, animationFillMode: 'both' }}
  >
    <div className="text-4xl md:text-5xl font-display font-bold text-primary mb-2">{value}</div>
    <div className="text-muted-foreground font-medium">{label}</div>
  </div>
);

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="JU10 - Juventude 10 | Marketing Estratégico & Educação"
        description="Agência estratégica de marketing digital e tradicional. Mentorias, cursos, turmas e planos empresariais para impulsionar seu negócio."
        keywords="marketing digital, marketing estratégico, mentorias, cursos de marketing, consultoria empresarial, JU10"
      />
      
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 md:pt-40 lg:pt-48 pb-20 md:pb-32 px-4 md:px-8 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-2xl" />
        
        <div className="max-w-6xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div 
                className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-fade-in"
                style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
              >
                <Award className="w-4 h-4" />
                Agência Estratégica de Marketing
              </div>
              
              <h1 
                className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6 animate-fade-in"
                style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
              >
                Transforme sua{' '}
                <span className="text-gradient-ju10">estratégia</span>{' '}
                em resultados
              </h1>
              
              <p 
                className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed animate-fade-in"
                style={{ animationDelay: '0.4s', animationFillMode: 'both' }}
              >
                Somos especialistas em marketing digital e tradicional. Oferecemos mentorias, 
                cursos, turmas exclusivas e planos de acompanhamento para empresas que querem 
                alcançar o próximo nível.
              </p>
              
              <div 
                className="flex flex-col sm:flex-row gap-4 animate-fade-in"
                style={{ animationDelay: '0.5s', animationFillMode: 'both' }}
              >
                <Button asChild variant="ju10" size="lg" className="rounded-xl">
                  <Link to="/cursos">
                    Explorar Cursos
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="ju10-outline" size="lg" className="rounded-xl">
                  <Link to="/mentorias">
                    Conhecer Mentorias
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Hero visual */}
            <div 
              className="relative animate-fade-in hidden lg:block"
              style={{ animationDelay: '0.6s', animationFillMode: 'both' }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl blur-2xl transform rotate-6" />
                <div className="relative bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 text-primary-foreground">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-background/10 backdrop-blur rounded-2xl p-6">
                      <TrendingUp className="w-8 h-8 mb-3" />
                      <div className="text-2xl font-bold">+340%</div>
                      <div className="text-sm opacity-80">Crescimento médio</div>
                    </div>
                    <div className="bg-background/10 backdrop-blur rounded-2xl p-6">
                      <Target className="w-8 h-8 mb-3" />
                      <div className="text-2xl font-bold">98%</div>
                      <div className="text-sm opacity-80">Satisfação</div>
                    </div>
                    <div className="bg-background/10 backdrop-blur rounded-2xl p-6 col-span-2">
                      <Users className="w-8 h-8 mb-3" />
                      <div className="text-2xl font-bold">500+ Alunos</div>
                      <div className="text-sm opacity-80">Formados em marketing estratégico</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30 border-y border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard value="500+" label="Alunos formados" delay="0.1s" />
            <StatCard value="50+" label="Empresas atendidas" delay="0.2s" />
            <StatCard value="15+" label="Cursos disponíveis" delay="0.3s" />
            <StatCard value="98%" label="Taxa de satisfação" delay="0.4s" />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 md:py-32 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 
              className="text-3xl md:text-4xl font-display font-bold mb-4 animate-fade-in"
              style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
            >
              Nossos Serviços
            </h2>
            <p 
              className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in"
              style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
            >
              Soluções completas em marketing e educação para impulsionar seu crescimento profissional e empresarial
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ServiceCard 
              icon={GraduationCap}
              title="Cursos"
              description="Aprenda marketing digital e tradicional com profissionais experientes do mercado."
              link="/cursos"
              delay="0.3s"
            />
            <ServiceCard 
              icon={Users}
              title="Mentorias"
              description="Acompanhamento personalizado para acelerar sua carreira ou negócio."
              link="/mentorias"
              delay="0.4s"
            />
            <ServiceCard 
              icon={Lightbulb}
              title="Turmas"
              description="Turmas exclusivas com conteúdo avançado e networking qualificado."
              link="/turmas"
              delay="0.5s"
            />
            <ServiceCard 
              icon={Briefcase}
              title="Empresas"
              description="Planos de acompanhamento estratégico para empresas de todos os portes."
              link="/empresas"
              delay="0.6s"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 px-4 md:px-8 bg-foreground text-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 
            className="text-3xl md:text-4xl font-display font-bold mb-6 animate-fade-in"
            style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
          >
            Pronto para transformar sua estratégia?
          </h2>
          <p 
            className="text-lg text-background/70 mb-8 max-w-2xl mx-auto animate-fade-in"
            style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
          >
            Junte-se a centenas de profissionais e empresas que já transformaram seus resultados com a JU10.
          </p>
          <div 
            className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in"
            style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
          >
            <Button asChild variant="ju10" size="lg" className="rounded-xl">
              <Link to="/cursos">
                Começar Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="rounded-xl border-background/30 text-background hover:bg-background/10 hover:text-background"
            >
              <Link to="/empresas">
                Falar com Consultor
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="text-2xl font-display font-bold text-primary mb-2">JU10</div>
              <p className="text-muted-foreground text-sm">
                Juventude 10 - Marketing Estratégico & Educação
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link to="/cursos" className="link-ju10">Cursos</Link>
              <Link to="/mentorias" className="link-ju10">Mentorias</Link>
              <Link to="/turmas" className="link-ju10">Turmas</Link>
              <Link to="/empresas" className="link-ju10">Empresas</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} JU10 - Juventude 10. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
