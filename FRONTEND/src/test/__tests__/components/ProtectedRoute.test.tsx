import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useAuth } from '../../../hooks/useAuth';
import type { User, UserRole } from '../../../types';

// Mock do useAuth hook
vi.mock('../../../hooks/useAuth');
const mockedUseAuth = vi.mocked(useAuth);

// Mock do react-router-dom Navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to, state, replace }: { to: string; state?: any; replace?: boolean }) => {
      mockNavigate(to, { state, replace });
      return <div data-testid="navigate" data-to={to}>Redirecting to {to}</div>;
    },
  };
});

// Mock do window.history.back
const mockHistoryBack = vi.fn();
Object.defineProperty(window, 'history', {
  value: {
    back: mockHistoryBack,
  },
  writable: true,
});

// Dados de teste
const mockUser: User = {
  id: '1',
  username: 'Test User',
  email: 'test@test.com',
  role: 'USER',
};

const mockAdminUser: User = {
  id: '2',
  username: 'Admin User',
  email: 'admin@test.com',
  role: 'ADMIN',
};

// Componente de teste
const TestComponent = () => (
  <div data-testid="protected-content">Conteúdo Protegido</div>
);

// Helper para renderizar com router
const renderWithRouter = (
  component: React.ReactElement,
  initialEntries: string[] = ['/protected']
) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {component}
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockHistoryBack.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Estado de Loading', () => {
    it('deve mostrar loading spinner quando isLoading é true', () => {
      // Arrange
      mockedUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: true,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
      });

      // Act
      renderWithRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      // Assert
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    });

    it('deve ter classes CSS corretas no loading spinner', () => {
      // Arrange
      mockedUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: true,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
      });

      // Act
      renderWithRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      // Assert
      const loadingContainer = screen.getByRole('status', { hidden: true }).parentElement;
      expect(loadingContainer).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center');
      
      const spinner = screen.getByRole('status', { hidden: true });
      expect(spinner).toHaveClass(
        'animate-spin',
        'rounded-full',
        'h-32',
        'w-32',
        'border-b-2',
        'border-blue-600'
      );
    });
  });

  describe('Usuário Não Autenticado', () => {
    it('deve redirecionar para login quando usuário não está autenticado', () => {
      // Arrange
      mockedUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
      });

      // Act
      renderWithRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>,
        ['/dashboard']
      );

      // Assert
      expect(mockNavigate).toHaveBeenCalledWith('/login', {
        state: { from: { pathname: '/dashboard', search: '', hash: '', state: null, key: expect.any(String) } },
        replace: true,
      });
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('deve preservar a localização atual no state para redirecionamento após login', () => {
      // Arrange
      mockedUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
      });

      // Act
      renderWithRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>,
        ['/receitas/123']
      );

      // Assert
      expect(mockNavigate).toHaveBeenCalledWith('/login', {
        state: { from: { pathname: '/receitas/123', search: '', hash: '', state: null, key: expect.any(String) } },
        replace: true,
      });
    });
  });

  describe('Usuário Autenticado', () => {
    it('deve renderizar conteúdo protegido quando usuário está autenticado', () => {
      // Arrange
      mockedUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: mockUser,
        token: 'valid-token',
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
      });

      // Act
      renderWithRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      // Assert
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.getByText('Conteúdo Protegido')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('deve renderizar múltiplos children quando autenticado', () => {
      // Arrange
      mockedUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: mockUser,
        token: 'valid-token',
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
      });

      // Act
      renderWithRouter(
        <ProtectedRoute>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </ProtectedRoute>
      );

      // Assert
      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });
  });

  describe('Controle de Acesso por Role', () => {
    it('deve permitir acesso quando usuário tem a role necessária', () => {
      // Arrange
      mockedUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: mockAdminUser,
        token: 'valid-token',
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
      });

      // Act
      renderWithRouter(
        <ProtectedRoute requiredRole="ADMIN">
          <TestComponent />
        </ProtectedRoute>
      );

      // Assert
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByText('Acesso Negado')).not.toBeInTheDocument();
    });

    it('deve negar acesso quando usuário não tem a role necessária', () => {
      // Arrange
      mockedUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: mockUser, // USER role
        token: 'valid-token',
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
      });

      // Act
      renderWithRouter(
        <ProtectedRoute requiredRole="ADMIN">
          <TestComponent />
        </ProtectedRoute>
      );

      // Assert
      expect(screen.getByText('Acesso Negado')).toBeInTheDocument();
      expect(screen.getByText('Você não tem permissão para acessar esta página.')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('deve permitir acesso quando não há role requerida', () => {
      // Arrange
      mockedUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: mockUser,
        token: 'valid-token',
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
      });

      // Act
      renderWithRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      // Assert
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByText('Acesso Negado')).not.toBeInTheDocument();
    });

    it('deve negar acesso quando usuário é null mas está autenticado', () => {
      // Arrange
      mockedUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: null,
        token: 'valid-token',
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
      });

      // Act
      renderWithRouter(
        <ProtectedRoute requiredRole="ADMIN">
          <TestComponent />
        </ProtectedRoute>
      );

      // Assert
      expect(screen.getByText('Acesso Negado')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('Página de Acesso Negado', () => {
    beforeEach(() => {
      mockedUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: mockUser,
        token: 'valid-token',
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
      });
    });

    it('deve ter estrutura HTML correta na página de acesso negado', () => {
      // Act
      renderWithRouter(
        <ProtectedRoute requiredRole="ADMIN">
          <TestComponent />
        </ProtectedRoute>
      );

      // Assert
      const container = screen.getByText('Acesso Negado').closest('div');
      expect(container?.parentElement).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center');
      
      const textContainer = screen.getByText('Acesso Negado').parentElement;
      expect(textContainer).toHaveClass('text-center');
      
      const title = screen.getByText('Acesso Negado');
      expect(title).toHaveClass('text-2xl', 'font-bold', 'text-gray-900', 'mb-4');
      
      const description = screen.getByText('Você não tem permissão para acessar esta página.');
      expect(description).toHaveClass('text-gray-600', 'mb-4');
    });

    it('deve ter botão "Voltar" com classes CSS corretas', () => {
      // Act
      renderWithRouter(
        <ProtectedRoute requiredRole="ADMIN">
          <TestComponent />
        </ProtectedRoute>
      );

      // Assert
      const backButton = screen.getByRole('button', { name: 'Voltar' });
      expect(backButton).toHaveClass(
        'bg-blue-600',
        'text-white',
        'px-4',
        'py-2',
        'rounded-md',
        'hover:bg-blue-700',
        'transition-colors'
      );
    });

    it('deve chamar window.history.back() quando botão "Voltar" é clicado', async () => {
      // Arrange
      const user = userEvent.setup();
      
      renderWithRouter(
        <ProtectedRoute requiredRole="ADMIN">
          <TestComponent />
        </ProtectedRoute>
      );

      // Act
      const backButton = screen.getByRole('button', { name: 'Voltar' });
      await user.click(backButton);

      // Assert
      expect(mockHistoryBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Diferentes Roles', () => {
    const testCases: Array<{
      userRole: UserRole;
      requiredRole: UserRole;
      shouldHaveAccess: boolean;
      description: string;
    }> = [
      {
        userRole: 'USER',
        requiredRole: 'USER',
        shouldHaveAccess: true,
        description: 'USER deve ter acesso a rota USER',
      },
      {
        userRole: 'ADMIN',
        requiredRole: 'USER',
        shouldHaveAccess: false,
        description: 'ADMIN não deve ter acesso a rota USER (roles específicas)',
      },
      {
        userRole: 'USER',
        requiredRole: 'ADMIN',
        shouldHaveAccess: false,
        description: 'USER não deve ter acesso a rota ADMIN',
      },
      {
        userRole: 'ADMIN',
        requiredRole: 'ADMIN',
        shouldHaveAccess: true,
        description: 'ADMIN deve ter acesso a rota ADMIN',
      },
    ];

    testCases.forEach(({ userRole, requiredRole, shouldHaveAccess, description }) => {
      it(description, () => {
        // Arrange
        const testUser: User = {
          id: '1',
          username: 'Test User',
          email: 'test@test.com',
          role: userRole,
        };

        mockedUseAuth.mockReturnValue({
          isAuthenticated: true,
          user: testUser,
          token: 'valid-token',
          isLoading: false,
          login: vi.fn(),
          register: vi.fn(),
          logout: vi.fn(),
        });

        // Act
        renderWithRouter(
          <ProtectedRoute requiredRole={requiredRole}>
            <TestComponent />
          </ProtectedRoute>
        );

        // Assert
        if (shouldHaveAccess) {
          expect(screen.getByTestId('protected-content')).toBeInTheDocument();
          expect(screen.queryByText('Acesso Negado')).not.toBeInTheDocument();
        } else {
          expect(screen.getByText('Acesso Negado')).toBeInTheDocument();
          expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        }
      });
    });
  });

  describe('Integração com React Router', () => {
    it('deve funcionar corretamente com BrowserRouter', () => {
      // Arrange
      mockedUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: mockUser,
        token: 'valid-token',
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
      });

      // Act
      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </BrowserRouter>
      );

      // Assert
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('deve preservar query parameters na localização', () => {
      // Arrange
      mockedUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
      });

      // Act
      renderWithRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>,
        ['/dashboard?tab=receitas&filter=recent']
      );

      // Assert
      expect(mockNavigate).toHaveBeenCalledWith('/login', {
        state: {
          from: {
            pathname: '/dashboard',
            search: '?tab=receitas&filter=recent',
            hash: '',
            state: null,
            key: expect.any(String),
          },
        },
        replace: true,
      });
    });
  });
});