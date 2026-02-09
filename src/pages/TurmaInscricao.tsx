import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { SEOHead } from "@/components/SEOHead";
import { ClassEnrollmentForm } from "@/components/ClassEnrollmentForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Users, 
  MapPin,
  Loader2,
  AlertTriangle
} from "lucide-react";

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

const TurmaInscricao = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [classGroup, setClassGroup] = useState<ClassGroup | null>(null);
  const [enrollmentCount, setEnrollmentCount] = useState(0);

  useEffect(() => {
    const fetchClassGroup = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from("class_groups")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          navigate("/turmas");
          return;
        }

        setClassGroup(data);

        // Count enrollments
        const { count } = await supabase
          .from("class_enrollments")
          .select("*", { count: "exact", head: true })
          .eq("class_group_id", id)
          .eq("payment_status", "paid");

        setEnrollmentCount(count || 0);
      } catch (error) {
        console.error("Error fetching class group:", error);
        navigate("/turmas");
      } finally {
        setLoading(false);
      }
    };

    fetchClassGroup();
  }, [id, navigate]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-AO", {
      style: "currency",
      currency: "AOA",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const spotsLeft = classGroup ? classGroup.spots - enrollmentCount : 0;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!classGroup) {
    return null;
  }

  return (
    <>
      <SEOHead
        title={`Inscrição: ${classGroup.title} | JU10`}
        description={classGroup.description || `Inscreva-se na turma ${classGroup.title}`}
      />
      <Navbar />

      <main className="min-h-screen bg-background pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate("/turmas")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Turmas
          </Button>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Class Info Sidebar */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <Badge className="mb-4">{classGroup.format}</Badge>
                  <h1 className="text-2xl font-bold mb-2">{classGroup.title}</h1>
                  {classGroup.instructor && (
                    <p className="text-muted-foreground mb-4">
                      Por {classGroup.instructor}
                    </p>
                  )}

                  {classGroup.description && (
                    <p className="text-sm text-muted-foreground mb-6">
                      {classGroup.description}
                    </p>
                  )}

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{classGroup.schedule}</span>
                    </div>
                    {classGroup.start_date && (
                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>Início: {formatDate(classGroup.start_date)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-sm">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{spotsLeft} vagas restantes</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{classGroup.format}</span>
                    </div>
                  </div>

                  {classGroup.topics && classGroup.topics.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium mb-2">Tópicos</h4>
                      <div className="flex flex-wrap gap-2">
                        {classGroup.topics.map((topic, index) => (
                          <Badge key={index} variant="secondary">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-muted-foreground">Investimento</span>
                      <span className="text-2xl font-bold text-primary">
                        {formatPrice(classGroup.price_aoa)}
                      </span>
                    </div>
                  </div>

                  {spotsLeft <= 5 && spotsLeft > 0 && (
                    <div className="mt-4 flex items-center gap-2 text-yellow-600 bg-yellow-500/10 p-3 rounded-lg">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-medium">Últimas vagas!</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Enrollment Form */}
            <div className="lg:col-span-3">
              <ClassEnrollmentForm
                classGroup={classGroup}
                onSuccess={() => navigate("/dashboard")}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default TurmaInscricao;