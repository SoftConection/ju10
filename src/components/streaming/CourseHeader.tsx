import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Users, Clock, BookOpen, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import d1000Logo from '@/assets/d1000-logo.jpg';

interface CourseHeaderProps {
  title: string;
  category?: string;
  totalLessons: number;
  totalDuration: number;
  enrolledStudents?: number;
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({
  title,
  category,
  totalLessons,
  totalDuration,
  enrolledStudents = 0,
}) => {
  return (
    <header className="bg-card border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link to="/formacoes">
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </Link>
          </Button>

          <div className="hidden md:flex items-center gap-3">
            <img 
              src={d1000Logo} 
              alt="D1000" 
              className="h-8 w-8 rounded object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                {category && (
                  <Badge variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                )}
              </div>
              <h1 className="font-semibold text-sm truncate max-w-[300px]">
                {title}
              </h1>
            </div>
          </div>
        </div>

        {/* Right side - stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="hidden sm:flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            <span>{totalLessons} aulas</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{Math.round(totalDuration / 60)}h de conteúdo</span>
          </div>
          {enrolledStudents > 0 && (
            <div className="hidden lg:flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{enrolledStudents} alunos</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
