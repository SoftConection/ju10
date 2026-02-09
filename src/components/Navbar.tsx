import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Radio, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { AuthSheet } from './AuthSheet';
import logoJu10 from '@/assets/logo-ju10.jpg';

export const Navbar: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user && pendingRoute) {
      navigate(pendingRoute);
      setPendingRoute(null);
      setIsAuthOpen(false);
    }
  }, [user, pendingRoute, navigate]);

  const navLinkClass = `
    relative overflow-hidden bg-background text-foreground h-10 px-4 
    flex items-center text-xs font-semibold uppercase tracking-wide
    border border-border transition-all duration-300 ease-out
    hover:border-primary hover:text-primary
    focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
  `;

  const navLinkActiveClass = `
    relative overflow-hidden bg-primary text-primary-foreground h-10 px-4 
    flex items-center text-xs font-semibold uppercase tracking-wide
    border border-primary transition-all duration-300 ease-out
    hover:bg-primary/90
    focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
  `;

  return createPortal(
    <>
      {/* Backdrop blur overlay */}
      <div 
        className={`fixed top-0 left-0 right-0 h-20 z-[1999] transition-all duration-300 ${
          isScrolled ? 'navbar-blur' : 'bg-transparent'
        }`}
      />
      
      <nav className="fixed top-6 left-4 md:left-8 z-[2000] flex items-center gap-0">
        {/* Logo */}
        <Link 
          to="/" 
          className="bg-primary h-10 w-10 rounded-lg flex items-center justify-center shadow-ju10 hover:shadow-ju10-lg transition-all duration-300 hover:scale-105"
        >
          <img 
            src={logoJu10} 
            alt="JU10 - Juventude 10" 
            className="h-8 w-8 object-contain rounded"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center ml-2 gap-1">
          <Link 
            to="/formacoes" 
            className={`${navLinkClass} rounded-l-lg border-r-0`}
          >
            Formações
          </Link>
          <Link 
            to="/mentorias" 
            className={`${navLinkClass} border-r-0`}
          >
            Mentorias
          </Link>
          <Link 
            to="/turmas" 
            className={`${navLinkClass} border-r-0`}
          >
            Turmas
          </Link>
          <Link 
            to="/webinars" 
            className={`${navLinkClass} border-r-0`}
          >
            <Radio className="w-3.5 h-3.5 mr-1.5" />
            Live
          </Link>
          <Link 
            to="/eventos" 
            className={`${navLinkClass} border-r-0`}
          >
            Eventos
          </Link>
          <Link 
            to="/parceiros" 
            className={`${navLinkClass} border-r-0`}
          >
            <Users className="w-3.5 h-3.5 mr-1.5" />
            Parceiros
          </Link>
          {user ? (
            <>
              <Link 
                to="/dashboard" 
                className={`${navLinkClass} border-r-0`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" />
                Dashboard
              </Link>
              <Link 
                to="/profile" 
                className={`${navLinkClass} border-r-0`}
              >
                Perfil
              </Link>
              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                }}
                className={`${navLinkClass} rounded-r-lg`}
              >
                Sair
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsAuthOpen(true)}
              className={`${navLinkActiveClass} rounded-r-lg`}
            >
              Entrar
            </button>
          )}
        </div>

        {/* Menu Button - Mobile Only */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden ml-2 bg-background text-foreground h-10 px-4 border border-border rounded-lg flex items-center justify-center text-xs font-semibold uppercase tracking-wide transition-all duration-300 hover:border-primary hover:text-primary"
        >
          <Menu className="w-4 h-4 mr-2" />
          Menu
        </button>
      </nav>

      {/* Mobile Navigation - Full Screen */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[3000] flex flex-col animate-fade-in">
          {/* Close header */}
          <div className="bg-foreground flex items-center justify-center py-16 animate-fade-in">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-background text-sm font-semibold uppercase tracking-wider flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <X className="w-5 h-5" />
              Fechar
            </button>
          </div>
          
          {/* Menu items */}
          <div className="flex-1 flex flex-col bg-background">
            <Link 
              to="/formacoes" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex-1 flex items-center justify-center text-foreground text-lg font-semibold uppercase border-b border-border tracking-wide animate-fade-in-up hover:text-primary hover:bg-accent transition-all duration-300"
              style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
            >
              Formações
            </Link>
            <Link 
              to="/mentorias" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex-1 flex items-center justify-center text-foreground text-lg font-semibold uppercase border-b border-border tracking-wide animate-fade-in-up hover:text-primary hover:bg-accent transition-all duration-300"
              style={{ animationDelay: '0.15s', animationFillMode: 'both' }}
            >
              Mentorias
            </Link>
            <Link 
              to="/turmas" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex-1 flex items-center justify-center text-foreground text-lg font-semibold uppercase border-b border-border tracking-wide animate-fade-in-up hover:text-primary hover:bg-accent transition-all duration-300"
              style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
            >
              Turmas
            </Link>
            <Link 
              to="/webinars" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex-1 flex items-center justify-center text-foreground text-lg font-semibold uppercase border-b border-border tracking-wide animate-fade-in-up hover:text-primary hover:bg-accent transition-all duration-300"
              style={{ animationDelay: '0.25s', animationFillMode: 'both' }}
            >
              <Radio className="w-5 h-5 mr-2" />
              Live
            </Link>
            <Link 
              to="/eventos" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex-1 flex items-center justify-center text-foreground text-lg font-semibold uppercase border-b border-border tracking-wide animate-fade-in-up hover:text-primary hover:bg-accent transition-all duration-300"
              style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
            >
              Eventos
            </Link>
            <Link 
              to="/parceiros" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex-1 flex items-center justify-center text-foreground text-lg font-semibold uppercase border-b border-border tracking-wide animate-fade-in-up hover:text-primary hover:bg-accent transition-all duration-300"
              style={{ animationDelay: '0.35s', animationFillMode: 'both' }}
            >
              Parceiros
            </Link>
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center text-foreground text-lg font-semibold uppercase border-b border-border tracking-wide animate-fade-in-up hover:text-primary hover:bg-accent transition-all duration-300"
                  style={{ animationDelay: '0.4s', animationFillMode: 'both' }}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/profile" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center text-foreground text-lg font-semibold uppercase border-b border-border tracking-wide animate-fade-in-up hover:text-primary hover:bg-accent transition-all duration-300"
                  style={{ animationDelay: '0.45s', animationFillMode: 'both' }}
                >
                  Perfil
                </Link>
                <button 
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex-1 flex items-center justify-center text-foreground text-lg font-semibold uppercase tracking-wide animate-fade-in-up hover:text-primary hover:bg-accent transition-all duration-300"
                  style={{ animationDelay: '0.5s', animationFillMode: 'both' }}
                >
                  Sair
                </button>
              </>
            ) : (
              <button 
                onClick={() => {
                  setIsAuthOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1 flex items-center justify-center bg-primary text-primary-foreground text-lg font-semibold uppercase tracking-wide animate-fade-in-up transition-all duration-300"
                style={{ animationDelay: '0.4s', animationFillMode: 'both' }}
              >
                Entrar
              </button>
            )}
          </div>
        </div>
      )}
    
      <AuthSheet isOpen={isAuthOpen} onClose={() => { setIsAuthOpen(false); setPendingRoute(null); }} />
    </>,
    document.body
  );
};