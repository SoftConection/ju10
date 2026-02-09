import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Pencil, 
  Trash2, 
  Loader2,
  Users,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface Course {
  id: string;
  title: string;
  description: string | null;
  duration_hours: number | null;
  price_aoa: number;
  level: string | null;
  category: string | null;
  image_url: string | null;
  modules: number | null;
}

interface AdminCoursesTabProps {
  onUpdate: () => void;
}

const emptyCourse: Omit<Course, 'id'> = {
  title: '',
  description: '',
  duration_hours: null,
  price_aoa: 0,
  level: 'Iniciante',
  category: '',
  image_url: '',
  modules: 1,
};

export const AdminCoursesTab = ({ onUpdate }: AdminCoursesTabProps) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState(emptyCourse);
  const [enrollmentCounts, setEnrollmentCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);

      // Fetch enrollment counts
      if (data) {
        const counts: Record<string, number> = {};
        for (const course of data) {
          const { count } = await supabase
            .from('course_enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id);
          counts[course.id] = count || 0;
        }
        setEnrollmentCounts(counts);
      }
    } catch (error: any) {
      toast.error('Erro ao carregar cursos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        title: course.title,
        description: course.description || '',
        duration_hours: course.duration_hours,
        price_aoa: course.price_aoa,
        level: course.level || 'Iniciante',
        category: course.category || '',
        image_url: course.image_url || '',
        modules: course.modules || 1,
      });
    } else {
      setEditingCourse(null);
      setFormData(emptyCourse);
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title) {
      toast.error('Preencha o título do curso');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description || null,
        duration_hours: formData.duration_hours,
        price_aoa: formData.price_aoa,
        level: formData.level || null,
        category: formData.category || null,
        image_url: formData.image_url || null,
        modules: formData.modules || 1,
      };

      if (editingCourse) {
        const { error } = await supabase
          .from('courses')
          .update(payload)
          .eq('id', editingCourse.id);
        if (error) throw error;
        toast.success('Curso atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('courses')
          .insert(payload);
        if (error) throw error;
        toast.success('Curso criado com sucesso!');
      }

      setIsDialogOpen(false);
      fetchCourses();
      onUpdate();
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este curso?')) return;

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Curso excluído com sucesso!');
      fetchCourses();
      onUpdate();
    } catch (error: any) {
      toast.error('Erro ao excluir: ' + error.message);
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestão de Cursos</CardTitle>
            <CardDescription>Crie e gerencie cursos online</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Curso
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCourse ? 'Editar Curso' : 'Novo Curso'}
                </DialogTitle>
                <DialogDescription>
                  Preencha as informações do curso
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Marketing Digital Completo"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descrição do curso..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Input
                      id="category"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Ex: Marketing Digital"
                    />
                  </div>
                  <div>
                    <Label htmlFor="level">Nível</Label>
                    <Select
                      value={formData.level || 'Iniciante'}
                      onValueChange={(value) => setFormData({ ...formData, level: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Iniciante">Iniciante</SelectItem>
                        <SelectItem value="Intermediário">Intermediário</SelectItem>
                        <SelectItem value="Avançado">Avançado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="price">Preço (AOA) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price_aoa}
                      onChange={(e) => setFormData({ ...formData, price_aoa: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duração (horas)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration_hours || ''}
                      onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value ? Number(e.target.value) : null })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="modules">Módulos</Label>
                    <Input
                      id="modules"
                      type="number"
                      value={formData.modules || 1}
                      onChange={(e) => setFormData({ ...formData, modules: Number(e.target.value) })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="image_url">URL da Imagem</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url || ''}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      A salvar...
                    </>
                  ) : (
                    'Salvar'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum curso cadastrado. Crie o primeiro curso!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Curso</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Inscritos</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {course.image_url && (
                          <img
                            src={course.image_url}
                            alt={course.title}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{course.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {course.modules} módulo{course.modules !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{course.category || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{course.level}</Badge>
                    </TableCell>
                    <TableCell>
                      {course.duration_hours ? (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          {course.duration_hours}h
                        </div>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="font-medium">{formatPrice(course.price_aoa)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        {enrollmentCounts[course.id] || 0}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(course)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(course.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};