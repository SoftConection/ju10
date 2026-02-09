import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Loader2, 
  CreditCard, 
  Copy, 
  CheckCircle2, 
  AlertCircle,
  User,
  Phone,
  Mail,
  Calendar
} from "lucide-react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PROVINCES = [
  "Bengo", "Benguela", "Bié", "Cabinda", "Cuando Cubango", 
  "Cuanza Norte", "Cuanza Sul", "Cunene", "Huambo", "Huíla", 
  "Luanda", "Lunda Norte", "Lunda Sul", "Malanje", "Moxico", 
  "Namibe", "Uíge", "Zaire"
];

const enrollmentSchema = z.object({
  full_name: z.string().min(3, "Nome completo deve ter pelo menos 3 caracteres"),
  phone: z.string().min(9, "Número de telemóvel inválido"),
  birth_date: z.string().min(1, "Data de nascimento é obrigatória"),
  gender: z.string().min(1, "Selecione o género"),
  id_number: z.string().min(5, "Número de bilhete inválido"),
  address: z.string().min(5, "Endereço é obrigatório"),
  city: z.string().min(2, "Cidade é obrigatória"),
  province: z.string().min(1, "Selecione a província"),
  academic_info: z.string().optional(),
  employment_status: z.string().min(1, "Selecione uma opção"),
  job_title: z.string().optional(),
  company: z.string().optional(),
});

type EnrollmentFormData = z.infer<typeof enrollmentSchema>;

interface ClassGroup {
  id: string;
  title: string;
  price_aoa: number;
  schedule: string;
  format: string;
}

interface ClassEnrollmentFormProps {
  classGroup: ClassGroup;
  onSuccess?: () => void;
}

const generatePaymentReference = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `JU10-${timestamp}-${random}`;
};

