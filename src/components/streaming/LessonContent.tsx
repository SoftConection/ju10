import React from 'react';
import { VideoPlayer } from './VideoPlayer';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ChevronRight, FileText, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LessonContentProps {
  lesson: {
    id: string;
    title: string;
    description?: string;
    video_url?: string;
    video_type: 'youtube' | 'vimeo' | 'upload';
    content?: string;
    duration_minutes?: number;
  };
  isCompleted: boolean;
  onMarkComplete: () => void;
  onNextLesson: () => void;
  hasNextLesson: boolean;
  onProgress: (seconds: number) => void;
  initialProgress?: number;
}

export const LessonContent: React.FC<LessonContentProps> = ({
  lesson,
  isCompleted,
  onMarkComplete,
  onNextLesson,
  hasNextLesson,
  onProgress,
  initialProgress = 0,
}) => {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Video Player */}
      {lesson.video_url && (
        <div className="p-4 lg:p-6">
          <VideoPlayer
            videoUrl={lesson.video_url}
            videoType={lesson.video_type as 'youtube' | 'vimeo' | 'upload'}
            title={lesson.title}
            onProgress={onProgress}
            onComplete={onMarkComplete}
            initialProgress={initialProgress}
          />
        </div>
      )}

      {/* Lesson info */}
      <div className="px-4 lg:px-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-display font-bold">{lesson.title}</h2>
            {lesson.description && (
              <p className="text-muted-foreground mt-1">{lesson.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isCompleted ? (
              <Button
                variant="outline"
                onClick={onMarkComplete}
                className="gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Marcar como concluída
              </Button>
            ) : (
              <Button variant="ghost" disabled className="gap-2 text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                Concluída
              </Button>
            )}
            
            {hasNextLesson && (
              <Button onClick={onNextLesson} className="gap-2">
                Próxima aula
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Tabs for content */}
        <Tabs defaultValue="content" className="w-full">
          <TabsList>
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
            <TabsTrigger value="resources">Recursos</TabsTrigger>
            <TabsTrigger value="notes">Anotações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="mt-4">
            {lesson.content ? (
              <div 
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: lesson.content }}
              />
            ) : (
              <p className="text-muted-foreground">
                Assista ao vídeo acima para acompanhar esta aula.
              </p>
            )}
          </TabsContent>
          
          <TabsContent value="resources" className="mt-4">
            <div className="bg-muted/30 rounded-lg p-6 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Nenhum recurso adicional para esta aula.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="notes" className="mt-4">
            <textarea
              placeholder="Faça suas anotações aqui..."
              className="w-full h-48 p-4 bg-muted/30 rounded-lg border border-border resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Suas anotações são salvas localmente no navegador.
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
