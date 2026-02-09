import { useState, useEffect } from "react";
import { Users, UserCheck, ExternalLink, Search, Download, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface MemberRegistration {
  id: string;
  registered_at: string;
  user_id: string;
  profile: {
    full_name: string | null;
    display_name: string | null;
    phone: string | null;
    age: number | null;
    employment_status: string | null;
    job_title: string | null;
    company: string | null;
  } | null;
  email?: string;
}

interface ExternalParticipant {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  age: number;
  id_number: string;
  academic_info: string | null;
  employment_status: string | null;
  job_title: string | null;
  company: string | null;
  registered_at: string;
}

interface EventParticipantsPanelProps {
  eventId: string;
  eventTitle: string;
}

export const EventParticipantsPanel = ({ eventId, eventTitle }: EventParticipantsPanelProps) => {
  const [members, setMembers] = useState<MemberRegistration[]>([]);
  const [externals, setExternals] = useState<ExternalParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchParticipants();
  }, [eventId]);

  const fetchParticipants = async () => {
    setLoading(true);

    // Fetch member registrations
    const { data: registrations } = await supabase
      .from("event_registrations")
      .select(`
        id,
        registered_at,
        user_id
      `)
      .eq("event_id", eventId)
      .order("registered_at", { ascending: false });

    if (registrations) {
      // Fetch profiles for each registration
      const membersWithProfiles = await Promise.all(
        registrations.map(async (reg) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, display_name, phone, age, employment_status, job_title, company")
            .eq("user_id", reg.user_id)
            .maybeSingle();

          return {
            ...reg,
            profile,
          };
        })
      );
      setMembers(membersWithProfiles);
    }

    // Fetch external participants
    const { data: externalData } = await supabase
      .from("external_participants")
      .select("*")
      .eq("event_id", eventId)
      .order("registered_at", { ascending: false });

    if (externalData) {
      setExternals(externalData);
    }

    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d MMM yyyy, HH:mm", { locale: pt });
  };

  const getEmploymentLabel = (status: string | null) => {
    const labels: Record<string, string> = {
      employed: "Empregado(a)",
      self_employed: "Trabalhador Independente",
      business_owner: "Empresário(a)",
      student: "Estudante",
      unemployed: "Desempregado(a)",
      other: "Outro",
    };
    return labels[status || ""] || status || "-";
  };

  const filteredMembers = members.filter((m) =>
    (m.profile?.full_name || m.profile?.display_name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const filteredExternals = externals.filter(
    (e) =>
      e.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ["Tipo", "Nome", "Email", "Telefone", "Idade", "Situação", "Cargo", "Empresa", "Data Inscrição"];
    
    const memberRows = members.map((m) => [
      "Membro JU10",
      m.profile?.full_name || m.profile?.display_name || "-",
      "-",
      m.profile?.phone || "-",
      m.profile?.age || "-",
      getEmploymentLabel(m.profile?.employment_status || null),
      m.profile?.job_title || "-",
      m.profile?.company || "-",
      formatDate(m.registered_at),
    ]);

    const externalRows = externals.map((e) => [
      "Participante Externo",
      e.full_name,
      e.email,
      e.phone,
      e.age,
      getEmploymentLabel(e.employment_status),
      e.job_title || "-",
      e.company || "-",
      formatDate(e.registered_at),
    ]);

    const csvContent = [
      headers.join(","),
      ...memberRows.map((row) => row.join(",")),
      ...externalRows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `participantes-${eventTitle.replace(/\s+/g, "-").toLowerCase()}.csv`;
    link.click();
  };

  const totalCount = members.length + externals.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Participantes do Evento
            </CardTitle>
            <CardDescription>
              {totalCount} participantes inscritos no total
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all">
              Todos ({totalCount})
            </TabsTrigger>
            <TabsTrigger value="members">
              <UserCheck className="w-4 h-4 mr-1" />
              Membros ({members.length})
            </TabsTrigger>
            <TabsTrigger value="external">
              <ExternalLink className="w-4 h-4 mr-1" />
              Externos ({externals.length})
            </TabsTrigger>
          </TabsList>

          {/* All Participants */}
          <TabsContent value="all">
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden md:table-cell">Contacto</TableHead>
                    <TableHead className="hidden md:table-cell">Situação</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : filteredMembers.length === 0 && filteredExternals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhum participante encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {filteredMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                              Membro
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {member.profile?.full_name || member.profile?.display_name || "Sem nome"}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {member.profile?.phone && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                {member.profile.phone}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {getEmploymentLabel(member.profile?.employment_status || null)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(member.registered_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredExternals.map((external) => (
                        <TableRow key={external.id}>
                          <TableCell>
                            <Badge variant="outline">Externo</Badge>
                          </TableCell>
                          <TableCell className="font-medium">{external.full_name}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                {external.email}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                {external.phone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {getEmploymentLabel(external.employment_status)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(external.registered_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Members Only */}
          <TabsContent value="members">
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden md:table-cell">Telefone</TableHead>
                    <TableHead className="hidden md:table-cell">Cargo</TableHead>
                    <TableHead className="hidden md:table-cell">Empresa</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhum membro inscrito
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          {member.profile?.full_name || member.profile?.display_name || "Sem nome"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {member.profile?.phone || "-"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {member.profile?.job_title || "-"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {member.profile?.company || "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(member.registered_at)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* External Only */}
          <TabsContent value="external">
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="hidden md:table-cell">Telefone</TableHead>
                    <TableHead className="hidden md:table-cell">Idade</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExternals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhum participante externo inscrito
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExternals.map((external) => (
                      <TableRow key={external.id}>
                        <TableCell className="font-medium">{external.full_name}</TableCell>
                        <TableCell className="hidden md:table-cell">{external.email}</TableCell>
                        <TableCell className="hidden md:table-cell">{external.phone}</TableCell>
                        <TableCell className="hidden md:table-cell">{external.age}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(external.registered_at)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
