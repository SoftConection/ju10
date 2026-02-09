import React from 'react';
import { CheckCircle2, Circle, PlayCircle, Lock, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

interface Lesson {
  id: string;
  title: string;
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

interface LessonSidebarProps {
  modules: Module[];
  currentLessonId: string;
  completedLessons: Set<string>;
  isEnrolled: boolean;
  onSelectLesson: (lessonId: string) => void;
  courseProgress: number;
}

export const LessonSidebar: React.FC<LessonSidebarProps> = ({
  modules,
  currentLessonId,
  completedLessons,
  isEnrolled,
  onSelectLesson,
  courseProgress,
}) => {
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedCount = completedLessons.size;

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      {/* Progress header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progresso do Curso</span>
          <span className="text-sm text-primary font-bold">{Math.round(courseProgress)}%</span>
        </div>
        <Progress value={courseProgress} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">
          {completedCount} de {totalLessons} aulas concluídas
        </p>
      </div>

      {/* Modules list */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {modules
            .sort((a, b) => a.order_index - b.order_index)
            .map((module, moduleIndex) => (
              <div key={module.id}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Módulo {moduleIndex + 1}: {module.title}
                </h3>
                <div className="space-y-1">
                  {module.lessons
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((lesson) => {
                      const isCompleted = completedLessons.has(lesson.id);
                      const isCurrent = currentLessonId === lesson.id;
                      const canAccess = isEnrolled || lesson.is_free;

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => canAccess && onSelectLesson(lesson.id)}
                          disabled={!canAccess}
                          className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all ${
                            isCurrent
                              ? 'bg-primary/10 border border-primary/30'
                              : canAccess
                              ? 'hover:bg-muted'
                              : 'opacity-50 cursor-not-allowed'
                          }`}
                        >
                          {/* Status icon */}
                          <div className="mt-0.5">
                            {!canAccess ? (
                              <Lock className="w-4 h-4 text-muted-foreground" />
                            ) : isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : isCurrent ? (
                              <PlayCircle className="w-4 h-4 text-primary animate-pulse" />
                            ) : (
                              <Circle className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>

                          {/* Lesson info */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isCurrent ? 'text-primary' : ''}`}>
                              {lesson.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {lesson.is_free && !isEnrolled && (
                                <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                                  Grátis
                                </span>
                              )}
                              {lesson.duration_minutes && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {lesson.duration_minutes} min
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
        </div>
      </ScrollArea>
    </div>
  );
};