export const ClassEnrollmentForm = ({ classGroup, onSuccess }: ClassEnrollmentFormProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [hasCompleteProfile, setHasCompleteProfile] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentReference, setPaymentReference] = useState("");
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
  });

  const employmentStatus = watch("employment_status");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error("Precisa estar autenticado para se inscrever");
        navigate("/auth");
        return;
      }

      setUserId(session.user.id);
      setUserEmail(session.user.email || null);

      // Check if profile is complete
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (profile) {
        const isComplete = !!(
          profile.full_name &&
          profile.phone &&
          profile.id_number &&
          profile.birth_date &&
          profile.address &&
          profile.province
        );
        setHasCompleteProfile(isComplete);

        // Pre-fill form with existing data
        reset({
          full_name: profile.full_name || "",
          phone: profile.phone || "",
          birth_date: profile.birth_date || "",
          gender: profile.gender || "",
          id_number: profile.id_number || "",
          address: profile.address || "",
          city: profile.city || "",
          province: profile.province || "",
          academic_info: profile.academic_info || "",
          employment_status: profile.employment_status || "",
          job_title: profile.job_title || "",
          company: profile.company || "",
        });
      }

      setCheckingProfile(false);
    };

    checkAuth();
  }, [navigate, reset]);

  const handleCopyReference = async () => {
    try {
      await navigator.clipboard.writeText(paymentReference);
      setCopied(true);
      toast.success("Referência copiada!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar referência");
    }
  };

  const onSubmit = async (data: EnrollmentFormData) => {
    if (!userId) {
      toast.error("Sessão expirada. Faça login novamente.");
      navigate("/auth");
      return;
    }

    setLoading(true);
    try {
      // Update profile with complete info
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          phone: data.phone,
          birth_date: data.birth_date,
          gender: data.gender,
          id_number: data.id_number,
          address: data.address,
          city: data.city,
          province: data.province,
          academic_info: data.academic_info || null,
          employment_status: data.employment_status,
          job_title: data.job_title || null,
          company: data.company || null,
        })
        .eq("user_id", userId);

      if (profileError) throw profileError;

      // Generate payment reference
      const reference = generatePaymentReference();
      setPaymentReference(reference);

      // Create enrollment with pending payment
      const { error: enrollError } = await supabase
        .from("class_enrollments")
        .insert({
          user_id: userId,
          class_group_id: classGroup.id,
          payment_status: "pending",
          payment_reference: reference,
          payment_amount: classGroup.price_aoa,
          payment_method: "multicaixa_express",
        });

      if (enrollError) {
        if (enrollError.code === "23505") {
          toast.error("Você já está inscrito nesta turma");
          return;
        }
        throw enrollError;
      }

      setShowPaymentDialog(true);
    } catch (error: any) {
      toast.error("Erro ao processar inscrição: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (checkingProfile) {
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
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Inscrição na Turma
          </CardTitle>
          <CardDescription>
            Preencha seus dados para se inscrever em <strong>{classGroup.title}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Price Summary */}
          <div className="bg-secondary/50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Valor da inscrição</p>
                <p className="text-2xl font-bold text-primary">
                  {formatPrice(classGroup.price_aoa)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Método de pagamento</p>
                <p className="font-medium">Multicaixa Express</p>
              </div>
            </div>
          </div>

          {hasCompleteProfile && (
            <Alert className="mb-6 bg-primary/10 border-primary/20">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertDescription>
                Seus dados já estão preenchidos. Verifique se estão correctos antes de continuar.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Info */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <User className="w-4 h-4" />
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
                  <Label htmlFor="birth_date">Data de Nascimento *</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    {...register("birth_date")}
                  />
                  {errors.birth_date && (
                    <p className="text-destructive text-sm mt-1">{errors.birth_date.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="gender">Género *</Label>
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
                {errors.gender && (
                  <p className="text-destructive text-sm mt-1">{errors.gender.message}</p>
                )}
              </div>

              {userEmail && (
                <div>
                  <Label>Email</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{userEmail}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Address Info */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Endereço
              </h4>
              
              <div>
                <Label htmlFor="address">Endereço Completo *</Label>
                <Textarea
                  id="address"
                  {...register("address")}
                  placeholder="Rua, número, bairro..."
                  rows={2}
                />
                {errors.address && (
                  <p className="text-destructive text-sm mt-1">{errors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Cidade/Município *</Label>
                  <Input
                    id="city"
                    {...register("city")}
                    placeholder="Ex: Luanda"
                  />
                  {errors.city && (
                    <p className="text-destructive text-sm mt-1">{errors.city.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="province">Província *</Label>
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
                  {errors.province && (
                    <p className="text-destructive text-sm mt-1">{errors.province.message}</p>
                  )}
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

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  A processar...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Confirmar Inscrição - {formatPrice(classGroup.price_aoa)}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Payment Instructions Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <CheckCircle2 className="w-5 h-5" />
              Inscrição Registada!
            </DialogTitle>
            <DialogDescription>
              Complete o pagamento via Multicaixa Express para confirmar sua inscrição.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Payment Reference */}
            <div className="bg-secondary/50 rounded-xl p-4 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Referência de Pagamento</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-background p-3 rounded-lg font-mono text-lg font-bold">
                    {paymentReference}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyReference}
                  >
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Valor a Pagar</p>
                <p className="text-2xl font-bold text-primary">
                  {formatPrice(classGroup.price_aoa)}
                </p>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-3">
              <h4 className="font-medium">Como pagar:</h4>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  Abra a app do Multicaixa Express
                </li>
                <li className="flex gap-2">
                  <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  Selecione "Pagamento de Serviços"
                </li>
                <li className="flex gap-2">
                  <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  Insira a referência acima
                </li>
                <li className="flex gap-2">
                  <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
                  Confirme o pagamento
                </li>
              </ol>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Após o pagamento, receberá um email de confirmação em até 24 horas úteis.
              </AlertDescription>
            </Alert>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowPaymentDialog(false);
                navigate("/dashboard");
              }}
            >
              Ir para Dashboard
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                setShowPaymentDialog(false);
                onSuccess?.();
              }}
            >
              Concluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};