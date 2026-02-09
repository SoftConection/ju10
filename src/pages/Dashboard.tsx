import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  GraduationCap,
  Award,
  Clock,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Play,
  Download,
  Loader2,
  Users,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

interface ClassEnrollment {
  id: string;
  class_group_id: string;
  payment_status: string;
  payment_reference: string | null;
  payment_amount: number | null;
  enrolled_at: string;
  paid_at: string | null;
  class_group: {
    id: string;
    title: string;
    schedule: string;
    format: string;
    instructor: string | null;
  };
}

interface CourseEnrollment {
  id: string;
  course_id: string;
  payment_status: string;
  payment_reference: string | null;
  payment_amount: number | null;
  progress_percent: number;
  enrolled_at: string;
  paid_at: string | null;
  completed_at: string | null;
  course: {
    id: string;
    title: string;
    duration_hours: number | null;
    level: string | null;
    image_url: string | null;
    modules: number | null;
  };
}

interface Certificate {
  id: string;
  certificate_code: string;
  issued_at: string;
  download_url: string | null;
  course: {
    title: string;
  } | null;
  class_group: {
    title: string;
  } | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [classEnrollments, setClassEnrollments] = useState<ClassEnrollment[]>([]);
  const [courseEnrollments, setCourseEnrollments] = useState<CourseEnrollment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchDashboardData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchDashboardData = async (userId: string) => {
    setLoading(true);
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (profileData) {
        setProfile(profileData);
      }

      // Fetch class enrollments
      const { data: classData } = await supabase
        .from("class_enrollments")
        .select(`
          *,
          class_group:class_groups (
            id,
            title,
            schedule,
            format,
            instructor
          )
        `)
        .eq("user_id", userId)
        .order("enrolled_at", { ascending: false });

      if (classData) {
        const validClassEnrollments = classData
          .filter(e => e.class_group)
          .map(e => ({
            ...e,
            class_group: e.class_group as ClassEnrollment["class_group"]
          }));
        setClassEnrollments(validClassEnrollments);
      }

      // Fetch course enrollments
      const { data: courseData } = await supabase
        .from("course_enrollments")
        .select(`
          *,
          course:courses (
            id,
            title,
            duration_hours,
            level,
            image_url,
            modules
          )
        `)
        .eq("user_id", userId)
        .order("enrolled_at", { ascending: false });

      if (courseData) {
        const validCourseEnrollments = courseData
          .filter(e => e.course)
          .map(e => ({
            ...e,
            course: e.course as CourseEnrollment["course"]
          }));
        setCourseEnrollments(validCourseEnrollments);
      }

      // Fetch certificates
      const { data: certData } = await supabase
        .from("certificates")
        .select(`
          *,
          course:courses (title),
          class_group:class_groups (title)
        `)
        .eq("user_id", userId)
        .order("issued_at", { ascending: false });

      if (certData) {
        setCertificates(certData as Certificate[]);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (price: number | null) => {
    if (!price) return "—";
    return new Intl.NumberFormat("pt-AO", {
      style: "currency",
      currency: "AOA",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Pago</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Pendente</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Statistics
  const totalEnrollments = classEnrollments.length + courseEnrollments.length;
  const paidEnrollments = [
    ...classEnrollments.filter(e => e.payment_status === "paid"),
    ...courseEnrollments.filter(e => e.payment_status === "paid")
  ].length;
  const completedCourses = courseEnrollments.filter(e => e.completed_at).length;
  const avgProgress = courseEnrollments.length > 0
    ? Math.round(courseEnrollments.reduce((sum, e) => sum + (e.progress_percent || 0), 0) / courseEnrollments.length)
    : 0;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <span className="text-muted-foreground">Carregando dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Dashboard do Aluno | JU10"
        description="Acompanhe seus cursos, turmas e certificados na plataforma JU10."
      />
      <Navbar />

      <main className="min-h-screen bg-background pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-4 border-primary/20">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Olá, {profile?.display_name || profile?.full_name || "Aluno"}!
                </h1>
                <p className="text-muted-foreground">Bem-vindo ao seu painel de aprendizagem</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/turmas")}>
                <Users className="w-4 h-4 mr-2" />
                Ver Turmas
              </Button>
              <Button onClick={() => navigate("/cursos")}>
                <BookOpen className="w-4 h-4 mr-2" />
                Ver Cursos
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalEnrollments}</p>
                    <p className="text-xs text-muted-foreground">Inscrições</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{paidEnrollments}</p>
                    <p className="text-xs text-muted-foreground">Confirmadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{avgProgress}%</p>
                    <p className="text-xs text-muted-foreground">Progresso Médio</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Award className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{certificates.length}</p>
                    <p className="text-xs text-muted-foreground">Certificados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="classes" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
              <TabsTrigger value="classes" className="gap-2">
                <GraduationCap className="w-4 h-4" />
                <span className="hidden sm:inline">Turmas</span>
              </TabsTrigger>
              <TabsTrigger value="courses" className="gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Cursos</span>
              </TabsTrigger>
              <TabsTrigger value="certificates" className="gap-2">
                <Award className="w-4 h-4" />
                <span className="hidden sm:inline">Certificados</span>
              </TabsTrigger>
            </TabsList>

            {/* Classes Tab */}
            <TabsContent value="classes" className="space-y-4">
              {classEnrollments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <GraduationCap className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma turma inscrita</h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      Explore nossas turmas disponíveis e comece sua jornada!
                    </p>
                    <Button onClick={() => navigate("/turmas")}>
                      Ver Turmas Disponíveis
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {classEnrollments.map((enrollment) => (
                    <Card key={enrollment.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          <div className="flex-1 p-6">
                            <div className="flex items-start justify-between gap-4 mb-4">
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {enrollment.class_group.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {enrollment.class_group.instructor && `Por ${enrollment.class_group.instructor}`}
                                </p>
                              </div>
                              {getPaymentStatusBadge(enrollment.payment_status)}
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {enrollment.class_group.schedule}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {enrollment.class_group.format}
                              </div>
                              <div className="flex items-center gap-1">
                                <CreditCard className="w-4 h-4" />
                                {formatPrice(enrollment.payment_amount)}
                              </div>
                            </div>
                          </div>
                          {enrollment.payment_status === "pending" && (
                            <div className="border-t md:border-t-0 md:border-l border-border p-4 bg-secondary/30 flex flex-col justify-center items-center gap-2">
                              <AlertCircle className="w-8 h-8 text-yellow-500" />
                              <p className="text-xs text-center text-muted-foreground">
                                Pagamento pendente
                              </p>
                              <code className="text-xs font-mono bg-background px-2 py-1 rounded">
                                {enrollment.payment_reference}
                              </code>
                            </div>
                          )}
                          {enrollment.payment_status === "paid" && (
                            <div className="border-t md:border-t-0 md:border-l border-border p-4 bg-green-500/5 flex flex-col justify-center items-center gap-2">
                              <CheckCircle2 className="w-8 h-8 text-green-500" />
                              <p className="text-xs text-center text-muted-foreground">
                                Inscrição confirmada
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses" className="space-y-4">
              {courseEnrollments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum curso inscrito</h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      Descubra nossos cursos e aprenda com os melhores!
                    </p>
                    <Button onClick={() => navigate("/cursos")}>
                      Ver Cursos Disponíveis
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {courseEnrollments.map((enrollment) => (
                    <Card key={enrollment.id} className="overflow-hidden">
                      {enrollment.course.image_url && (
                        <div className="h-32 overflow-hidden">
                          <img
                            src={enrollment.course.image_url}
                            alt={enrollment.course.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <h3 className="font-semibold line-clamp-1">
                            {enrollment.course.title}
                          </h3>
                          {getPaymentStatusBadge(enrollment.payment_status)}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-4">
                          {enrollment.course.level && (
                            <Badge variant="outline">{enrollment.course.level}</Badge>
                          )}
                          {enrollment.course.duration_hours && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {enrollment.course.duration_hours}h
                            </span>
                          )}
                          {enrollment.course.modules && (
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              {enrollment.course.modules} módulos
                            </span>
                          )}
                        </div>

                        {enrollment.payment_status === "paid" && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Progresso</span>
                              <span className="font-medium">{enrollment.progress_percent}%</span>
                            </div>
                            <Progress value={enrollment.progress_percent} className="h-2" />
                            <Button className="w-full mt-3" size="sm">
                              <Play className="w-4 h-4 mr-2" />
                              Continuar Curso
                            </Button>
                          </div>
                        )}

                        {enrollment.payment_status === "pending" && (
                          <div className="bg-yellow-500/10 rounded-lg p-3 text-center">
                            <p className="text-xs text-muted-foreground mb-1">Referência:</p>
                            <code className="font-mono text-sm font-bold">
                              {enrollment.payment_reference}
                            </code>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Certificates Tab */}
            <TabsContent value="certificates" className="space-y-4">
              {certificates.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Award className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum certificado ainda</h3>
                    <p className="text-muted-foreground text-sm">
                      Complete seus cursos e turmas para obter certificados!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {certificates.map((cert) => (
                    <Card key={cert.id} className="overflow-hidden border-2 border-primary/20">
                      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary rounded-lg">
                            <Award className="w-6 h-6 text-primary-foreground" />
                          </div>
                          <div>
                            <CardTitle className="text-base">Certificado</CardTitle>
                            <CardDescription>
                              {cert.course?.title || cert.class_group?.title}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Código</p>
                            <code className="font-mono text-sm">{cert.certificate_code}</code>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Emitido em</p>
                            <p className="text-sm font-medium">{formatDate(cert.issued_at)}</p>
                          </div>
                          {cert.download_url && (
                            <Button variant="outline" className="w-full" size="sm" asChild>
                              <a href={cert.download_url} target="_blank" rel="noopener noreferrer">
                                <Download className="w-4 h-4 mr-2" />
                                Baixar Certificado
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
};

export default Dashboard;