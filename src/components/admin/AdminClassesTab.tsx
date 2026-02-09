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
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

interface ClassGroup {
  id: string;
  title: string;
  description: string | null;
  schedule: string;
  format: string;
  price_aoa: number;
  spots: number;
  start_date: string | null;
  end_date: string | null;
  instructor: string | null;
  topics: string[] | null;
}

interface AdminClassesTabProps {
  onUpdate: () => void;
}

const emptyClass: Omit<ClassGroup, 'id'> = {
  title: '',
  description: '',
  schedule: '',
  format: 'Online',
  price_aoa: 0,
  spots: 25,
  start_date: null,
  end_date: null,
  instructor: '',
  topics: [],
};

export const AdminClassesTab = ({ onUpdate }: AdminClassesTabProps) => {
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassGroup | null>(null);
  const [formData, setFormData] = useState(emptyClass);
  const [topicsInput, setTopicsInput] = useState('');
  const [enrollmentCounts, setEnrollmentCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('class_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClasses(data || []);

      // Fetch enrollment counts
      if (data) {
        const counts: Record<string, number> = {};
        for (const cg of data) {
          const { count } = await supabase
            .from('class_enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('class_group_id', cg.id);
          counts[cg.id] = count || 0;
        }
        setEnrollmentCounts(counts);
      }
    } catch (error: any) {
      toast.error('Erro ao carregar turmas: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (classGroup?: ClassGroup) => {
    if (classGroup) {
      setEditingClass(classGroup);
      setFormData({
        title: classGroup.title,
        description: classGroup.description || '',
        schedule: classGroup.schedule,
        format: classGroup.format,
        price_aoa: classGroup.price_aoa,
        spots: classGroup.spots,
        start_date: classGroup.start_date,
        end_date: classGroup.end_date,
        instructor: classGroup.instructor || '',
        topics: classGroup.topics || [],
      });
      setTopicsInput(classGroup.topics?.join(', ') || '');
    } else {
      setEditingClass(null);
      setFormData(emptyClass);
      setTopicsInput('');
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.schedule) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    setSaving(true);
    try {
      const topics = topicsInput
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const payload = {
        title: formData.title,
        description: formData.description || null,
        schedule: formData.schedule,
        format: formData.format,
        price_aoa: formData.price_aoa,
        spots: formData.spots,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        instructor: formData.instructor || null,
        topics: topics.length > 0 ? topics : null,
      };

      if (editingClass) {
        const { error } = await supabase
          .from('class_groups')
          .update(payload)
          .eq('id', editingClass.id);
        if (error) throw error;
        toast.success('Turma atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('class_groups')
          .insert(payload);
        if (error) throw error;
        toast.success('Turma criada com sucesso!');
      }

      setIsDialogOpen(false);
      fetchClasses();
      onUpdate();
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta turma?')) return;

    try {
      const { error } = await supabase
        .from('class_groups')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Turma excluída com sucesso!');
      fetchClasses();
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('pt-BR');
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
            <CardTitle>Gestão de Turmas</CardTitle>
            <CardDescription>Crie e gerencie turmas de formação</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Turma
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingClass ? 'Editar Turma' : 'Nova Turma'}
                </DialogTitle>
                <DialogDescription>
                  Preencha as informações da turma
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
                      placeholder="Ex: Marketing Digital Intensivo"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descrição da turma..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="schedule">Horário *</Label>
                    <Input
                      id="schedule"
                      value={formData.schedule}
                      onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                      placeholder="Ex: Terças e Quintas, 19h às 21h"
                    />
                  </div>
                  <div>
                    <Label htmlFor="format">Formato</Label>
                    <Select
                      value={formData.format}
                      onValueChange={(value) => setFormData({ ...formData, format: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Online">Online</SelectItem>
                        <SelectItem value="Presencial">Presencial</SelectItem>
                        <SelectItem value="Híbrido">Híbrido</SelectItem>
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
                    <Label htmlFor="spots">Vagas</Label>
                    <Input
                      id="spots"
                      type="number"
                      value={formData.spots}
                      onChange={(e) => setFormData({ ...formData, spots: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="start_date">Data de Início</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date || ''}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value || null })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">Data de Fim</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date || ''}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value || null })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="instructor">Instrutor</Label>
                    <Input
                      id="instructor"
                      value={formData.instructor || ''}
                      onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                      placeholder="Ex: Equipe JU10"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="topics">Tópicos (separados por vírgula)</Label>
                    <Input
                      id="topics"
                      value={topicsInput}
                      onChange={(e) => setTopicsInput(e.target.value)}
                      placeholder="Ex: SEO, Redes Sociais, Tráfego Pago"
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
        {classes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Nenhuma turma cadastrada. Crie a primeira turma!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Turma</TableHead>
                  <TableHead>Formato</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Inscritos</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((cg) => (
                  <TableRow key={cg.id}>
                    <TableCell>
                      <div className="font-medium">{cg.title}</div>
                      {cg.instructor && (
                        <div className="text-xs text-muted-foreground">
                          Por {cg.instructor}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{cg.format}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{cg.schedule}</TableCell>
                    <TableCell>{formatDate(cg.start_date)}</TableCell>
                    <TableCell className="font-medium">{formatPrice(cg.price_aoa)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        {enrollmentCounts[cg.id] || 0}/{cg.spots}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(cg)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(cg.id)}
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