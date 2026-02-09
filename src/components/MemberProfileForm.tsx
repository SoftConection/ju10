import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save, User, Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PROVINCES = [
  "Bengo", "Benguela", "Bié", "Cabinda", "Cuando Cubango", 
  "Cuanza Norte", "Cuanza Sul", "Cunene", "Huambo", "Huíla", 
  "Luanda", "Lunda Norte", "Lunda Sul", "Malanje", "Moxico", 
  "Namibe", "Uíge", "Zaire"
];

const profileSchema = z.object({
  full_name: z.string().min(3, "Nome completo deve ter pelo menos 3 caracteres"),
  display_name: z.string().min(2, "Nome de exibição deve ter pelo menos 2 caracteres").optional(),
  phone: z.string().min(9, "Número de telemóvel inválido"),
  birth_date: z.string().optional(),
  gender: z.string().optional(),
  id_number: z.string().min(5, "Número de bilhete inválido"),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  academic_info: z.string().optional(),
  employment_status: z.string().min(1, "Selecione uma opção"),
  job_title: z.string().optional(),
  company: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface MemberProfileFormProps {
  userId: string;
  onComplete?: () => void;
  compact?: boolean;
}

export const MemberProfileForm = ({ userId, onComplete, compact = false }: MemberProfileFormProps) => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const employmentStatus = watch("employment_status");

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (data) {
        reset({
          full_name: data.full_name || "",
          display_name: data.display_name || "",
          phone: data.phone || "",
          birth_date: data.birth_date || "",
          gender: data.gender || "",
          id_number: data.id_number || "",
          address: data.address || "",
          city: data.city || "",
          province: data.province || "",
          academic_info: data.academic_info || "",
          employment_status: data.employment_status || "",
          job_title: data.job_title || "",
          company: data.company || "",
        });
        setAvatarUrl(data.avatar_url);
      }
      setInitialLoading(false);
    };

    fetchProfile();
  }, [userId, reset]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Por favor selecione uma imagem válida");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success("Foto de perfil atualizada!");
    } catch (error: any) {
      toast.error("Erro ao carregar foto: " + error.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          display_name: data.display_name,
          phone: data.phone,
          birth_date: data.birth_date || null,
          gender: data.gender || null,
          id_number: data.id_number,
          address: data.address || null,
          city: data.city || null,
          province: data.province || null,
          academic_info: data.academic_info || null,
          employment_status: data.employment_status,
          job_title: data.job_title || null,
          company: data.company || null,
        })
        .eq("user_id", userId);

      if (error) throw error;

      toast.success("Perfil atualizado com sucesso!");
      onComplete?.();
    } catch (error: any) {
      toast.error("Erro ao atualizar perfil: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Informações do Perfil
        </CardTitle>
        <CardDescription>
          Mantenha suas informações atualizadas para participar dos eventos, cursos e turmas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4 pb-6 border-b border-border">
            <div className="relative group">
              <Avatar className="w-24 h-24 border-4 border-primary/20">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {watch("full_name")?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 flex items-center justify-center bg-foreground/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-6 h-6 text-background animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-background" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Carregar Foto
            </Button>
          </div>

          {/* Personal Info */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Informações Pessoais
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Nome Completo *</Label>
                <Input
                  id="full_name"
                  {...register("full_name")}
                  placeholder="Seu nome completo"
                />
                {errors.full_name && (
                  <p className="text-destructive text-sm mt-1">{errors.full_name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="display_name">Nome de Exibição</Label>
                <Input
                  id="display_name"
                  {...register("display_name")}
                  placeholder="Como quer ser chamado"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Telemóvel *</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="+244 9XX XXX XXX"
                />
                {errors.phone && (
                  <p className="text-destructive text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="birth_date">Data de Nascimento</Label>
                <Input
                  id="birth_date"
                  type="date"
                  {...register("birth_date")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gender">Género</Label>
                <Select
                  value={watch("gender")}
                  onValueChange={(value) => setValue("gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Feminino</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                    <SelectItem value="prefer_not_say">Prefiro não dizer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="id_number">Nº de Bilhete de Identidade *</Label>
                <Input
                  id="id_number"
                  {...register("id_number")}
                  placeholder="Número do BI"
                />
                {errors.id_number && (
                  <p className="text-destructive text-sm mt-1">{errors.id_number.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address Info */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Endereço
            </h4>
            
            <div>
              <Label htmlFor="address">Endereço Completo</Label>
              <Textarea
                id="address"
                {...register("address")}
                placeholder="Rua, número, bairro..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Cidade/Município</Label>
                <Input
                  id="city"
                  {...register("city")}
                  placeholder="Ex: Luanda"
                />
              </div>
              <div>
                <Label htmlFor="province">Província</Label>
                <Select
                  value={watch("province")}
                  onValueChange={(value) => setValue("province", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a província" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVINCES.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Academic & Professional Info */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Informações Académicas e Profissionais
            </h4>
            
            <div>
              <Label htmlFor="academic_info">Formação Académica</Label>
              <Input
                id="academic_info"
                {...register("academic_info")}
                placeholder="Ex: Licenciatura em Marketing"
              />
            </div>

            <div>
              <Label htmlFor="employment_status">Situação de Emprego *</Label>
              <Select 
                value={employmentStatus}
                onValueChange={(value) => setValue("employment_status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employed">Empregado(a)</SelectItem>
                  <SelectItem value="self_employed">Trabalhador Independente</SelectItem>
                  <SelectItem value="business_owner">Empresário(a)</SelectItem>
                  <SelectItem value="student">Estudante</SelectItem>
                  <SelectItem value="unemployed">Desempregado(a)</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
              {errors.employment_status && (
                <p className="text-destructive text-sm mt-1">{errors.employment_status.message}</p>
              )}
            </div>

            {(employmentStatus === "employed" || 
              employmentStatus === "self_employed" || 
              employmentStatus === "business_owner") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="job_title">Função/Cargo</Label>
                  <Input
                    id="job_title"
                    {...register("job_title")}
                    placeholder="Ex: Gestor de Marketing"
                  />
                </div>
                <div>
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    {...register("company")}
                    placeholder="Nome da empresa"
                  />
                </div>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full md:w-auto" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                A guardar...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Alterações
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};