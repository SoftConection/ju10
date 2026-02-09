import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CourseEnrollmentModal } from '@/components/CourseEnrollmentModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import d1000Logo from '@/assets/d1000-logo.jpg';
import { 
  Clock, 
  Users, 
  Star, 
  ChevronRight,
  Play,
  GraduationCap,
  BookOpen,
  Award,
  Filter,
  Loader2,
  CheckCircle2,
  TrendingUp,
  Globe,
  Video,
  FileText,
  Trophy,
  Zap,
  Target,
  Briefcase,
  Mic,
  BarChart3,
  Search,
  X
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  duration_hours: number;
  level: string;
  category: string;
  image_url: string;
  price_aoa: number;
  modules: number;
}

interface CourseCardData extends Course {
  students: number;
  rating: number;
  lessons?: number;
}

// D1000 Categories with icons
const D1000_CATEGORIES = [
  { name: 'Todos', icon: Globe, count: 0 },
  { name: 'Liderança', icon: Trophy, count: 0 },
  { name: 'Marketing & Branding', icon: TrendingUp, count: 0 },
  { name: 'Vendas', icon: Target, count: 0 },
  { name: 'Comunicação & Oratória', icon: Mic, count: 0 },
  { name: 'Produtividade', icon: Zap, count: 0 },
  { name: 'Negócios', icon: Briefcase, count: 0 },
  { name: 'Analytics', icon: BarChart3, count: 0 },
];

