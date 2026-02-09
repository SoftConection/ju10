import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, UserPlus, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const externalParticipantSchema = z.object({
  full_name: z.string().min(3, "Nome completo deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(9, "Número de telemóvel inválido"),
  age: z.number().min(16, "Idade mínima é 16 anos").max(120, "Idade inválida"),
  id_number: z.string().min(5, "Número de bilhete inválido"),
  academic_info: z.string().optional(),
  employment_status: z.string().min(1, "Selecione uma opção"),
  job_title: z.string().optional(),
  company: z.string().optional(),
});

type ExternalParticipantForm = z.infer<typeof externalParticipantSchema>;

interface EventExternalRegistrationProps {
  eventId: string;
  eventTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EventExternalRegistration = ({
  eventId,
  eventTitle,
  isOpen,
  onClose,
  onSuccess,
}: EventExternalRegistrationProps) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ExternalParticipantForm>({
    resolver: zodResolver(externalParticipantSchema),
  });

  const employmentStatus = watch("employment_status");

  const onSubmit = async (data: ExternalParticipantForm) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("external_participants").insert({
        event_id: eventId,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        age: data.age,
        id_number: data.id_number,
        academic_info: data.academic_info || null,
        employment_status: data.employment_status,
        job_title: data.job_title || null,
        company: data.company || null,
      });

      if (error) throw error;

      setSuccess(true);
      toast.success("Inscrição realizada com sucesso!");
      setTimeout(() => {
        reset();
        setSuccess(false);
        onSuccess();
        onClose();
      }, 2000);
    } catch (error: any) {
      toast.error("Erro ao realizar inscrição: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {success ? (
          <div className="py-12 text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Inscrição Confirmada!</h3>
            <p className="text-muted-foreground">
              Você receberá um email com os detalhes do evento.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                Inscrição no Evento
              </DialogTitle>
              <DialogDescription>
                Preencha todos os campos para se inscrever em "{eventTitle}"
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              {/* Personal Info */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Informações Pessoais
                </h4>
                
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="seu@email.com"
                    />
                    {errors.email && (
                      <p className="text-destructive text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age">Idade *</Label>
                    <Input
                      id="age"
                      type="number"
                      {...register("age", { valueAsNumber: true })}
                      placeholder="25"
                    />
                    {errors.age && (
                      <p className="text-destructive text-sm mt-1">{errors.age.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="id_number">Nº de Bilhete *</Label>
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
                  <div className="grid grid-cols-2 gap-4">
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

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    A processar...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Confirmar Inscrição
                  </>
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
