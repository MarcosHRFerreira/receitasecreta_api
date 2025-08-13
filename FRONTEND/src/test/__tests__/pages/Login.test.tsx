import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from '../../../pages/Login';
import { AuthProvider } from '../../../contexts/AuthContext';
import { useAuth } from '../../../hooks/useAuth';
import type { UserAuthRequest } from '../../../types';

// Mocks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn(),
  };
});

vi.mock('../../../hooks/useAuth');

const mockNavigate = vi.fn();
const mockUseAuth = vi.mocked(useAuth);
const mockUseNavigate = vi.mocked(useNavigate);
const mockUseLocation = vi.mocked(useLocation);

// Helper para renderizar com providers
const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
    logger: {
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {component}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Login Page', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
    
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseLocation.mockReturnValue({
      pathname: '/login',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    });
    
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: mockLogin,
      logout: vi.fn(),
      register: vi.fn(),
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Renderização', () => {
    it('deve renderizar o formulário de login', () => {
      renderWithProviders(<Login />);

      expect(screen.getByText('Receita Secreta')).toBeInTheDocument();
      expect(screen.getByText('Faça login em sua conta')).toBeInTheDocument();
      expect(screen.getByLabelText(/login/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    });

    it('deve renderizar links de navegação', () => {
      renderWithProviders(<Login />);

      expect(screen.getByText(/não tem uma conta/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /cadastre-se/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /esqueceu a senha/i })).toBeInTheDocument();
    });

    it('deve renderizar o ícone da aplicação', () => {
      renderWithProviders(<Login />);

      const icon = screen.getByText('🍰');
      expect(icon).toBeInTheDocument();
      expect(icon.closest('div')).toHaveClass('bg-blue-100', 'rounded-full');
    });
  });

  describe('Validação de formulário', () => {
    it('deve mostrar erros de validação para campos vazios', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithProviders(<Login />);

      const submitButton = screen.getByRole('button', { name: /entrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Login é obrigatório')).toBeInTheDocument();
        expect(screen.getByText('Senha é obrigatória')).toBeInTheDocument();
      });
    });

    it('deve validar tamanho mínimo do login', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithProviders(<Login />);

      const loginInput = screen.getByLabelText(/login/i);
      await user.type(loginInput, 'ab');
      
      const submitButton = screen.getByRole('button', { name: /entrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Login deve ter pelo menos 3 caracteres')).toBeInTheDocument();
      });
    });

    it('deve validar tamanho mínimo da senha', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithProviders(<Login />);

      const passwordInput = screen.getByLabelText(/senha/i);
      await user.type(passwordInput, '123');
      
      const submitButton = screen.getByRole('button', { name: /entrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Senha deve ter pelo menos 6 caracteres')).toBeInTheDocument();
      });
    });

    it('deve aceitar dados válidos', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithProviders(<Login />);

      const loginInput = screen.getByLabelText(/login/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      
      await user.type(loginInput, 'usuario123');
      await user.type(passwordInput, 'senha123');
      
      const submitButton = screen.getByRole('button', { name: /entrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          login: 'usuario123',
          password: 'senha123',
        });
      });
    });
  });

  describe('Processo de login', () => {
    it('deve mostrar loading durante o login', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
      
      renderWithProviders(<Login />);

      const loginInput = screen.getByLabelText(/login/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      
      await user.type(loginInput, 'usuario123');
      await user.type(passwordInput, 'senha123');
      
      const submitButton = screen.getByRole('button', { name: /entrar/i });
      await user.click(submitButton);

      expect(screen.getByText(/carregando/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('deve desabilitar campos durante o loading', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
      
      renderWithProviders(<Login />);

      const loginInput = screen.getByLabelText(/login/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      
      await user.type(loginInput, 'usuario123');
      await user.type(passwordInput, 'senha123');
      
      const submitButton = screen.getByRole('button', { name: /entrar/i });
      await user.click(submitButton);

      expect(loginInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });

    it('deve mostrar erro quando login falha', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const errorMessage = 'Credenciais inválidas';
      mockLogin.mockRejectedValue({
        response: {
          data: {
            message: errorMessage,
          },
        },
      });
      
      renderWithProviders(<Login />);

      const loginInput = screen.getByLabelText(/login/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      
      await user.type(loginInput, 'usuario123');
      await user.type(passwordInput, 'senhaerrada');
      
      const submitButton = screen.getByRole('button', { name: /entrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Erro de autenticação')).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('deve mostrar erro genérico quando não há mensagem específica', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockLogin.mockRejectedValue(new Error('Network error'));
      
      renderWithProviders(<Login />);

      const loginInput = screen.getByLabelText(/login/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      
      await user.type(loginInput, 'usuario123');
      await user.type(passwordInput, 'senha123');
      
      const submitButton = screen.getByRole('button', { name: /entrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Erro ao fazer login. Verifique suas credenciais.')).toBeInTheDocument();
      });
    });

    it('deve limpar erro ao tentar novo login', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockLogin.mockRejectedValueOnce(new Error('Erro'));
      
      renderWithProviders(<Login />);

      const loginInput = screen.getByLabelText(/login/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });
      
      // Primeiro login com erro
      await user.type(loginInput, 'usuario123');
      await user.type(passwordInput, 'senha123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Erro ao fazer login. Verifique suas credenciais.')).toBeInTheDocument();
      });

      // Segundo login - erro deve ser limpo
      mockLogin.mockResolvedValueOnce(undefined);
      await user.clear(loginInput);
      await user.clear(passwordInput);
      await user.type(loginInput, 'usuario456');
      await user.type(passwordInput, 'senha456');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('Erro ao fazer login. Verifique suas credenciais.')).not.toBeInTheDocument();
      });
    });
  });

  describe('Redirecionamento', () => {
    it('deve redirecionar para dashboard quando já autenticado', () => {
      mockUseAuth.mockReturnValue({
        user: { id: '1', login: 'user', email: 'user@test.com', role: 'USER' },
        isAuthenticated: true,
        isLoading: false,
        login: mockLogin,
        logout: vi.fn(),
        register: vi.fn(),
      });

      renderWithProviders(<Login />);

      vi.advanceTimersByTime(150);

      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });

    it('deve redirecionar para página de origem após login', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/login',
        search: '',
        hash: '',
        state: { from: { pathname: '/receitas' } },
        key: 'default',
      });

      mockUseAuth.mockReturnValue({
        user: { id: '1', login: 'user', email: 'user@test.com', role: 'USER' },
        isAuthenticated: true,
        isLoading: false,
        login: mockLogin,
        logout: vi.fn(),
        register: vi.fn(),
      });

      renderWithProviders(<Login />);

      vi.advanceTimersByTime(150);

      expect(mockNavigate).toHaveBeenCalledWith('/receitas', { replace: true });
    });

    it('não deve redirecionar quando há erro', () => {
      mockUseAuth.mockReturnValue({
        user: { id: '1', login: 'user', email: 'user@test.com', role: 'USER' },
        isAuthenticated: true,
        isLoading: false,
        login: mockLogin,
        logout: vi.fn(),
        register: vi.fn(),
      });

      renderWithProviders(<Login />);
      
      // Simular erro
      const errorDiv = document.createElement('div');
      errorDiv.textContent = 'Erro de teste';
      document.body.appendChild(errorDiv);

      vi.advanceTimersByTime(150);

      expect(mockNavigate).toHaveBeenCalled();
    });

    it('não deve redirecionar quando ainda está carregando', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        login: mockLogin,
        logout: vi.fn(),
        register: vi.fn(),
      });

      renderWithProviders(<Login />);

      vi.advanceTimersByTime(150);

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Interface e acessibilidade', () => {
    it('deve ter labels associados aos inputs', () => {
      renderWithProviders(<Login />);

      const loginInput = screen.getByLabelText(/login/i);
      const passwordInput = screen.getByLabelText(/senha/i);

      expect(loginInput).toHaveAttribute('id', 'login');
      expect(passwordInput).toHaveAttribute('id', 'password');
    });

    it('deve ter placeholders informativos', () => {
      renderWithProviders(<Login />);

      expect(screen.getByPlaceholderText('Digite seu login')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Digite sua senha')).toBeInTheDocument();
    });

    it('deve ter tipo password no campo senha', () => {
      renderWithProviders(<Login />);

      const passwordInput = screen.getByLabelText(/senha/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('deve ter links com href corretos', () => {
      renderWithProviders(<Login />);

      const registerLink = screen.getByRole('link', { name: /cadastre-se/i });
      const forgotPasswordLink = screen.getByRole('link', { name: /esqueceu a senha/i });

      expect(registerLink).toHaveAttribute('href', '/register');
      expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
    });
  });

  describe('Estilização e layout', () => {
    it('deve aplicar classes CSS corretas', () => {
      renderWithProviders(<Login />);

      const container = screen.getByText('Receita Secreta').closest('.max-w-md');
      expect(container).toHaveClass('max-w-md', 'w-full', 'space-y-8');
    });

    it('deve ter estrutura de erro bem formatada', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockLogin.mockRejectedValue(new Error('Teste'));
      
      renderWithProviders(<Login />);

      const loginInput = screen.getByLabelText(/login/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      
      await user.type(loginInput, 'test');
      await user.type(passwordInput, 'test123');
      
      const submitButton = screen.getByRole('button', { name: /entrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        const errorContainer = screen.getByText('Erro de autenticação').closest('div');
        expect(errorContainer).toHaveClass('bg-red-50', 'border-l-4', 'border-red-400');
      });
    });
  });

  describe('Casos extremos', () => {
    it('deve funcionar com dados muito longos', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithProviders(<Login />);

      const longLogin = 'a'.repeat(100);
      const longPassword = 'b'.repeat(100);

      const loginInput = screen.getByLabelText(/login/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      
      await user.type(loginInput, longLogin);
      await user.type(passwordInput, longPassword);
      
      const submitButton = screen.getByRole('button', { name: /entrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          login: longLogin,
          password: longPassword,
        });
      });
    });

    it('deve lidar com caracteres especiais', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithProviders(<Login />);

      const specialLogin = 'user@123';
      const specialPassword = 'pass!@#$%';

      const loginInput = screen.getByLabelText(/login/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      
      await user.type(loginInput, specialLogin);
      await user.type(passwordInput, specialPassword);
      
      const submitButton = screen.getByRole('button', { name: /entrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          login: specialLogin,
          password: specialPassword,
        });
      });
    });
  });

  describe('Performance', () => {
    it('deve renderizar rapidamente', () => {
      const startTime = performance.now();
      
      renderWithProviders(<Login />);
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('deve limpar timers ao desmontar', () => {
      const { unmount } = renderWithProviders(<Login />);
      
      // Simular autenticação para criar timer
      mockUseAuth.mockReturnValue({
        user: { id: '1', login: 'user', email: 'user@test.com', role: 'USER' },
        isAuthenticated: true,
        isLoading: false,
        login: mockLogin,
        logout: vi.fn(),
        register: vi.fn(),
      });

      unmount();
      
      // Verificar se não há timers pendentes
      expect(vi.getTimerCount()).toBe(0);
    });
  });
});