import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  User, 
  BookOpen,
  Shield,
  Share2,
  Download,
  Loader2,
  ExternalLink,
  QrCode
} from 'lucide-react';
import d1000Logo from '@/assets/d1000-logo.jpg';

interface CertificateData {
  id: string;
  certificate_code: string;
  issued_at: string;
  badge_type: string;
  skills: string[];
  issuer_name: string;
  is_public: boolean;
  share_count: number;
  user: {
    full_name: string;
    avatar_url: string;
  };
  course?: {
    title: string;
    category: string;
    duration_hours: number;
  };
  class_group?: {
    title: string;
  };
}

const CertificateVerification = () => {
  const { code } = useParams<{ code: string }>();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationLogged, setVerificationLogged] = useState(false);

  useEffect(() => {
    if (code) {
      verifyCertificate(code);
    }
  }, [code]);

  const verifyCertificate = async (certificateCode: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch certificate with related data
      const { data, error: fetchError } = await supabase
        .from('certificates')
        .select(`
          *,
          courses:course_id (title, category, duration_hours),
          class_groups:class_group_id (title)
        `)
        .eq('certificate_code', certificateCode)
        .single();

      if (fetchError || !data) {
        setError('Certificado não encontrado. Verifique o código e tente novamente.');
        return;
      }

      // Check if certificate is public
      if (data.is_public === false) {
        setError('Este certificado não está disponível para verificação pública.');
        return;
      }

      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', data.user_id)
        .single();

      setCertificate({
        ...data,
        user: profile || { full_name: 'Aluno D1000', avatar_url: null },
        course: data.courses,
        class_group: data.class_groups,
      });

      // Log verification (only once)
      if (!verificationLogged) {
        await supabase.from('certificate_verifications').insert({
          certificate_id: data.id,
        });
        setVerificationLogged(true);
      }

    } catch (err) {
      console.error('Error verifying certificate:', err);
      setError('Erro ao verificar certificado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: `Certificado D1000 - ${certificate?.user.full_name}`,
        text: `Verifique o certificado de conclusão de ${certificate?.course?.title || certificate?.class_group?.title}`,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copiado para a área de transferência!');
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'excellence': return 'bg-gradient-to-r from-yellow-400 to-amber-500';
      case 'specialist': return 'bg-gradient-to-r from-purple-500 to-indigo-600';
      default: return 'bg-gradient-to-r from-primary to-orange-500';
    }
  };

  const getBadgeLabel = (type: string) => {
    switch (type) {
      case 'excellence': return 'Excelência';
      case 'specialist': return 'Especialista';
      default: return 'Conclusão';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={certificate ? `Certificado de ${certificate.user.full_name} | D1000` : 'Verificar Certificado | D1000'}
        description="Verifique a autenticidade de certificados emitidos pela D1000 Formações."
      />
      
      <Navbar />
      
      <main className="pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Verificando certificado...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold mb-3 text-red-600">Verificação Falhou</h1>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">{error}</p>
              <Button asChild variant="outline">
                <Link to="/">Voltar ao Início</Link>
              </Button>
            </div>
          ) : certificate && (
            <>
              {/* Verification Badge */}
              <div className="flex items-center justify-center gap-3 mb-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <span className="font-semibold text-green-700 dark:text-green-400">
                  Certificado Autêntico e Verificado
                </span>
                <Shield className="w-5 h-5 text-green-600" />
              </div>

              {/* Certificate Card */}
              <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className={`${getBadgeColor(certificate.badge_type || 'completion')} p-8 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                  
                  <div className="relative z-10 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <img 
                          src={d1000Logo} 
                          alt="D1000" 
                          className="h-12 w-12 rounded-xl bg-white shadow-lg"
                        />
                        <div>
                          <p className="text-white/80 text-sm">D1000 Formações</p>
                          <p className="font-bold text-lg">Certificado de {getBadgeLabel(certificate.badge_type || 'completion')}</p>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-white/20 text-white border-white/30">
                      <QrCode className="w-3 h-3 mr-1" />
                      {certificate.certificate_code}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  {/* Recipient */}
                  <div className="text-center mb-8">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                      Certificamos que
                    </p>
                    <h1 className="text-3xl md:text-4xl font-black text-foreground mb-2">
                      {certificate.user.full_name}
                    </h1>
                  </div>

                  {/* Course/Class Info */}
                  <div className="bg-muted/50 rounded-2xl p-6 mb-8">
                    <p className="text-sm text-muted-foreground mb-2">Concluiu com sucesso</p>
                    <h2 className="text-xl font-bold text-foreground mb-4">
                      {certificate.course?.title || certificate.class_group?.title}
                    </h2>
                    
                    <div className="flex flex-wrap gap-4 text-sm">
                      {certificate.course?.category && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <BookOpen className="w-4 h-4" />
                          {certificate.course.category}
                        </div>
                      )}
                      {certificate.course?.duration_hours && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Award className="w-4 h-4" />
                          {certificate.course.duration_hours} horas
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date(certificate.issued_at).toLocaleDateString('pt-AO', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  {certificate.skills && certificate.skills.length > 0 && (
                    <div className="mb-8">
                      <p className="text-sm text-muted-foreground mb-3">Competências adquiridas:</p>
                      <div className="flex flex-wrap gap-2">
                        {certificate.skills.map((skill, i) => (
                          <Badge key={i} variant="secondary" className="text-sm py-1 px-3">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-4 pt-6 border-t border-border">
                    <Button onClick={handleShare} variant="outline" className="flex-1 min-w-[140px]">
                      <Share2 className="w-4 h-4 mr-2" />
                      Partilhar
                    </Button>
                    {certificate.course && (
                      <Button asChild variant="ju10" className="flex-1 min-w-[140px]">
                        <Link to="/formacoes">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Ver Formações
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-muted/30 px-8 py-4 text-center text-sm text-muted-foreground">
                  <p>
                    Este certificado foi emitido por{' '}
                    <strong className="text-foreground">{certificate.issuer_name || 'D1000 Formações'}</strong>
                    {' '}e pode ser verificado a qualquer momento nesta página.
                  </p>
                </div>
              </div>

              {/* Verification Info */}
              <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>
                  Verificações: {certificate.share_count || 0}+ visualizações
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default CertificateVerification;
