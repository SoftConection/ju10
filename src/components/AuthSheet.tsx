import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Lock, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import logoJu10 from '@/assets/logo-ju10.jpg';

interface AuthSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthSheet: React.FC<AuthSheetProps> = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        
        if (error) throw error;
        
        toast({
          title: 'Conta criada!',
          description: 'Você já pode fazer login com suas credenciais.'
        });
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        
        toast({
          title: 'Bem-vindo de volta!',
          description: 'Login realizado com sucesso.'
        });
        onClose();
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-[1000] animate-fade-in"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-foreground z-[1001] shadow-2xl animate-slide-in-right">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-background/70 hover:text-background transition-colors p-2 rounded-full hover:bg-background/10"
          aria-label="Fechar"
        >
          <X size={24} />
        </button>

        {/* Content */}
        <div className="flex flex-col h-full px-8 md:px-10 pt-20 pb-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <img 
              src={logoJu10} 
              alt="JU10" 
              className="h-12 w-12 rounded-lg object-contain"
            />
            <div>
              <h1 className="text-background text-xl font-bold tracking-tight">JU10</h1>
              <p className="text-background/50 text-xs">Juventude 10</p>
            </div>
          </div>

          <h2 className="text-background text-3xl md:text-4xl font-bold mb-2 font-display">
            {isSignUp ? 'Criar Conta' : 'Entrar'}
          </h2>
          <p className="text-background/60 text-sm mb-8">
            {isSignUp 
              ? 'Junte-se a nós para criar e gerenciar seus eventos' 
              : 'Bem-vindo de volta! Faça login para continuar'}
          </p>

          <form onSubmit={handleAuth} className="flex flex-col gap-5">
            <div>
              <label htmlFor="email" className="block text-background/80 text-xs font-semibold mb-2 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-background/40" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-background/10 border border-background/20 text-background pl-11 pr-4 py-3.5 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-background/40"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-background/80 text-xs font-semibold mb-2 uppercase tracking-wider">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-background/40" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-background/10 border border-background/20 text-background pl-11 pr-4 py-3.5 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-background/40"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-semibold py-3.5 px-6 rounded-lg uppercase text-sm tracking-wide flex items-center justify-center gap-2 hover:bg-primary/90 transition-all duration-300 hover:shadow-ju10 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="animate-pulse">Aguarde...</span>
              ) : (
                <>
                  {isSignUp ? 'Criar Conta' : 'Entrar'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-background/60 hover:text-background transition-colors text-sm"
            >
              {isSignUp 
                ? 'Já tem uma conta? ' 
                : 'Não tem uma conta? '}
              <span className="text-primary font-semibold hover:underline">
                {isSignUp ? 'Entrar' : 'Criar conta'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};
