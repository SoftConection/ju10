import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Search,
  GraduationCap,
  BookOpen,
  Clock,
  User,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

interface ClassEnrollment {
  id: string;
  user_id: string;
  class_group_id: string;
  payment_status: string;
  payment_reference: string | null;
  payment_amount: number | null;
  enrolled_at: string;
  paid_at: string | null;
  profile?: {
    full_name: string | null;
    phone: string | null;
    email?: string;
  };
  class_group?: {
    title: string;
  };
}

interface CourseEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  payment_status: string;
  payment_reference: string | null;
  payment_amount: number | null;
  enrolled_at: string;
  paid_at: string | null;
  profile?: {
    full_name: string | null;
    phone: string | null;
  };
  course?: {
    title: string;
  };
}

interface MentorshipEnrollment {
  id: string;
  user_id: string;
  mentorship_id: string;
  payment_status: string;
  payment_reference: string | null;
  payment_amount: number | null;
  enrolled_at: string;
  paid_at: string | null;
  profile?: {
    full_name: string | null;
    phone: string | null;
  };
  mentorship?: {
    title: string;
  };
}

interface AdminPaymentsTabProps {
  onUpdate: () => void;
}

export const AdminPaymentsTab = ({ onUpdate }: AdminPaymentsTabProps) => {
  const [classEnrollments, setClassEnrollments] = useState<ClassEnrollment[]>([]);
  const [courseEnrollments, setCourseEnrollments] = useState<CourseEnrollment[]>([]);
  const [mentorshipEnrollments, setMentorshipEnrollments] = useState<MentorshipEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('pending');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      // Fetch class enrollments
      const { data: classData, error: classError } = await supabase
        .from('class_enrollments')
        .select(`*, class_group:class_groups(title)`)
        .order('enrolled_at', { ascending: false });

      if (classError) throw classError;

      // Fetch course enrollments
      const { data: courseData, error: courseError } = await supabase
        .from('course_enrollments')
        .select(`*, course:courses(title)`)
        .order('enrolled_at', { ascending: false });

      if (courseError) throw courseError;

      // Fetch mentorship enrollments
      const { data: mentorshipData, error: mentorshipError } = await supabase
        .from('mentorship_enrollments')
        .select(`*, mentorship:mentorships(title)`)
        .order('enrolled_at', { ascending: false });

      if (mentorshipError) throw mentorshipError;

      // Fetch profiles separately
      const userIds = new Set([
        ...(classData || []).map(e => e.user_id),
        ...(courseData || []).map(e => e.user_id),
        ...(mentorshipData || []).map(e => e.user_id)
      ]);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, phone')
        .in('user_id', Array.from(userIds));

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      setClassEnrollments((classData || []).map(e => ({
        ...e,
        profile: profileMap.get(e.user_id) || { full_name: null, phone: null }
      })) as ClassEnrollment[]);
      
      setCourseEnrollments((courseData || []).map(e => ({
        ...e,
        profile: profileMap.get(e.user_id) || { full_name: null, phone: null }
      })) as CourseEnrollment[]);

      setMentorshipEnrollments((mentorshipData || []).map(e => ({
        ...e,
        profile: profileMap.get(e.user_id) || { full_name: null, phone: null }
      })) as MentorshipEnrollment[]);
    } catch (error: any) {
      toast.error('Erro ao carregar inscrições: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (type: 'class' | 'course' | 'mentorship', id: string) => {
    setProcessing(id);
    try {
      const tableMap = {
        class: 'class_enrollments',
        course: 'course_enrollments',
        mentorship: 'mentorship_enrollments'
      } as const;
      const table = tableMap[type];
      const { error } = await supabase
        .from(table)
        .update({ 
          payment_status: type === 'mentorship' ? 'confirmed' : 'paid',
          paid_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Pagamento confirmado com sucesso!');
      fetchEnrollments();
      onUpdate();
    } catch (error: any) {
      toast.error('Erro ao confirmar pagamento: ' + error.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleCancelPayment = async (type: 'class' | 'course' | 'mentorship', id: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta inscrição?')) return;

    setProcessing(id);
    try {
      const tableMap = {
        class: 'class_enrollments',
        course: 'course_enrollments',
        mentorship: 'mentorship_enrollments'
      } as const;
      const table = tableMap[type];
      const { error } = await supabase
        .from(table)
        .update({ payment_status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;
      toast.success('Inscrição cancelada.');
      fetchEnrollments();
      onUpdate();
    } catch (error: any) {
      toast.error('Erro ao cancelar: ' + error.message);
    } finally {
      setProcessing(null);
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return '—';
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
      case 'confirmed':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Pago</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Pendente</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filterEnrollments = <T extends { payment_status: string; payment_reference: string | null }>(
    enrollments: T[]
  ) => {
    return enrollments.filter(e => {
      const matchesStatus = statusFilter === 'all' || e.payment_status === statusFilter;
      const matchesSearch = !searchTerm || 
        e.payment_reference?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  };

  const filteredClassEnrollments = filterEnrollments(classEnrollments);
  const filteredCourseEnrollments = filterEnrollments(courseEnrollments);
  const filteredMentorshipEnrollments = filterEnrollments(mentorshipEnrollments);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const EnrollmentTable = ({ 
    enrollments, 
    type 
  }: { 
    enrollments: (ClassEnrollment | CourseEnrollment | MentorshipEnrollment)[]; 
    type: 'class' | 'course' | 'mentorship';
  }) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Aluno</TableHead>
            <TableHead>{type === 'class' ? 'Turma' : type === 'course' ? 'Curso' : 'Mentoria'}</TableHead>
            <TableHead>Referência</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                Nenhuma inscrição encontrada
              </TableCell>
            </TableRow>
          ) : (
            enrollments.map((enrollment) => {
              const title = type === 'class' 
                ? (enrollment as ClassEnrollment).class_group?.title 
                : type === 'course'
                  ? (enrollment as CourseEnrollment).course?.title
                  : (enrollment as MentorshipEnrollment).mentorship?.title;
              
              const isPending = enrollment.payment_status === 'pending';
              
              return (
                <TableRow key={enrollment.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-muted rounded-full">
                        <User className="w-3 h-3" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {enrollment.profile?.full_name || 'Sem nome'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {enrollment.profile?.phone || '—'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {type === 'class' ? (
                        <GraduationCap className="w-4 h-4 text-muted-foreground" />
                      ) : type === 'course' ? (
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Users className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-sm">{title || '—'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {enrollment.payment_reference || '—'}
                    </code>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatPrice(enrollment.payment_amount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatDate(enrollment.enrolled_at)}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(enrollment.payment_status)}</TableCell>
                  <TableCell className="text-right">
                    {isPending && (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => handleConfirmPayment(type, enrollment.id)}
                          disabled={processing === enrollment.id}
                        >
                          {processing === enrollment.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Confirmar
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleCancelPayment(type, enrollment.id)}
                          disabled={processing === enrollment.id}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    {(enrollment.payment_status === 'paid' || enrollment.payment_status === 'confirmed') && enrollment.paid_at && (
                      <span className="text-xs text-muted-foreground">
                        Pago em {formatDate(enrollment.paid_at)}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Gestão de Pagamentos</CardTitle>
            <CardDescription>Confirme pagamentos e gerencie inscrições</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar referência..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-48"
              />
            </div>
            <div className="flex border rounded-lg overflow-hidden">
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter('pending')}
                className="rounded-none"
              >
                Pendentes
              </Button>
              <Button
                variant={statusFilter === 'paid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter('paid')}
                className="rounded-none"
              >
                Pagos
              </Button>
              <Button
                variant={statusFilter === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter('all')}
                className="rounded-none"
              >
                Todos
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="classes">
          <TabsList className="mb-4">
            <TabsTrigger value="classes" className="gap-2">
              <GraduationCap className="w-4 h-4" />
              Turmas ({filteredClassEnrollments.length})
            </TabsTrigger>
            <TabsTrigger value="courses" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Cursos ({filteredCourseEnrollments.length})
            </TabsTrigger>
            <TabsTrigger value="mentorships" className="gap-2">
              <Users className="w-4 h-4" />
              Mentorias ({filteredMentorshipEnrollments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="classes">
            <EnrollmentTable enrollments={filteredClassEnrollments} type="class" />
          </TabsContent>

          <TabsContent value="courses">
            <EnrollmentTable enrollments={filteredCourseEnrollments} type="course" />
          </TabsContent>

          <TabsContent value="mentorships">
            <EnrollmentTable enrollments={filteredMentorshipEnrollments} type="mentorship" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};