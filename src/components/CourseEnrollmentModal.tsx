import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CreditCard, Clock, BookOpen } from 'lucide-react';

interface CourseEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    id: string;
    title: string;
    price_aoa: number;
    duration_hours: number;
    modules: number;
  } | null;
}

export const CourseEnrollmentModal: React.FC<CourseEnrollmentModalProps> = ({
  isOpen,
  onClose,
  course,
}) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleEnroll = async () => {
    if (!user || !course) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('course_enrollments')
        .insert({
          user_id: user.id,
          course_id: course.id,
          payment_amount: course.price_aoa,
          payment_reference: paymentReference || null,
          payment_status: 'pending',
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Já inscrito',
            description: 'Você já está inscrito neste curso.',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: 'Inscrição realizada!',
          description: 'Sua inscrição foi recebida. Aguarde a confirmação do pagamento para aceder ao curso.',
        });
        onClose();
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao processar sua inscrição.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!course) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">
            Inscrição no Curso
          </DialogTitle>
          <DialogDescription>
            {course.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Course Summary */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Curso</span>
              <span className="font-medium text-right max-w-[200px] truncate">{course.title}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Duração
              </span>
              <span className="font-medium">{course.duration_hours} horas</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Módulos
              </span>
              <span className="font-medium">{course.modules} módulos</span>
            </div>
            <div className="border-t border-border pt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(course.price_aoa)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground text-right mt-1">
                ou 12x de {formatPrice(course.price_aoa / 12)}
              </p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Método de Pagamento
            </Label>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="font-medium mb-2">Multicaixa Express</p>
              <p className="text-sm text-muted-foreground">
                Efetue o pagamento via Multicaixa Express e insira a referência abaixo.
              </p>
            </div>
          </div>

          {/* Payment Reference */}
          <div className="space-y-2">
            <Label htmlFor="reference">Referência de Pagamento (opcional)</Label>
            <Input
              id="reference"
              placeholder="Ex: 123456789"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Pode adicionar a referência agora ou mais tarde após efetuar o pagamento.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            variant="ju10"
            onClick={handleEnroll}
            disabled={loading || !user}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                A processar...
              </>
            ) : (
              'Confirmar Inscrição'
            )}
          </Button>
        </div>

        {!user && (
          <p className="text-center text-sm text-muted-foreground">
            Precisa estar autenticado para se inscrever.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};
