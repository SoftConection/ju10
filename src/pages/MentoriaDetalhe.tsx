import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  ChevronRight,
  Play,
  MessageSquare,
  Send,
  FileText,
  Clock,
  CheckCircle2,
  Loader2,
  BookOpen,
  Users,
  Video,
} from 'lucide-react';

interface Mentorship {
  id: string;
  title: string;
  description: string;
  mentor_id: string;
  price_aoa: number;
  duration_weeks: number;
  max_students: number;
  category: string;
  image_url: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url: string;
  content: string;
  order_index: number;
  duration_minutes: number;
}

interface Material {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  profile?: { display_name: string; avatar_url: string };
}

interface ChatMessage {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  profile?: { display_name: string; avatar_url: string };
}

const MentoriaDetalhe = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [mentorship, setMentorship] = useState<Mentorship | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingComment, setSendingComment] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<'lessons' | 'materials' | 'chat'>('lessons');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (id && user) {
      fetchData();
      checkEnrollment();
    }
  }, [id, user]);

  useEffect(() => {
    if (selectedLesson) {
      fetchComments(selectedLesson.id);
    }
  }, [selectedLesson]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Real-time chat subscription
  useEffect(() => {
    if (!id || !isEnrolled) return;

    const channel = supabase
      .channel('mentorship-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mentorship_chat_messages',
          filter: `mentorship_id=eq.${id}`,
        },
        async (payload) => {
          const newMsg = payload.new as any;
          // Fetch profile for the new message
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('user_id', newMsg.user_id)
            .single();
          
          setChatMessages(prev => [...prev, { ...newMsg, profile }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, isEnrolled]);

  const checkEnrollment = async () => {
    if (!user || !id) return;
    
    const { data } = await supabase
      .from('mentorship_enrollments')
      .select('id, payment_status')
      .eq('user_id', user.id)
      .eq('mentorship_id', id)
      .eq('payment_status', 'confirmed')
      .single();
    
    setIsEnrolled(!!data);
    
    if (!data) {
      navigate('/mentorias');
      toast({
        title: 'Acesso negado',
        description: 'Precisa estar inscrito para aceder a esta mentoria.',
        variant: 'destructive',
      });
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch mentorship
      const { data: mentorshipData, error: mentorshipError } = await supabase
        .from('mentorships')
        .select('*')
        .eq('id', id)
        .single();

      if (mentorshipError) throw mentorshipError;
      setMentorship(mentorshipData);

      // Fetch lessons
      const { data: lessonsData } = await supabase
        .from('mentorship_lessons')
        .select('*')
        .eq('mentorship_id', id)
        .order('order_index');

      setLessons(lessonsData || []);
      if (lessonsData && lessonsData.length > 0) {
        setSelectedLesson(lessonsData[0]);
      }

      // Fetch materials
      const { data: materialsData } = await supabase
        .from('mentorship_materials')
        .select('*')
        .eq('mentorship_id', id)
        .order('created_at');

      setMaterials(materialsData || []);

      // Fetch chat messages
      await fetchChatMessages();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatMessages = async () => {
    if (!id) return;

    const { data: messages } = await supabase
      .from('mentorship_chat_messages')
      .select('*')
      .eq('mentorship_id', id)
      .order('created_at');

    if (messages) {
      // Fetch profiles for messages
      const userIds = [...new Set(messages.map(m => m.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      const messagesWithProfiles = messages.map(m => ({
        ...m,
        profile: profileMap.get(m.user_id),
      }));

      setChatMessages(messagesWithProfiles);
    }
  };

  const fetchComments = async (lessonId: string) => {
    const { data: commentsData } = await supabase
      .from('mentorship_comments')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: false });

    if (commentsData) {
      // Fetch profiles for comments
      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      const commentsWithProfiles = commentsData.map(c => ({
        ...c,
        profile: profileMap.get(c.user_id),
      }));

      setComments(commentsWithProfiles);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim() || !selectedLesson || !user) return;

    setSendingComment(true);
    try {
      const { error } = await supabase
        .from('mentorship_comments')
        .insert({
          lesson_id: selectedLesson.id,
          user_id: user.id,
          content: newComment,
        });

      if (error) throw error;

      setNewComment('');
      fetchComments(selectedLesson.id);
      toast({ title: 'Comentário adicionado!' });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSendingComment(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !id || !user) return;

    setSendingMessage(true);
    try {
      const { error } = await supabase
        .from('mentorship_chat_messages')
        .insert({
          mentorship_id: id,
          user_id: user.id,
          content: newMessage,
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-AO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!mentorship) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Mentoria não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${mentorship.title} | JU10 - Juventude 10`}
        description={mentorship.description || 'Mentoria de Marketing'}
      />

      <Navbar />

      <div className="pt-24 pb-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/mentorias" className="hover:text-primary transition-colors">Mentorias</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{mentorship.title}</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1">
              {/* Video/Content Area */}
              {selectedLesson && (
                <div className="mb-6">
                  {selectedLesson.video_url ? (
                    <div className="aspect-video bg-foreground rounded-2xl overflow-hidden">
                      <iframe
                        src={selectedLesson.video_url}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-muted rounded-2xl flex items-center justify-center">
                      <Video className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}

                  <div className="mt-4">
                    <h1 className="text-2xl font-display font-bold mb-2">
                      {selectedLesson.title}
                    </h1>
                    {selectedLesson.description && (
                      <p className="text-muted-foreground">{selectedLesson.description}</p>
                    )}
                  </div>

                  {/* Lesson Content */}
                  {selectedLesson.content && (
                    <div className="mt-6 prose prose-sm max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: selectedLesson.content }} />
                    </div>
                  )}

                  {/* Comments Section */}
                  <div className="mt-8 border-t border-border pt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Comentários ({comments.length})
                    </h3>

                    {/* Add Comment */}
                    <div className="flex gap-3 mb-6">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>
                          {user?.email?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder="Adicione um comentário..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          rows={2}
                          className="resize-none"
                        />
                        <div className="flex justify-end mt-2">
                          <Button
                            variant="ju10"
                            size="sm"
                            onClick={handleSendComment}
                            disabled={sendingComment || !newComment.trim()}
                          >
                            {sendingComment ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Comentar'
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={comment.profile?.avatar_url} />
                            <AvatarFallback>
                              {comment.profile?.display_name?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {comment.profile?.display_name || 'Utilizador'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(comment.created_at)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))}

                      {comments.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                          Nenhum comentário ainda. Seja o primeiro!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-96 space-y-6">
              {/* Tabs */}
              <div className="flex border-b border-border">
                {[
                  { key: 'lessons', label: 'Aulas', icon: BookOpen },
                  { key: 'materials', label: 'Materiais', icon: FileText },
                  { key: 'chat', label: 'Chat', icon: Users },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.key
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Lessons List */}
              {activeTab === 'lessons' && (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2 pr-4">
                    {lessons.map((lesson, index) => (
                      <button
                        key={lesson.id}
                        onClick={() => setSelectedLesson(lesson)}
                        className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all ${
                          selectedLesson?.id === lesson.id
                            ? 'bg-primary/10 border border-primary/30'
                            : 'bg-muted/50 hover:bg-muted border border-transparent'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          selectedLesson?.id === lesson.id ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20'
                        }`}>
                          {selectedLesson?.id === lesson.id ? (
                            <Play className="w-4 h-4" />
                          ) : (
                            <span className="text-xs font-medium">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{lesson.title}</p>
                          {lesson.duration_minutes && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              {lesson.duration_minutes} min
                            </p>
                          )}
                        </div>
                      </button>
                    ))}

                    {lessons.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhuma aula disponível ainda.
                      </p>
                    )}
                  </div>
                </ScrollArea>
              )}

              {/* Materials List */}
              {activeTab === 'materials' && (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2 pr-4">
                    {materials.map((material) => (
                      <a
                        key={material.id}
                        href={material.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-transparent hover:border-border"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{material.title}</p>
                          {material.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {material.description}
                            </p>
                          )}
                          {material.file_type && (
                            <span className="inline-block mt-2 text-xs bg-muted px-2 py-0.5 rounded uppercase">
                              {material.file_type}
                            </span>
                          )}
                        </div>
                      </a>
                    ))}

                    {materials.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhum material disponível ainda.
                      </p>
                    )}
                  </div>
                </ScrollArea>
              )}

              {/* Chat */}
              {activeTab === 'chat' && (
                <div className="h-[500px] flex flex-col border border-border rounded-xl overflow-hidden">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex gap-3 ${
                            msg.user_id === user?.id ? 'flex-row-reverse' : ''
                          }`}
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={msg.profile?.avatar_url} />
                            <AvatarFallback>
                              {msg.profile?.display_name?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                              msg.user_id === user?.id
                                ? 'bg-primary text-primary-foreground rounded-br-sm'
                                : 'bg-muted rounded-bl-sm'
                            }`}
                          >
                            <p className="text-xs font-medium mb-1 opacity-80">
                              {msg.profile?.display_name || 'Utilizador'}
                            </p>
                            <p className="text-sm">{msg.content}</p>
                          </div>
                        </div>
                      ))}

                      {chatMessages.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                          Nenhuma mensagem ainda. Inicie a conversa!
                        </p>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Chat Input */}
                  <div className="p-3 border-t border-border bg-muted/30">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Escreva uma mensagem..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        rows={1}
                        className="resize-none min-h-[40px]"
                      />
                      <Button
                        variant="ju10"
                        size="icon"
                        onClick={handleSendMessage}
                        disabled={sendingMessage || !newMessage.trim()}
                      >
                        {sendingMessage ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentoriaDetalhe;
