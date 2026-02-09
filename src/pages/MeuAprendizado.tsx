import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import d1000Logo from '@/assets/d1000-logo.jpg';
import {
  GraduationCap,
  BookOpen,
  Clock,
  Award,
  Play,
  ChevronRight,
  Loader2,
  Calendar,
  TrendingUp,
} from 'lucide-react';

interface EnrolledCourse {
  id: string;
  course: {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    image_url: string | null;
    duration_hours: number | null;
  };
  payment_status: string;
  enrolled_at: string;
  progress_percent: number;
  completedLessons: number;
  totalLessons: number;
}

interface EnrolledMentorship {
  id: string;
  mentorship: {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    image_url: string | null;
    duration_weeks: number | null;
  };
  payment_status: string;
  enrolled_at: string;
}

const MeuAprendizado = () => {
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [mentorships, setMentorships] = useState<EnrolledMentorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

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
    if (user) {
      fetchEnrollments();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchEnrollments = async () => {
    try {
      // Fetch course enrollments
      const { data: courseEnrollments } = await supabase
        .from('course_enrollments')
        .select(`
          id,
          payment_status,
          enrolled_at,
          progress_percent,
          course:courses (
            id,
            title,
            description,
            category,
            image_url,
            duration_hours
          )
        `)
        .eq('user_id', user.id)
        .eq('payment_status', 'confirmed');

      // Calculate progress for each course
      const enrichedCourses = await Promise.all(
        (courseEnrollments || []).map(async (enrollment: any) => {
          // Get total lessons
          const { data: modules } = await supabase
            .from('course_modules')
            .select('id')
            .eq('course_id', enrollment.course.id);

          let totalLessons = 0;
          let completedLessons = 0;

          if (modules) {
            for (const mod of modules) {
              const { count: lessonCount } = await supabase
                .from('course_lessons')
                .select('*', { count: 'exact', head: true })
                .eq('module_id', mod.id);
              totalLessons += lessonCount || 0;
            }

            // Get completed lessons
            const { count: completedCount } = await supabase
              .from('lesson_progress')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .eq('completed', true);
            completedLessons = completedCount || 0;
          }

          return {
            ...enrollment,
            completedLessons,
            totalLessons,
            progress_percent: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
          };
        })
      );

      setCourses(enrichedCourses);

      // Fetch mentorship enrollments
      const { data: mentorshipEnrollments } = await supabase
        .from('mentorship_enrollments')
        .select(`
          id,
          payment_status,
          enrolled_at,
          mentorship:mentorships (
            id,
            title,
            description,
            category,
            image_url,
            duration_weeks
          )
        `)
        .eq('user_id', user.id)
        .eq('payment_status', 'confirmed');

      setMentorships(mentorshipEnrollments || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead title="Meu Aprendizado | D1000" description="Aceda às suas formações e mentorias" />
        <Navbar />
        <div className="pt-32 px-4 text-center">
          <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Faça login para ver seu aprendizado</h1>
          <p className="text-muted-foreground mb-6">Aceda às suas formações e mentorias.</p>
          <Button asChild>
            <Link to="/auth">Entrar</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Meu Aprendizado | D1000"
        description="Aceda às suas formações e mentorias"
      />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 md:pt-40 pb-12 px-4 md:px-8 bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <img src={d1000Logo} alt="D1000" className="h-14 w-auto rounded-lg shadow-lg" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Área do Aluno</p>
              <h1 className="text-3xl md:text-4xl font-display font-bold">Meu Aprendizado</h1>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{courses.length}</p>
                  <p className="text-xs text-muted-foreground">Formações</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mentorships.length}</p>
                  <p className="text-xs text-muted-foreground">Mentorias</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {courses.reduce((acc, c) => acc + c.completedLessons, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Aulas Completas</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {courses.filter(c => c.progress_percent >= 100).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Certificados</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs defaultValue="courses">
              <TabsList className="mb-6">
                <TabsTrigger value="courses">
                  Formações ({courses.length})
                </TabsTrigger>
                <TabsTrigger value="mentorships">
                  Mentorias ({mentorships.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="courses">
                {courses.length === 0 ? (
                  <div className="text-center py-12 bg-muted/30 rounded-xl">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma formação ainda</h3>
                    <p className="text-muted-foreground mb-4">
                      Explore nossas formações e comece a aprender hoje.
                    </p>
                    <Button asChild>
                      <Link to="/formacoes">Ver Formações</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((enrollment) => (
                      <Card key={enrollment.id} className="overflow-hidden group">
                        <div className="relative aspect-video bg-muted">
                          {enrollment.course.image_url ? (
                            <img
                              src={enrollment.course.image_url}
                              alt={enrollment.course.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-12 h-12 text-muted-foreground" />
                            </div>
                          )}
                          <Link
                            to={`/curso/${enrollment.course.id}`}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center">
                              <Play className="w-6 h-6 text-primary-foreground ml-1" />
                            </div>
                          </Link>
                        </div>
                        <div className="p-4">
                          <div className="text-xs text-primary font-semibold uppercase mb-1">
                            {enrollment.course.category || 'Formação'}
                          </div>
                          <h3 className="font-semibold mb-2 line-clamp-1">
                            {enrollment.course.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                            <Calendar className="w-3 h-3" />
                            Inscrito em {formatDate(enrollment.enrolled_at)}
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progresso</span>
                              <span className="font-medium">
                                {Math.round(enrollment.progress_percent)}%
                              </span>
                            </div>
                            <Progress value={enrollment.progress_percent} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                              {enrollment.completedLessons} de {enrollment.totalLessons} aulas
                            </p>
                          </div>
                          <Button asChild variant="ju10" className="w-full mt-4">
                            <Link to={`/curso/${enrollment.course.id}`}>
                              Continuar
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="mentorships">
                {mentorships.length === 0 ? (
                  <div className="text-center py-12 bg-muted/30 rounded-xl">
                    <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma mentoria ainda</h3>
                    <p className="text-muted-foreground mb-4">
                      Explore nossas mentorias e acelere seu crescimento.
                    </p>
                    <Button asChild>
                      <Link to="/mentorias">Ver Mentorias</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mentorships.map((enrollment) => (
                      <Card key={enrollment.id} className="overflow-hidden">
                        <div className="relative aspect-video bg-muted">
                          {enrollment.mentorship.image_url ? (
                            <img
                              src={enrollment.mentorship.image_url}
                              alt={enrollment.mentorship.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <GraduationCap className="w-12 h-12 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="text-xs text-primary font-semibold uppercase mb-1">
                            {enrollment.mentorship.category || 'Mentoria'}
                          </div>
                          <h3 className="font-semibold mb-2 line-clamp-1">
                            {enrollment.mentorship.title}
                          </h3>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(enrollment.enrolled_at)}
                            </span>
                            {enrollment.mentorship.duration_weeks && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {enrollment.mentorship.duration_weeks} semanas
                              </span>
                            )}
                          </div>
                          <Button asChild variant="ju10" className="w-full">
                            <Link to={`/mentoria/${enrollment.mentorship.id}`}>
                              Acessar
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>
    </div>
  );
};

export default MeuAprendizado;
