import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Plus, 
  Loader2,
  Award,
  Download,
  User,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

interface Certificate {
  id: string;
  user_id: string;
  course_id: string | null;
  class_group_id: string | null;
  certificate_code: string;
  issued_at: string;
  download_url: string | null;
  profile?: {
    full_name: string | null;
  };
  course?: {
    title: string;
  } | null;
  class_group?: {
    title: string;
  } | null;
}

interface EligibleStudent {
  user_id: string;
  full_name: string | null;
  type: 'class' | 'course';
  item_id: string;
  item_title: string;
}

interface AdminCertificatesTabProps {
  onUpdate: () => void;
}

const generateCertificateCode = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `JU10-CERT-${timestamp}-${random}`;
};

export const AdminCertificatesTab = ({ onUpdate }: AdminCertificatesTabProps) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [eligibleStudents, setEligibleStudents] = useState<EligibleStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<EligibleStudent | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch certificates
      const { data: certData, error: certError } = await supabase
        .from('certificates')
        .select(`*, course:courses(title), class_group:class_groups(title)`)
        .order('issued_at', { ascending: false });

      if (certError) throw certError;

      // Fetch paid class enrollments
      const { data: classEnrollments } = await supabase
        .from('class_enrollments')
        .select(`user_id, class_group_id, class_group:class_groups(title)`)
        .eq('payment_status', 'paid');

      // Fetch paid course enrollments
      const { data: courseEnrollments } = await supabase
        .from('course_enrollments')
        .select(`user_id, course_id, course:courses(title)`)
        .eq('payment_status', 'paid');

      // Get all user IDs and fetch profiles
      const userIds = new Set([
        ...(certData || []).map(c => c.user_id),
        ...(classEnrollments || []).map(e => e.user_id),
        ...(courseEnrollments || []).map(e => e.user_id)
      ]);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', Array.from(userIds));

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Map certificates with profiles
      setCertificates((certData || []).map(c => ({
        ...c,
        profile: profileMap.get(c.user_id) || { full_name: null }
      })) as Certificate[]);

      // Filter out those who already have certificates
      const existingCertUserCourse = new Set(
        (certData || []).filter(c => c.course_id).map(c => `${c.user_id}-course-${c.course_id}`)
      );
      const existingCertUserClass = new Set(
        (certData || []).filter(c => c.class_group_id).map(c => `${c.user_id}-class-${c.class_group_id}`)
      );

      const eligible: EligibleStudent[] = [];

      (classEnrollments || []).forEach(e => {
        const key = `${e.user_id}-class-${e.class_group_id}`;
        if (!existingCertUserClass.has(key)) {
          const profile = profileMap.get(e.user_id);
          eligible.push({
            user_id: e.user_id,
            full_name: profile?.full_name || null,
            type: 'class',
            item_id: e.class_group_id,
            item_title: (e.class_group as any)?.title || 'Turma'
          });
        }
      });

      (courseEnrollments || []).forEach(e => {
        const key = `${e.user_id}-course-${e.course_id}`;
        if (!existingCertUserCourse.has(key)) {
          const profile = profileMap.get(e.user_id);
          eligible.push({
            user_id: e.user_id,
            full_name: profile?.full_name || null,
            type: 'course',
            item_id: e.course_id,
            item_title: (e.course as any)?.title || 'Curso'
          });
        }
      });

      setEligibleStudents(eligible);
    } catch (error: any) {
      toast.error('Erro ao carregar dados: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCertificate = async () => {
    if (!selectedStudent) {
      toast.error('Selecione um aluno');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('certificates')
        .insert({
          user_id: selectedStudent.user_id,
          course_id: selectedStudent.type === 'course' ? selectedStudent.item_id : null,
          class_group_id: selectedStudent.type === 'class' ? selectedStudent.item_id : null,
          certificate_code: generateCertificateCode(),
        });

      if (error) throw error;
      toast.success('Certificado emitido com sucesso!');
      setIsDialogOpen(false);
      setSelectedStudent(null);
      fetchData();
      onUpdate();
    } catch (error: any) {
      toast.error('Erro ao emitir certificado: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredCertificates = certificates.filter(cert => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      cert.certificate_code.toLowerCase().includes(search) ||
      cert.profile?.full_name?.toLowerCase().includes(search) ||
      cert.course?.title?.toLowerCase().includes(search) ||
      cert.class_group?.title?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Gestão de Certificados</CardTitle>
            <CardDescription>
              Emita certificados para alunos que completaram turmas ou cursos
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-48"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={eligibleStudents.length === 0}>
                  <Plus className="w-4 h-4 mr-2" />
                  Emitir Certificado
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Emitir Certificado</DialogTitle>
                  <DialogDescription>
                    Selecione o aluno e a formação para emitir o certificado
                  </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                  <Label>Aluno e Formação</Label>
                  <Select
                    value={selectedStudent ? `${selectedStudent.user_id}-${selectedStudent.type}-${selectedStudent.item_id}` : ''}
                    onValueChange={(value) => {
                      const student = eligibleStudents.find(
                        s => `${s.user_id}-${s.type}-${s.item_id}` === value
                      );
                      setSelectedStudent(student || null);
                    }}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Selecione um aluno" />
                    </SelectTrigger>
                    <SelectContent>
                      {eligibleStudents.map((student) => (
                        <SelectItem 
                          key={`${student.user_id}-${student.type}-${student.item_id}`}
                          value={`${student.user_id}-${student.type}-${student.item_id}`}
                        >
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{student.full_name || 'Sem nome'}</span>
                            <span className="text-muted-foreground">—</span>
                            <Badge variant="outline" className="text-xs">
                              {student.type === 'class' ? 'Turma' : 'Curso'}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {student.item_title}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {eligibleStudents.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-4">
                      Não há alunos elegíveis para certificado no momento.
                    </p>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleIssueCertificate} disabled={saving || !selectedStudent}>
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        A emitir...
                      </>
                    ) : (
                      <>
                        <Award className="w-4 h-4 mr-2" />
                        Emitir
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredCertificates.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchTerm ? 'Nenhum certificado encontrado' : 'Nenhum certificado emitido ainda'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Formação</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Emitido em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCertificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {cert.certificate_code}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-full">
                          <User className="w-3 h-3 text-primary" />
                        </div>
                        <span className="font-medium">
                          {cert.profile?.full_name || 'Sem nome'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {cert.course?.title || cert.class_group?.title || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {cert.course_id ? 'Curso' : 'Turma'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(cert.issued_at)}</TableCell>
                    <TableCell className="text-right">
                      {cert.download_url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={cert.download_url} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {eligibleStudents.length > 0 && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Alunos elegíveis para certificado</h4>
            <p className="text-sm text-muted-foreground">
              {eligibleStudents.length} aluno(s) completaram formações e ainda não receberam certificado.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};