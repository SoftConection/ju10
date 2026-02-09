import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2,
  Users,
  BookOpen,
  Video,
  FileText,
  ChevronDown,
  GripVertical
} from 'lucide-react';
import { toast } from 'sonner';

interface Mentorship {
  id: string;
  title: string;
  description: string | null;
  mentor_id: string;
  price_aoa: number;
  duration_weeks: number;
  max_students: number;
  category: string | null;
  image_url: string | null;
  is_active: boolean;
}

interface Lesson {
  id: string;
  mentorship_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  content: string | null;
  order_index: number;
  duration_minutes: number | null;
}

interface Material {
  id: string;
  mentorship_id: string;
  lesson_id: string | null;
  title: string;
  description: string | null;
  file_url: string | null;
  file_type: string | null;
}

interface AdminMentorshipsTabProps {
  onUpdate: () => void;
}

const emptyMentorship = {
  title: '',
  description: '',
  mentor_id: '',
  price_aoa: 0,
  duration_weeks: 4,
  max_students: 10,
  category: '',
  image_url: '',
  is_active: true,
};

const emptyLesson = {
  title: '',
  description: '',
  video_url: '',
  content: '',
  order_index: 0,
  duration_minutes: 30,
};

const emptyMaterial = {
  title: '',
  description: '',
  file_url: '',
  file_type: '',
  lesson_id: null as string | null,
};

