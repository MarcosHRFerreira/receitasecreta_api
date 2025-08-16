import React from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Button from './ui/Button';
import ThemeToggle from './ui/ThemeToggle';
import { ChefHatIcon, PackageIcon, UsersIcon, LogOutIcon } from './icons';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 transition-colors duration-300">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 transition-colors duration-300">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle size="sm" className="sm:hidden" aria-label="Alternar tema claro/escuro" />
        <ThemeToggle size="md" className="hidden sm:block" aria-label="Alternar tema claro/escuro" />
      </div>
      
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-400 dark:to-orange-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                Receita Secreta
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-2">
              <Link to="/receitas">
                <Button
                  variant={isActiveRoute('/receitas') ? 'primary' : 'ghost'}
                  size="sm"
                  icon={<ChefHatIcon />}
                >
                  Receitas
                </Button>
              </Link>
              <Link to="/produtos">
                <Button
                  variant={isActiveRoute('/produtos') ? 'primary' : 'ghost'}
                  size="sm"
                  icon={<PackageIcon />}
                >
                  Produtos
                </Button>
              </Link>
              {user?.role === 'ADMIN' && (
                <Link to="/usuarios">
                  <Button
                    variant={isActiveRoute('/usuarios') ? 'primary' : 'ghost'}
                    size="sm"
                    icon={<UsersIcon />}
                  >
                    Usuários
                  </Button>
                </Link>
              )}
            </nav>

            {/* User menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Olá, <span className="font-medium text-gray-900 dark:text-white">{user?.username}</span>
                </span>
              </div>
              <Button
                onClick={handleLogout}
                variant="danger"
                size="sm"
                icon={<LogOutIcon />}
              >
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm transition-colors duration-300">
          <div className="px-4 py-3 space-y-2">
            <Link to="/receitas" className="block">
              <Button
                variant={isActiveRoute('/receitas') ? 'primary' : 'ghost'}
                size="md"
                icon={<ChefHatIcon />}
                className="w-full justify-start"
              >
                Receitas
              </Button>
            </Link>
            <Link to="/produtos" className="block">
              <Button
                variant={isActiveRoute('/produtos') ? 'primary' : 'ghost'}
                size="md"
                icon={<PackageIcon />}
                className="w-full justify-start"
              >
                Produtos
              </Button>
            </Link>
            {user?.role === 'ADMIN' && (
              <Link to="/usuarios" className="block">
                <Button
                  variant={isActiveRoute('/usuarios') ? 'primary' : 'ghost'}
                  size="md"
                  icon={<UsersIcon />}
                  className="w-full justify-start"
                >
                  Usuários
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
};

export default Layout;