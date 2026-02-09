import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEOHead';
import { CourseHeader } from '@/components/streaming/CourseHeader';
import { LessonSidebar } from '@/components/streaming/LessonSidebar';
import { LessonContent } from '@/components/streaming/LessonContent';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, Menu, X } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  video_type: string;
  content: string | null;
  duration_minutes: number | null;
  is_free: boolean;
  order_index: number;
}

interface Module {
  id: string;
  title: string;
  order_index: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  price_aoa: number;
}

const CoursePlayer = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [lessonProgress, setLessonProgress] = useState<Map<string, number>>(new Map());
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId, user]);

  useEffect(() => {
    if (lessonId && modules.length > 0) {
      const lesson = modules
        .flatMap(m => m.lessons)
        .find(l => l.id === lessonId);
      if (lesson) {
        setCurrentLesson(lesson);
      }
    } else if (!lessonId && modules.length > 0) {
      // Navigate to first lesson
      const firstLesson = modules[0]?.lessons[0];
      if (firstLesson) {
        navigate(`/curso/${courseId}/aula/${firstLesson.id}`, { replace: true });
      }
    }
  }, [lessonId, modules, courseId, navigate]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);

      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Check enrollment
      if (user) {
        const { data: enrollment } = await supabase
          .from('course_enrollments')
          .select('payment_status')
          .eq('course_id', courseId)
          .eq('user_id', user.id)
          .single();

        setIsEnrolled(enrollment?.payment_status === 'confirmed');

        // Fetch progress
        const { data: progress } = await supabase
          .from('lesson_progress')
          .select('lesson_id, completed, progress_seconds')
          .eq('user_id', user.id);

        if (progress) {
          const completed = new Set(progress.filter(p => p.completed).map(p => p.lesson_id));
          setCompletedLessons(completed);
          
          const progressMap = new Map(progress.map(p => [p.lesson_id, p.progress_seconds || 0]));
          setLessonProgress(progressMap);
        }
      }

      // Fetch modules and lessons
      const { data: modulesData, error: modulesError } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      if (modulesError) throw modulesError;

      // Fetch lessons for each module
      const modulesWithLessons: Module[] = await Promise.all(
        (modulesData || []).map(async (mod) => {
          const { data: lessons } = await supabase
            .from('course_lessons')
            .select('*')
            .eq('module_id', mod.id)
            .order('order_index');

          return {
            ...mod,
            lessons: lessons || [],
          };
        })
      );

      setModules(modulesWithLessons);
    } catch (error) {
      console.error('Error fetching course:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o curso.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLesson = (newLessonId: string) => {
    navigate(`/curso/${courseId}/aula/${newLessonId}`);
    setSidebarOpen(false);
  };

  const handleMarkComplete = async () => {
    if (!user || !currentLesson) return;

    try {
      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: currentLesson.id,
          completed: true,
          completed_at: new Date().toISOString(),
        });

      if (error) throw error;

      setCompletedLessons(prev => new Set([...prev, currentLesson.id]));
      
      toast({
        title: 'Aula concluída!',
        description: 'Seu progresso foi salvo.',
      });
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  const handleProgress = async (seconds: number) => {
    if (!user || !currentLesson) return;

    // Debounce updates - only update every 10 seconds
    const currentProgress = lessonProgress.get(currentLesson.id) || 0;
    if (Math.abs(seconds - currentProgress) < 10) return;

    setLessonProgress(prev => new Map(prev).set(currentLesson.id, seconds));

    try {
      await supabase
        .from('lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: currentLesson.id,
          progress_seconds: Math.floor(seconds),
        });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleNextLesson = () => {
    const allLessons = modules.flatMap(m => m.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === currentLesson?.id);
    const nextLesson = allLessons[currentIndex + 1];
    
    if (nextLesson) {
      handleSelectLesson(nextLesson.id);
    }
  };

  const calculateProgress = () => {
    const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
    if (totalLessons === 0) return 0;
    return (completedLessons.size / totalLessons) * 100;
  };

  const getTotalDuration = () => {
    return modules
      .flatMap(m => m.lessons)
      .reduce((acc, l) => acc + (l.duration_minutes || 0), 0);
  };

  const getTotalLessons = () => {
    return modules.reduce((acc, m) => acc + m.lessons.length, 0);
  };

  const hasNextLesson = () => {
    const allLessons = modules.flatMap(m => m.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === currentLesson?.id);
    return currentIndex < allLessons.length - 1;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Curso não encontrado</h1>
          <Button onClick={() => navigate('/formacoes')}>
            Voltar às Formações
          </Button>
        </div>
      </div>
    );
  }

  // Check access for current lesson
  const canAccessCurrentLesson = isEnrolled || currentLesson?.is_free;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={`${currentLesson?.title || course.title} | D1000 Formações`}
        description={course.description || ''}
      />

      {/* Header */}
      <CourseHeader
        title={course.title}
        category={course.category || undefined}
        totalLessons={getTotalLessons()}
        totalDuration={getTotalDuration()}
      />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile sidebar toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-4 right-4 z-50 lg:hidden bg-primary text-primary-foreground shadow-lg rounded-full w-12 h-12"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>

        {/* Lesson content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {!canAccessCurrentLesson ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Conteúdo Bloqueado</h2>
                <p className="text-muted-foreground mb-6">
                  Inscreva-se nesta formação para aceder a todo o conteúdo.
                </p>
                <Button onClick={() => navigate('/formacoes')} size="lg">
                  Ver Formações
                </Button>
              </div>
            </div>
          ) : currentLesson ? (
            <LessonContent
              lesson={{
                ...currentLesson,
                video_type: currentLesson.video_type as 'youtube' | 'vimeo' | 'upload',
                description: currentLesson.description || undefined,
                video_url: currentLesson.video_url || undefined,
                content: currentLesson.content || undefined,
                duration_minutes: currentLesson.duration_minutes || undefined,
              }}
              isCompleted={completedLessons.has(currentLesson.id)}
              onMarkComplete={handleMarkComplete}
              onNextLesson={handleNextLesson}
              hasNextLesson={hasNextLesson()}
              onProgress={handleProgress}
              initialProgress={lessonProgress.get(currentLesson.id) || 0}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">Selecione uma aula para começar</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div
          className={`fixed lg:relative inset-y-0 right-0 w-80 z-40 transform transition-transform duration-300 lg:transform-none ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          }`}
        >
          <LessonSidebar
            modules={modules}
            currentLessonId={currentLesson?.id || ''}
            completedLessons={completedLessons}
            isEnrolled={isEnrolled}
            onSelectLesson={handleSelectLesson}
            courseProgress={calculateProgress()}
          />
        </div>

        {/* Sidebar backdrop for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default CoursePlayer;
