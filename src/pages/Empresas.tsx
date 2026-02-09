import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  TrendingUp,
  Target, 
  ChevronRight,
  CheckCircle2,
  Users,
  BarChart3,
  Lightbulb,
  Rocket,
  Shield,
  Clock,
  Headphones
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: string;
  priceNote: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Para empresas que estão começando no marketing digital.',
    price: 'Kz 100.997.50',
    priceNote: '/mês',
    features: [
      'Diagnóstico inicial completo',
      'Plano de marketing mensal',
      '2 reuniões estratégicas/mês',
      'Relatórios de performance',
      'Suporte por e-mail',
      'Acesso a materiais exclusivos'
    ],
    cta: 'Começar Agora'
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'Para empresas em crescimento que precisam escalar.',
    price: 'Kz 200.970.00',
    priceNote: '/mês',
    features: [
      'Tudo do plano Starter',
      'Gestão de campanhas pagas',
      '4 reuniões estratégicas/mês',
      'Consultoria de conteúdo',
      'Análise de concorrência',
      'Suporte prioritário',
      'Treinamento da equipe'
    ],
    highlighted: true,
    cta: 'Escolher Growth'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Solução completa para grandes operações.',
    price: 'Sob consulta',
    priceNote: '',
    features: [
      'Tudo do plano Growth',
      'Equipe dedicada',
      'Reuniões semanais',
      'Gestão completa de marketing',
      'Integrações customizadas',
      'SLA garantido',
      'Account Manager dedicado',
      'Workshops exclusivos'
    ],
    cta: 'Falar com Consultor'
  }
];

const BENEFITS = [
  {
    icon: Target,
    title: 'Estratégia Personalizada',
    description: 'Planos adaptados às necessidades específicas do seu negócio.'
  },
  {
    icon: TrendingUp,
    title: 'Resultados Mensuráveis',
    description: 'Métricas claras e relatórios detalhados de performance.'
  },
  {
    icon: Users,
    title: 'Equipe Especializada',
    description: 'Profissionais experientes dedicados ao seu sucesso.'
  },
  {
    icon: Rocket,
    title: 'Crescimento Acelerado',
    description: 'Metodologias comprovadas para escalar seu negócio.'
  },
  {
    icon: Shield,
    title: 'Segurança e Confiança',
    description: 'Processos transparentes e comunicação constante.'
  },
  {
    icon: Headphones,
    title: 'Suporte Dedicado',
    description: 'Atendimento ágil e personalizado sempre que precisar.'
  }
];

const PlanCard = ({ plan, delay }: { plan: Plan; delay: string }) => (
  <div 
    className={`relative bg-card border rounded-2xl overflow-hidden card-hover animate-fade-in ${
      plan.highlighted ? 'border-primary' : 'border-border'
    }`}
    style={{ animationDelay: delay, animationFillMode: 'both' }}
  >
    {plan.highlighted && (
      <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-2 text-sm font-semibold">
        Mais Popular
      </div>
    )}
    
    <div className={`p-8 ${plan.highlighted ? 'pt-14' : ''}`}>
      <h3 className="text-2xl font-display font-bold mb-2">{plan.name}</h3>
      <p className="text-muted-foreground mb-6">{plan.description}</p>
      
      <div className="mb-8">
        <span className="text-4xl font-bold text-primary">{plan.price}</span>
        <span className="text-muted-foreground">{plan.priceNote}</span>
      </div>
      
      <div className="space-y-3 mb-8">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-sm">{feature}</span>
          </div>
        ))}
      </div>
      
      <Button 
        variant={plan.highlighted ? 'ju10' : 'ju10-outline'} 
        className="w-full rounded-xl"
      >
        {plan.cta}
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  </div>
);

const Empresas = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Soluções para Empresas | JU10 - Juventude 10"
        description="Planos de acompanhamento estratégico em marketing para empresas. Consultoria, gestão e treinamento personalizados."
        keywords="consultoria marketing empresas, planos marketing empresarial, gestão de marketing, estratégia empresarial, JU10"
      />
      
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 md:pt-40 pb-16 px-4 md:px-8 bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 animate-fade-in">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Empresas</span>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div 
                className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-fade-in"
                style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
              >
                <Building2 className="w-4 h-4" />
                Soluções Empresariais
              </div>
              
              <h1 
                className="text-4xl md:text-5xl font-display font-bold mb-6 animate-fade-in"
                style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
              >
                Planos para <span className="text-gradient-ju10">Empresas</span>
              </h1>
              
              <p 
                className="text-lg text-muted-foreground mb-8 animate-fade-in"
                style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
              >
                Acompanhamento estratégico completo para empresas que querem 
                dominar o marketing e acelerar seu crescimento no mercado.
              </p>
              
              <div 
                className="flex flex-col sm:flex-row gap-4 animate-fade-in"
                style={{ animationDelay: '0.4s', animationFillMode: 'both' }}
              >
                <Button variant="ju10" size="lg" className="rounded-xl">
                  Ver Planos
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
                <Button variant="ju10-outline" size="lg" className="rounded-xl">
                  Agendar Diagnóstico
                </Button>
              </div>
            </div>
            
            {/* Stats */}
            <div 
              className="grid grid-cols-2 gap-6 animate-fade-in"
              style={{ animationDelay: '0.5s', animationFillMode: 'both' }}
            >
              {[
                { value: '50+', label: 'Empresas atendidas' },
                { value: '340%', label: 'Crescimento médio' },
                { value: '98%', label: 'Taxa de renovação' },
                { value: '24h', label: 'Tempo de resposta' }
              ].map((stat, index) => (
                <div 
                  key={index}
                  className="bg-card border border-border rounded-2xl p-6 text-center"
                >
                  <div className="text-3xl md:text-4xl font-display font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Por que escolher a JU10?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Combinamos estratégia, tecnologia e experiência para entregar resultados reais
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BENEFITS.map((benefit, index) => (
              <div 
                key={index}
                className="bg-card border border-border rounded-2xl p-6 card-hover animate-fade-in"
                style={{ animationDelay: `${0.1 + index * 0.1}s`, animationFillMode: 'both' }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Nossos Planos
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano ideal para o momento da sua empresa
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {PLANS.map((plan, index) => (
              <PlanCard 
                key={plan.id} 
                plan={plan} 
                delay={`${0.1 + index * 0.15}s`} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Como Trabalhamos
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Um processo estruturado para garantir os melhores resultados
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { 
                step: '01', 
                icon: Lightbulb,
                title: 'Diagnóstico', 
                description: 'Análise completa do seu negócio, mercado e concorrência' 
              },
              { 
                step: '02', 
                icon: Target,
                title: 'Estratégia', 
                description: 'Desenvolvimento do plano de ação personalizado' 
              },
              { 
                step: '03', 
                icon: Rocket,
                title: 'Execução', 
                description: 'Implementação das ações com acompanhamento contínuo' 
              },
              { 
                step: '04', 
                icon: BarChart3,
                title: 'Otimização', 
                description: 'Análise de resultados e ajustes para melhor performance' 
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${0.1 + index * 0.1}s`, animationFillMode: 'both' }}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-sm font-bold text-primary mb-2">{item.step}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 md:px-8 bg-foreground text-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
            Pronto para transformar seu marketing?
          </h2>
          <p className="text-lg text-background/70 mb-8">
            Agende um diagnóstico gratuito e descubra como podemos ajudar sua empresa a crescer.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="ju10" size="lg" className="rounded-xl">
              Agendar Diagnóstico Gratuito
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-xl border-background/30 text-background hover:bg-background/10 hover:text-background"
            >
              Falar no WhatsApp
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Empresas;