export const AdminMentorshipsTab = ({ onUpdate }: AdminMentorshipsTabProps) => {
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
  const [materials, setMaterials] = useState<Record<string, Material[]>>({});
  const [enrollmentCounts, setEnrollmentCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Mentorship dialog
  const [isMentorshipDialogOpen, setIsMentorshipDialogOpen] = useState(false);
  const [editingMentorship, setEditingMentorship] = useState<Mentorship | null>(null);
  const [mentorshipForm, setMentorshipForm] = useState(emptyMentorship);
  
  // Lesson dialog
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonForm, setLessonForm] = useState(emptyLesson);
  const [currentMentorshipId, setCurrentMentorshipId] = useState<string | null>(null);
  
  // Material dialog
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [materialForm, setMaterialForm] = useState(emptyMaterial);

  // Current user (for mentor_id)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user?.id || null);
    };
    getUser();
    fetchMentorships();
  }, []);

  const fetchMentorships = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mentorships')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMentorships(data || []);

      // Fetch lessons, materials, and enrollment counts for each mentorship
      if (data) {
        const lessonMap: Record<string, Lesson[]> = {};
        const materialMap: Record<string, Material[]> = {};
        const countMap: Record<string, number> = {};

        for (const m of data) {
          // Lessons
          const { data: lessonData } = await supabase
            .from('mentorship_lessons')
            .select('*')
            .eq('mentorship_id', m.id)
            .order('order_index');
          lessonMap[m.id] = lessonData || [];

          // Materials
          const { data: materialData } = await supabase
            .from('mentorship_materials')
            .select('*')
            .eq('mentorship_id', m.id)
            .order('created_at');
          materialMap[m.id] = materialData || [];

          // Enrollment count
          const { count } = await supabase
            .from('mentorship_enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('mentorship_id', m.id);
          countMap[m.id] = count || 0;
        }

        setLessons(lessonMap);
        setMaterials(materialMap);
        setEnrollmentCounts(countMap);
      }
    } catch (error: any) {
      toast.error('Erro ao carregar mentorias: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Mentorship CRUD
  const handleOpenMentorshipDialog = (mentorship?: Mentorship) => {
    if (mentorship) {
      setEditingMentorship(mentorship);
      setMentorshipForm({
        title: mentorship.title,
        description: mentorship.description || '',
        mentor_id: mentorship.mentor_id,
        price_aoa: mentorship.price_aoa,
        duration_weeks: mentorship.duration_weeks,
        max_students: mentorship.max_students,
        category: mentorship.category || '',
        image_url: mentorship.image_url || '',
        is_active: mentorship.is_active,
      });
    } else {
      setEditingMentorship(null);
      setMentorshipForm({ ...emptyMentorship, mentor_id: currentUserId || '' });
    }
    setIsMentorshipDialogOpen(true);
  };

  const handleSaveMentorship = async () => {
    if (!mentorshipForm.title) {
      toast.error('Preencha o título');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: mentorshipForm.title,
        description: mentorshipForm.description || null,
        mentor_id: mentorshipForm.mentor_id || currentUserId,
        price_aoa: mentorshipForm.price_aoa,
        duration_weeks: mentorshipForm.duration_weeks,
        max_students: mentorshipForm.max_students,
        category: mentorshipForm.category || null,
        image_url: mentorshipForm.image_url || null,
        is_active: mentorshipForm.is_active,
      };

      if (editingMentorship) {
        const { error } = await supabase
          .from('mentorships')
          .update(payload)
          .eq('id', editingMentorship.id);
        if (error) throw error;
        toast.success('Mentoria atualizada!');
      } else {
        const { error } = await supabase
          .from('mentorships')
          .insert(payload);
        if (error) throw error;
        toast.success('Mentoria criada!');
      }

      setIsMentorshipDialogOpen(false);
      fetchMentorships();
      onUpdate();
    } catch (error: any) {
      toast.error('Erro: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMentorship = async (id: string) => {
    if (!confirm('Excluir esta mentoria? Todas as aulas e materiais serão removidos.')) return;

    try {
      const { error } = await supabase.from('mentorships').delete().eq('id', id);
      if (error) throw error;
      toast.success('Mentoria excluída!');
      fetchMentorships();
      onUpdate();
    } catch (error: any) {
      toast.error('Erro: ' + error.message);
    }
  };

  // Lesson CRUD
  const handleOpenLessonDialog = (mentorshipId: string, lesson?: Lesson) => {
    setCurrentMentorshipId(mentorshipId);
    if (lesson) {
      setEditingLesson(lesson);
      setLessonForm({
        title: lesson.title,
        description: lesson.description || '',
        video_url: lesson.video_url || '',
        content: lesson.content || '',
        order_index: lesson.order_index,
        duration_minutes: lesson.duration_minutes || 30,
      });
    } else {
      setEditingLesson(null);
      const existingLessons = lessons[mentorshipId] || [];
      setLessonForm({
        ...emptyLesson,
        order_index: existingLessons.length,
      });
    }
    setIsLessonDialogOpen(true);
  };

  const handleSaveLesson = async () => {
    if (!lessonForm.title || !currentMentorshipId) {
      toast.error('Preencha o título');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        mentorship_id: currentMentorshipId,
        title: lessonForm.title,
        description: lessonForm.description || null,
        video_url: lessonForm.video_url || null,
        content: lessonForm.content || null,
        order_index: lessonForm.order_index,
        duration_minutes: lessonForm.duration_minutes || null,
      };

      if (editingLesson) {
        const { error } = await supabase
          .from('mentorship_lessons')
          .update(payload)
          .eq('id', editingLesson.id);
        if (error) throw error;
        toast.success('Aula atualizada!');
      } else {
        const { error } = await supabase
          .from('mentorship_lessons')
          .insert(payload);
        if (error) throw error;
        toast.success('Aula criada!');
      }

      setIsLessonDialogOpen(false);
      fetchMentorships();
    } catch (error: any) {
      toast.error('Erro: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm('Excluir esta aula?')) return;

    try {
      const { error } = await supabase.from('mentorship_lessons').delete().eq('id', id);
      if (error) throw error;
      toast.success('Aula excluída!');
      fetchMentorships();
    } catch (error: any) {
      toast.error('Erro: ' + error.message);
    }
  };

  // Material CRUD
  const handleOpenMaterialDialog = (mentorshipId: string, material?: Material) => {
    setCurrentMentorshipId(mentorshipId);
    if (material) {
      setEditingMaterial(material);
      setMaterialForm({
        title: material.title,
        description: material.description || '',
        file_url: material.file_url || '',
        file_type: material.file_type || '',
        lesson_id: material.lesson_id,
      });
    } else {
      setEditingMaterial(null);
      setMaterialForm(emptyMaterial);
    }
    setIsMaterialDialogOpen(true);
  };

  const handleSaveMaterial = async () => {
    if (!materialForm.title || !currentMentorshipId) {
      toast.error('Preencha o título');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        mentorship_id: currentMentorshipId,
        title: materialForm.title,
        description: materialForm.description || null,
        file_url: materialForm.file_url || null,
        file_type: materialForm.file_type || null,
        lesson_id: materialForm.lesson_id || null,
      };

      if (editingMaterial) {
        const { error } = await supabase
          .from('mentorship_materials')
          .update(payload)
          .eq('id', editingMaterial.id);
        if (error) throw error;
        toast.success('Material atualizado!');
      } else {
        const { error } = await supabase
          .from('mentorship_materials')
          .insert(payload);
        if (error) throw error;
        toast.success('Material adicionado!');
      }

      setIsMaterialDialogOpen(false);
      fetchMentorships();
    } catch (error: any) {
      toast.error('Erro: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm('Excluir este material?')) return;

    try {
      const { error } = await supabase.from('mentorship_materials').delete().eq('id', id);
      if (error) throw error;
      toast.success('Material excluído!');
      fetchMentorships();
    } catch (error: any) {
      toast.error('Erro: ' + error.message);
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
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestão de Mentorias</CardTitle>
              <CardDescription>Crie e gerencie mentorias, aulas e materiais</CardDescription>
            </div>
            <Button onClick={() => handleOpenMentorshipDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Mentoria
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {mentorships.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhuma mentoria cadastrada. Crie a primeira!
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-4">
              {mentorships.map((m) => (
                <AccordionItem key={m.id} value={m.id} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-left">{m.title}</span>
                            {!m.is_active && (
                              <Badge variant="secondary">Inativa</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{m.duration_weeks} semanas</span>
                            <span>{formatPrice(m.price_aoa)}</span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {enrollmentCounts[m.id] || 0}/{m.max_students}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-4 space-y-6">
                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenMentorshipDialog(m)}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Editar Mentoria
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenLessonDialog(m.id)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Aula
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenMaterialDialog(m.id)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Material
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive ml-auto"
                          onClick={() => handleDeleteMentorship(m.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </Button>
                      </div>

                      {/* Lessons */}
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Video className="w-4 h-4" />
                          Aulas ({lessons[m.id]?.length || 0})
                        </h4>
                        {lessons[m.id]?.length > 0 ? (
                          <div className="space-y-2">
                            {lessons[m.id].map((lesson, idx) => (
                              <div
                                key={lesson.id}
                                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">
                                    {idx + 1}
                                  </span>
                                  <div>
                                    <p className="font-medium text-sm">{lesson.title}</p>
                                    {lesson.duration_minutes && (
                                      <p className="text-xs text-muted-foreground">
                                        {lesson.duration_minutes} min
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleOpenLessonDialog(m.id, lesson)}
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive"
                                    onClick={() => handleDeleteLesson(lesson.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Nenhuma aula adicionada</p>
                        )}
                      </div>

                      {/* Materials */}
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Materiais ({materials[m.id]?.length || 0})
                        </h4>
                        {materials[m.id]?.length > 0 ? (
                          <div className="space-y-2">
                            {materials[m.id].map((material) => (
                              <div
                                key={material.id}
                                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <FileText className="w-4 h-4 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium text-sm">{material.title}</p>
                                    {material.file_type && (
                                      <Badge variant="outline" className="text-xs mt-1">
                                        {material.file_type.toUpperCase()}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleOpenMaterialDialog(m.id, material)}
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive"
                                    onClick={() => handleDeleteMaterial(material.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Nenhum material adicionado</p>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Mentorship Dialog */}
      <Dialog open={isMentorshipDialogOpen} onOpenChange={setIsMentorshipDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMentorship ? 'Editar Mentoria' : 'Nova Mentoria'}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações da mentoria
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="m-title">Título *</Label>
                <Input
                  id="m-title"
                  value={mentorshipForm.title}
                  onChange={(e) => setMentorshipForm({ ...mentorshipForm, title: e.target.value })}
                  placeholder="Ex: Mentoria em Marketing Digital"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="m-description">Descrição</Label>
                <Textarea
                  id="m-description"
                  value={mentorshipForm.description}
                  onChange={(e) => setMentorshipForm({ ...mentorshipForm, description: e.target.value })}
                  placeholder="Descrição da mentoria..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="m-price">Preço (AOA) *</Label>
                <Input
                  id="m-price"
                  type="number"
                  value={mentorshipForm.price_aoa}
                  onChange={(e) => setMentorshipForm({ ...mentorshipForm, price_aoa: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="m-duration">Duração (semanas)</Label>
                <Input
                  id="m-duration"
                  type="number"
                  value={mentorshipForm.duration_weeks}
                  onChange={(e) => setMentorshipForm({ ...mentorshipForm, duration_weeks: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="m-max">Máx. Alunos</Label>
                <Input
                  id="m-max"
                  type="number"
                  value={mentorshipForm.max_students}
                  onChange={(e) => setMentorshipForm({ ...mentorshipForm, max_students: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="m-category">Categoria</Label>
                <Input
                  id="m-category"
                  value={mentorshipForm.category}
                  onChange={(e) => setMentorshipForm({ ...mentorshipForm, category: e.target.value })}
                  placeholder="Ex: Marketing Digital"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="m-image">URL da Imagem</Label>
                <Input
                  id="m-image"
                  value={mentorshipForm.image_url}
                  onChange={(e) => setMentorshipForm({ ...mentorshipForm, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <Switch
                  id="m-active"
                  checked={mentorshipForm.is_active}
                  onCheckedChange={(checked) => setMentorshipForm({ ...mentorshipForm, is_active: checked })}
                />
                <Label htmlFor="m-active">Mentoria ativa</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMentorshipDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveMentorship} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? 'Editar Aula' : 'Nova Aula'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="l-title">Título *</Label>
              <Input
                id="l-title"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                placeholder="Ex: Introdução ao Marketing"
              />
            </div>
            <div>
              <Label htmlFor="l-description">Descrição</Label>
              <Textarea
                id="l-description"
                value={lessonForm.description}
                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                placeholder="Descrição da aula..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="l-video">URL do Vídeo</Label>
                <Input
                  id="l-video"
                  value={lessonForm.video_url}
                  onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                  placeholder="https://youtube.com/embed/..."
                />
              </div>
              <div>
                <Label htmlFor="l-duration">Duração (minutos)</Label>
                <Input
                  id="l-duration"
                  type="number"
                  value={lessonForm.duration_minutes}
                  onChange={(e) => setLessonForm({ ...lessonForm, duration_minutes: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="l-content">Conteúdo (HTML)</Label>
              <Textarea
                id="l-content"
                value={lessonForm.content}
                onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                placeholder="<p>Conteúdo da aula...</p>"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="l-order">Ordem</Label>
              <Input
                id="l-order"
                type="number"
                value={lessonForm.order_index}
                onChange={(e) => setLessonForm({ ...lessonForm, order_index: Number(e.target.value) })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLessonDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveLesson} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Material Dialog */}
      <Dialog open={isMaterialDialogOpen} onOpenChange={setIsMaterialDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMaterial ? 'Editar Material' : 'Novo Material'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="mat-title">Título *</Label>
              <Input
                id="mat-title"
                value={materialForm.title}
                onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                placeholder="Ex: Ebook de Marketing"
              />
            </div>
            <div>
              <Label htmlFor="mat-description">Descrição</Label>
              <Textarea
                id="mat-description"
                value={materialForm.description}
                onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                placeholder="Descrição do material..."
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="mat-url">URL do Arquivo</Label>
              <Input
                id="mat-url"
                value={materialForm.file_url}
                onChange={(e) => setMaterialForm({ ...materialForm, file_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="mat-type">Tipo de Arquivo</Label>
              <Input
                id="mat-type"
                value={materialForm.file_type}
                onChange={(e) => setMaterialForm({ ...materialForm, file_type: e.target.value })}
                placeholder="Ex: pdf, docx, mp4"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMaterialDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveMaterial} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