const LEVELS = [
  { name: 'Todos', color: 'bg-muted text-muted-foreground' },
  { name: 'Iniciante', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  { name: 'Intermediário', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  { name: 'Avançado', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
];

// Premium Course Card
const CourseCard = ({ 
  course, 
  delay,
  onEnroll,
  isEnrolled,
  hasConfirmedPayment
}: { 
  course: CourseCardData; 
  delay: string;
  onEnroll: () => void;
  isEnrolled: boolean;
  hasConfirmedPayment: boolean;
}) => {
  const navigate = useNavigate();
  
  const getLevelColor = (level: string) => {
    const levelData = LEVELS.find(l => l.name === level);
    return levelData?.color || 'bg-muted text-muted-foreground';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleClick = () => {
    if (hasConfirmedPayment) {
      navigate(`/curso/${course.id}`);
    } else {
      onEnroll();
    }
  };

  return (
    <div 
      className="group bg-card border border-border rounded-2xl overflow-hidden card-hover animate-fade-in relative"
      style={{ animationDelay: delay, animationFillMode: 'both' }}
    >
      {/* Featured Badge */}
      {course.rating >= 4.8 && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-gradient-to-r from-primary to-orange-400 text-white border-0 shadow-lg">
            <Star className="w-3 h-3 mr-1 fill-white" />
            Destaque
          </Badge>
        </div>
      )}
      
      {/* Image */}
      <div className="relative overflow-hidden aspect-[16/10]">
        <img 
          src={course.image_url} 
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-500 shadow-2xl shadow-primary/50">
            <Play className="w-8 h-8 text-white ml-1" />
          </div>
        </div>

        {/* Level Badge */}
        <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold ${getLevelColor(course.level)} shadow-lg`}>
          {course.level}
        </div>
        
        {/* Enrolled Badge */}
        {hasConfirmedPayment && (
          <div className="absolute bottom-4 left-4 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Inscrito
          </div>
        )}

        {/* Bottom Gradient Info */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-center gap-4 text-white/90 text-sm">
            <div className="flex items-center gap-1.5">
              <Video className="w-4 h-4" />
              {course.modules} módulos
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {course.duration_hours}h
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {course.students}
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-primary uppercase tracking-widest">
            {course.category}
          </span>
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="w-3.5 h-3.5 fill-yellow-500" />
            <span className="text-xs font-semibold text-foreground">{course.rating}</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
          {course.title}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-5 line-clamp-2 leading-relaxed">
          {course.description}
        </p>
        
        {/* Footer */}
        <div className="flex items-end justify-between pt-4 border-t border-border">
          <div>
            <div className="text-2xl font-black text-primary tracking-tight">
              {formatPrice(course.price_aoa)}
            </div>
            <div className="text-xs text-muted-foreground">
              ou 12x de {formatPrice(Math.ceil(course.price_aoa / 12))}
            </div>
          </div>
          <Button 
            variant="ju10" 
            size="sm" 
            className="rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            onClick={handleClick}
          >
            {hasConfirmedPayment ? (
              <>
                <Play className="w-4 h-4 mr-1.5" />
                Aceder
              </>
            ) : isEnrolled ? (
              <>
                <Clock className="w-4 h-4 mr-1.5" />
                Pendente
              </>
            ) : (
              <>
                Inscrever-se
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Stats Section Component
const StatsSection = ({ totalCourses, totalStudents, totalHours }: { 
  totalCourses: number; 
  totalStudents: number; 
  totalHours: number;
}) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 py-8">
    {[
      { value: totalCourses, label: 'Formações', icon: BookOpen },
      { value: totalStudents.toLocaleString()+'+', label: 'Alunos', icon: Users },
      { value: totalHours+'h+', label: 'Conteúdo', icon: Video },
      { value: '100%', label: 'Online', icon: Globe },
    ].map((stat, i) => (
      <div 
        key={stat.label} 
        className="text-center p-4 rounded-2xl bg-card border border-border animate-fade-in"
        style={{ animationDelay: `${0.1 + i * 0.1}s`, animationFillMode: 'both' }}
      >
        <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
        <div className="text-2xl md:text-3xl font-black text-foreground">{stat.value}</div>
        <div className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
      </div>
    ))}
  </div>
);

const Cursos = () => {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedLevel, setSelectedLevel] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<CourseCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<Map<string, { status: string }>>(new Map());
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
    fetchCourses();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserEnrollments();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at');

      if (error) throw error;

      if (data && data.length > 0) {
        const transformed = data.map((c, index) => ({
          id: c.id,
          title: c.title,
          description: c.description || '',
          duration_hours: c.duration_hours || 20,
          level: c.level || 'Iniciante',
          category: c.category || 'Marketing & Branding',
          image_url: c.image_url || `https://images.unsplash.com/photo-146092589791${index}-afdab827c52f?w=800&h=600&fit=crop`,
          price_aoa: c.price_aoa,
          modules: c.modules || 8,
          students: Math.floor(Math.random() * 200) + 100,
          rating: parseFloat((4.5 + Math.random() * 0.5).toFixed(1)),
        }));
        setCourses(transformed as CourseCardData[]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEnrollments = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('course_enrollments')
        .select('course_id, payment_status')
        .eq('user_id', user.id);

      if (data) {
        const enrollmentMap = new Map(
          data.map(e => [e.course_id, { status: e.payment_status }])
        );
        setEnrollments(enrollmentMap);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  const handleEnroll = (course: CourseCardData) => {
    if (!user) {
      toast({
        title: 'Autenticação necessária',
        description: 'Faça login para se inscrever na formação.',
      });
      return;
    }

    const enrollment = enrollments.get(course.id);
    if (enrollment?.status === 'confirmed') {
      navigate(`/curso/${course.id}`);
      return;
    }

    if (enrollment) {
      toast({
        title: 'Inscrição pendente',
        description: 'Sua inscrição está aguardando confirmação de pagamento.',
      });
      return;
    }

    setSelectedCourse({
      id: course.id,
      title: course.title,
      price_aoa: course.price_aoa,
      duration_hours: course.duration_hours,
      modules: course.modules,
    });
    setIsModalOpen(true);
  };

  const filteredCourses = courses.filter(course => {
    const categoryMatch = selectedCategory === 'Todos' || course.category === selectedCategory;
    const levelMatch = selectedLevel === 'Todos' || course.level === selectedLevel;
    const searchMatch = searchQuery === '' || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && levelMatch && searchMatch;
  });

  // Calculate stats
  const totalStudents = courses.reduce((acc, c) => acc + c.students, 0);
  const totalHours = courses.reduce((acc, c) => acc + c.duration_hours, 0);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Formações D1000 | Do Zero ao Topo - Cursos Online Profissionais"
        description="Formações profissionais em liderança, marketing, vendas, comunicação e produtividade. Aprende. Aplica. Lucre. Certificado incluído."
        keywords="formações online, D1000, cursos profissionais, liderança, marketing digital, vendas, comunicação, produtividade, JU10, certificado"
      />
      
      <Navbar />
      
      {/* Hero Section - Premium D1000 Design */}
      <section className="pt-28 md:pt-36 pb-8 px-4 md:px-8 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-orange-50/30 dark:to-orange-950/10" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent opacity-50" />
        
        <div className="max-w-7xl mx-auto relative">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 animate-fade-in">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">Formações</span>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="max-w-xl">
              {/* D1000 Branding */}
              <div 
                className="inline-flex items-center gap-4 mb-8 p-3 pr-6 bg-card border border-border rounded-2xl shadow-lg animate-fade-in"
                style={{ animationDelay: '0.05s', animationFillMode: 'both' }}
              >
                <img 
                  src={d1000Logo} 
                  alt="D1000 - Do Zero ao Topo" 
                  className="h-14 w-14 rounded-xl shadow-md object-cover"
                />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium">Powered by</p>
                  <p className="text-lg font-black text-foreground tracking-tight">D1000 Formações</p>
                </div>
              </div>
              
              <h1 
                className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-[1.1] tracking-tight animate-fade-in"
                style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
              >
                Do <span className="text-gradient-ju10">Zero</span> ao{' '}
                <span className="text-gradient-ju10">Topo</span>
              </h1>
              
              <p 
                className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed animate-fade-in"
                style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
              >
                Formações profissionais de excelência. <br className="hidden md:block" />
                <strong className="text-foreground">Aprende. Aplica. Lucre.</strong>
              </p>

              {/* Features Pills */}
              <div 
                className="flex flex-wrap gap-3 mb-8 animate-fade-in"
                style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
              >
                {[
                  { icon: Video, text: 'Aulas em Vídeo HD' },
                  { icon: FileText, text: 'Certificado Digital' },
                  { icon: Users, text: 'Comunidade Exclusiva' },
                  { icon: Trophy, text: 'Suporte Premium' },
                ].map((feature) => (
                  <div 
                    key={feature.text}
                    className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 text-sm"
                  >
                    <feature.icon className="w-4 h-4 text-primary" />
                    <span className="font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div 
                className="flex flex-wrap gap-4 animate-fade-in"
                style={{ animationDelay: '0.4s', animationFillMode: 'both' }}
              >
                <Button 
                  variant="ju10" 
                  size="lg" 
                  className="rounded-xl font-bold text-base shadow-xl shadow-primary/30"
                  onClick={() => document.getElementById('courses-grid')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Ver Formações
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="rounded-xl font-bold text-base"
                  asChild
                >
                  <Link to="/mentorias">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Mentorias 1:1
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Content - Stats */}
            <div 
              className="hidden lg:block animate-fade-in"
              style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
            >
              <StatsSection 
                totalCourses={courses.length} 
                totalStudents={totalStudents}
                totalHours={totalHours}
              />
            </div>
          </div>

          {/* Mobile Stats */}
          <div className="lg:hidden mt-8">
            <StatsSection 
              totalCourses={courses.length} 
              totalStudents={totalStudents}
              totalHours={totalHours}
            />
          </div>
        </div>
      </section>

      {/* Search & Filters Section */}
      <section className="py-6 px-4 md:px-8 border-y border-border sticky top-0 bg-background/95 backdrop-blur-xl z-40">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pesquisar formações..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-muted rounded-xl border-0 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Category Filters */}
          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
            {D1000_CATEGORIES.map((category) => {
              const CategoryIcon = category.icon;
              const isActive = selectedCategory === category.name;
              return (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
                >
                  <CategoryIcon className="w-4 h-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
          
          {/* Level Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-sm text-muted-foreground flex items-center gap-2 mr-2">
              <Filter className="w-4 h-4" />
              Nível:
            </span>
            {LEVELS.map(level => (
              <button
                key={level.name}
                onClick={() => setSelectedLevel(level.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                  selectedLevel === level.name
                    ? 'bg-foreground text-background ring-2 ring-foreground ring-offset-2 ring-offset-background'
                    : level.color + ' hover:opacity-80'
                }`}
              >
                {level.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section id="courses-grid" className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">
              {filteredCourses.length} Formações{' '}
              {selectedCategory !== 'Todos' && <span className="text-primary">em {selectedCategory}</span>}
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground">Carregando formações...</p>
              </div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Nenhuma formação encontrada</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Tente ajustar os filtros ou pesquisa para encontrar mais formações.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedCategory('Todos');
                  setSelectedLevel('Todos');
                  setSearchQuery('');
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course, index) => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  delay={`${0.05 + index * 0.05}s`}
                  onEnroll={() => handleEnroll(course)}
                  isEnrolled={enrollments.has(course.id)}
                  hasConfirmedPayment={enrollments.get(course.id)?.status === 'confirmed'}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 bg-gradient-to-br from-primary/10 via-background to-orange-50/20 dark:to-orange-950/10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Award className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Precisa de algo mais <span className="text-gradient-ju10">personalizado?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Descubra as nossas mentorias 1:1 com acompanhamento personalizado e resultados garantidos.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild variant="ju10" size="lg" className="rounded-xl font-bold shadow-xl shadow-primary/30">
              <Link to="/mentorias">
                <GraduationCap className="w-5 h-5 mr-2" />
                Ver Mentorias
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl font-bold">
              <Link to="/empresas">
                <Briefcase className="w-5 h-5 mr-2" />
                Planos Empresariais
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Enrollment Modal */}
      <CourseEnrollmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCourse(null);
          fetchUserEnrollments();
        }}
        course={selectedCourse}
      />
    </div>
  );
};

export default Cursos;
