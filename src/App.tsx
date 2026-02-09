import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Formacoes from "./pages/Cursos";
import Mentorias from "./pages/Mentorias";
import MentoriaDetalhe from "./pages/MentoriaDetalhe";
import Turmas from "./pages/Turmas";
import Empresas from "./pages/Empresas";
import Eventos from "./pages/Eventos";
import Dashboard from "./pages/Dashboard";
import TurmaInscricao from "./pages/TurmaInscricao";
import CoursePlayer from "./pages/CoursePlayer";
import MeuAprendizado from "./pages/MeuAprendizado";
import Webinars from "./pages/Webinars";
import Partners from "./pages/Partners";
import CertificateVerification from "./pages/CertificateVerification";

import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import MyEvents from "./pages/MyEvents";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/formacoes" element={<Formacoes />} />
      <Route path="/mentorias" element={<Mentorias />} />
      <Route path="/mentoria/:id" element={<MentoriaDetalhe />} />
      <Route path="/turmas" element={<Turmas />} />
      <Route path="/turmas/:id/inscricao" element={<TurmaInscricao />} />
      <Route path="/empresas" element={<Empresas />} />
      <Route path="/eventos" element={<Eventos />} />
      <Route path="/evento/:id" element={<Index />} />
      <Route path="/event/:id/edit" element={<EditEvent />} />
      <Route path="/my-events" element={<MyEvents />} />
      <Route path="/create-event" element={<CreateEvent />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/meu-aprendizado" element={<MeuAprendizado />} />
      <Route path="/curso/:courseId" element={<CoursePlayer />} />
      <Route path="/curso/:courseId/aula/:lessonId" element={<CoursePlayer />} />
      {/* New Routes */}
      <Route path="/webinars" element={<Webinars />} />
      <Route path="/parceiros" element={<Partners />} />
      <Route path="/certificado/:code" element={<CertificateVerification />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </TooltipProvider>
);

export default App;
