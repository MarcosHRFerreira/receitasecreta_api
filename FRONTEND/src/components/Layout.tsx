import React from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Button from './ui/Button';
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
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                  <ChefHatIcon size={20} />
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
                <span className="text-sm text-gray-600">
                  Olá, <span className="font-medium">{user?.username}</span>
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
        <div className="md:hidden border-t bg-gray-50">
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
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;