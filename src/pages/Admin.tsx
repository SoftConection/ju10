import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  BookOpen, 
  CreditCard, 
  Award,
  Users,
  Calendar,
  TrendingUp,
  Loader2,
  ShieldAlert,
  Target
} from 'lucide-react';
import { toast } from 'sonner';

// Import admin components
import { AdminClassesTab } from '@/components/admin/AdminClassesTab';
import { AdminCoursesTab } from '@/components/admin/AdminCoursesTab';
import { AdminPaymentsTab } from '@/components/admin/AdminPaymentsTab';
import { AdminCertificatesTab } from '@/components/admin/AdminCertificatesTab';
import { AdminMentorshipsTab } from '@/components/admin/AdminMentorshipsTab';

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalCourses: 0,
    totalMentorships: 0,
    pendingPayments: 0,
    issuedCertificates: 0,
    totalStudents: 0,
    totalRevenue: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }

    // Check if user has admin role
    const { data: roles, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (error || !roles) {
      toast.error('Acesso negado. Você não tem privilégios de administrador.');
      navigate('/');
      return;
    }

    setIsAdmin(true);
    await fetchStats();
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      // Fetch total classes
      const { count: classCount } = await supabase
        .from('class_groups')
        .select('*', { count: 'exact', head: true });

      // Fetch total mentorships
      const { count: mentorshipCount } = await supabase
        .from('mentorships')
        .select('*', { count: 'exact', head: true });

      // Fetch total courses
      const { count: courseCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });

      // Fetch pending payments (class + course enrollments)
      const { count: pendingClassPayments } = await supabase
        .from('class_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'pending');

      const { count: pendingCoursePayments } = await supabase
        .from('course_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'pending');

      const { count: pendingMentorshipPayments } = await supabase
        .from('mentorship_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'pending');

      // Fetch issued certificates
      const { count: certCount } = await supabase
        .from('certificates')
        .select('*', { count: 'exact', head: true });

      // Fetch total students (unique profiles with enrollments)
      const { count: studentCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Calculate total revenue from paid enrollments
      const { data: paidClassEnrollments } = await supabase
        .from('class_enrollments')
        .select('payment_amount')
        .eq('payment_status', 'confirmed');

      const { data: paidMentorshipEnrollments } = await supabase
        .from('mentorship_enrollments')
        .select('payment_amount')
        .eq('payment_status', 'confirmed');

      const { data: paidCourseEnrollments } = await supabase
        .from('course_enrollments')
        .select('payment_amount')
        .eq('payment_status', 'confirmed');

      const classRevenue = paidClassEnrollments?.reduce((sum, e) => sum + (e.payment_amount || 0), 0) || 0;
      const courseRevenue = paidCourseEnrollments?.reduce((sum, e) => sum + (e.payment_amount || 0), 0) || 0;
      const mentorshipRevenue = paidMentorshipEnrollments?.reduce((sum, e) => sum + (e.payment_amount || 0), 0) || 0;

      setStats({
        totalClasses: classCount || 0,
        totalCourses: courseCount || 0,
        totalMentorships: mentorshipCount || 0,
        pendingPayments: (pendingClassPayments || 0) + (pendingCoursePayments || 0) + (pendingMentorshipPayments || 0),
        issuedCertificates: certCount || 0,
        totalStudents: studentCount || 0,
        totalRevenue: classRevenue + courseRevenue + mentorshipRevenue,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <span className="text-muted-foreground">A verificar permissões...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <ShieldAlert className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground mb-4">
              Você não tem permissões de administrador.
            </p>
            <Button onClick={() => navigate('/')}>Voltar ao Início</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="Painel Administrativo | JU10"
        description="Gerencie turmas, cursos, pagamentos e certificados da plataforma JU10."
      />
      <Navbar />

      <main className="min-h-screen bg-background pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                Administrador
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold">
              Painel <span className="text-gradient-ju10">Administrativo</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie turmas, cursos, pagamentos e certificados.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-500/10 rounded-lg">
                    <GraduationCap className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{stats.totalClasses}</p>
                    <p className="text-xs text-muted-foreground">Turmas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-500/10 rounded-lg">
                    <BookOpen className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{stats.totalCourses}</p>
                    <p className="text-xs text-muted-foreground">Cursos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-orange-500/10 rounded-lg">
                    <Target className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{stats.totalMentorships}</p>
                    <p className="text-xs text-muted-foreground">Mentorias</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-yellow-500/10 rounded-lg">
                    <CreditCard className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{stats.pendingPayments}</p>
                    <p className="text-xs text-muted-foreground">Pendentes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-green-500/10 rounded-lg">
                    <Award className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{stats.issuedCertificates}</p>
                    <p className="text-xs text-muted-foreground">Certificados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{stats.totalStudents}</p>
                    <p className="text-xs text-muted-foreground">Alunos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{formatPrice(stats.totalRevenue)}</p>
                    <p className="text-xs text-muted-foreground">Receita</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="classes" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
              <TabsTrigger value="classes" className="gap-2">
                <GraduationCap className="w-4 h-4" />
                <span className="hidden sm:inline">Turmas</span>
              </TabsTrigger>
              <TabsTrigger value="courses" className="gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Cursos</span>
              </TabsTrigger>
              <TabsTrigger value="mentorships" className="gap-2">
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline">Mentorias</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="gap-2">
                <CreditCard className="w-4 h-4" />
                <span className="hidden sm:inline">Pagamentos</span>
                {stats.pendingPayments > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {stats.pendingPayments}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="certificates" className="gap-2">
                <Award className="w-4 h-4" />
                <span className="hidden sm:inline">Certificados</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="classes">
              <AdminClassesTab onUpdate={fetchStats} />
            </TabsContent>

            <TabsContent value="courses">
              <AdminCoursesTab onUpdate={fetchStats} />
            </TabsContent>

            <TabsContent value="mentorships">
              <AdminMentorshipsTab onUpdate={fetchStats} />
            </TabsContent>

            <TabsContent value="payments">
              <AdminPaymentsTab onUpdate={fetchStats} />
            </TabsContent>

            <TabsContent value="certificates">
              <AdminCertificatesTab onUpdate={fetchStats} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
};

export default Admin;