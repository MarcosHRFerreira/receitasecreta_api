import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Register from '../../../pages/Register';
import { AuthProvider } from '../../../contexts/AuthContext';
import { useAuth } from '../../../hooks/useAuth';
import type { UserRequest } from '../../../types';

// Mocks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

vi.mock('../../../hooks/useAuth');

const mockNavigate = vi.fn();
const mockUseAuth = vi.mocked(useAuth);
const mockUseNavigate = vi.mocked(useNavigate);

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

describe('Register Page', () => {
  const mockRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
    
    mockUseNavigate.mockReturnValue(mockNavigate);
    
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      register: mockRegister,
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Renderização', () => {
    it('deve renderizar o formulário de registro', () => {
      renderWithProviders(<Register />);

      expect(screen.getByText('Receita Secreta')).toBeInTheDocument();
      expect(screen.getByText('Crie sua conta')).toBeInTheDocument();
      expect(screen.getByLabelText(/login/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^senha/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cadastrar/i })).toBeInTheDocument();
    });

    it('deve renderizar link para login', () => {
      renderWithProviders(<Register />);

      expect(screen.getByText(/já tem uma conta/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /faça login/i })).toBeInTheDocument();
    });

    it('deve renderizar o ícone da aplicação', () => {
      renderWithProviders(<Register />);

      const icon = screen.getByText('🍰');
      expect(icon).toBeInTheDocument();
      expect(icon.closest('div')).toHaveClass('bg-blue-100', 'rounded-full');
    });
  });

  describe('Validação de formulário', () => {
    it('deve mostrar erros de validação para campos vazios', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithProviders(<Register />);

      const submitButton = screen.getByRole('button', { name: /cadastrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Login é obrigatório')).toBeInTheDocument();
        expect(screen.getByText('Email é obrigatório')).toBeInTheDocument();
        expect(screen.getByText('Senha é obrigatória')).toBeInTheDocument();
        expect(screen.getByText('Confirmação de senha é obrigatória')).toBeInTheDocument();
      });
    });

    it('deve validar tamanho mínimo do login', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithProviders(<Register />);

      const loginInput = screen.getByLabelText(/login/i);
      await user.type(loginInput, 'ab');
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Login deve ter pelo menos 3 caracteres')).toBeInTheDocument();
      });
    });

    it('deve validar padrão do login', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithProviders(<Register />);

      const loginInput = screen.getByLabelText(/login/i);
      await user.type(loginInput, 'user@invalid');
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Login deve conter apenas letras, números e underscore')).toBeInTheDocument();
      });
    });

    it('deve validar formato do email', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithProviders(<Register />);

      const emailInput = screen.getByLabelText(/e-mail/i);
        await user.type(emailInput, 'email-invalido');
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email deve ter um formato válido')).toBeInTheDocument();
      });
    });

    it('deve validar tamanho mínimo da senha', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithProviders(<Register />);

      const passwordInput = screen.getByLabelText(/^senha/i);
      await user.type(passwordInput, '123');
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Senha deve ter pelo menos 6 caracteres')).toBeInTheDocument();
      });
    });

    it('deve validar confirmação de senha', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithProviders(<Register />);

      const passwordInput = screen.getByLabelText(/^senha/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      
      await user.type(passwordInput, 'senha123');
      await user.type(confirmPasswordInput, 'senha456');
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('As senhas não coincidem')).toBeInTheDocument();
      });
    });

    it('deve aceitar dados válidos', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithProviders(<Register />);

      const loginInput = screen.getByLabelText(/login/i);
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/^senha/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      
      await user.type(loginInput, 'usuario123');
      await user.type(emailInput, 'usuario@test.com');
      await user.type(passwordInput, 'senha123');
      await user.type(confirmPasswordInput, 'senha123');
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          login: 'usuario123',
          email: 'usuario@test.com',
          password: 'senha123',
        });
      });
    });
  });

  describe('Processo de registro', () => {
    it('deve mostrar loading durante o registro', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockRegister.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
      
      renderWithProviders(<Register />);

      const loginInput = screen.getByLabelText(/login/i);
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/^senha/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      
      await user.type(loginInput, 'usuario123');
      await user.type(emailInput, 'usuario@test.com');
      await user.type(passwordInput, 'senha123');
      await user.type(confirmPasswordInput, 'senha123');
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i });
      await user.click(submitButton);

      expect(screen.getByText(/carregando/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('deve desabilitar campos durante o loading', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockRegister.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
      
      renderWithProviders(<Register />);

      const loginInput = screen.getByLabelText(/login/i);
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/^senha/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      
      await user.type(loginInput, 'usuario123');
      await user.type(emailInput, 'usuario@test.com');
      await user.type(passwordInput, 'senha123');
      await user.type(confirmPasswordInput, 'senha123');
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i });
      await user.click(submitButton);

      expect(loginInput).toBeDisabled();
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(confirmPasswordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });

    it('deve mostrar mensagem de sucesso e redirecionar', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockRegister.mockResolvedValue(undefined);
      
      renderWithProviders(<Register />);

      const loginInput = screen.getByLabelText(/login/i);
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/^senha/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      
      await user.type(loginInput, 'usuario123');
      await user.type(emailInput, 'usuario@test.com');
      await user.type(passwordInput, 'senha123');
      await user.type(confirmPasswordInput, 'senha123');
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Usuário cadastrado com sucesso! Redirecionando...')).toBeInTheDocument();
      });

      // Avançar timer para redirecionamento
      vi.advanceTimersByTime(2000);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('deve mostrar erro quando registro falha', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const errorMessage = 'Login já existe';
      mockRegister.mockRejectedValue({
        response: {
          data: {
            message: errorMessage,
          },
        },
      });
      
      renderWithProviders(<Register />);

      const loginInput = screen.getByLabelText(/login/i);
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/^senha/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      
      await user.type(loginInput, 'usuario123');
      await user.type(emailInput, 'usuario@test.com');
      await user.type(passwordInput, 'senha123');
      await user.type(confirmPasswordInput, 'senha123');
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('deve mostrar erro genérico quando não há mensagem específica', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockRegister.mockRejectedValue(new Error('Network error'));
      
      renderWithProviders(<Register />);

      const loginInput = screen.getByLabelText(/login/i);
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/^senha/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      
      await user.type(loginInput, 'usuario123');
      await user.type(emailInput, 'usuario@test.com');
      await user.type(passwordInput, 'senha123');
      await user.type(confirmPasswordInput, 'senha123');
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Erro ao cadastrar usuário. Tente novamente.')).toBeInTheDocument();
      });
    });

    it('deve limpar mensagens ao tentar novo registro', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockRegister.mockRejectedValueOnce(new Error('Erro'));
      
      renderWithProviders(<Register />);

      const loginInput = screen.getByLabelText(/login/i);
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/^senha/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      const submitButton = screen.getByRole('button', { name: /cadastrar/i });
      
      // Primeiro registro com erro
      await user.type(loginInput, 'usuario123');
      await user.type(emailInput, 'usuario@test.com');
      await user.type(passwordInput, 'senha123');
      await user.type(confirmPasswordInput, 'senha123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Erro ao cadastrar usuário. Tente novamente.')).toBeInTheDocument();
      });

      // Segundo registro - erro deve ser limpo
      mockRegister.mockResolvedValueOnce(undefined);
      await user.clear(loginInput);
      await user.clear(emailInput);
      await user.clear(passwordInput);
      await user.clear(confirmPasswordInput);
      await user.type(loginInput, 'usuario456');
      await user.type(emailInput, 'usuario456@test.com');
      await user.type(passwordInput, 'senha456');
      await user.type(confirmPasswordInput, 'senha456');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('Erro ao cadastrar usuário. Tente novamente.')).not.toBeInTheDocument();
      });
    });
  });

  describe('Interface e acessibilidade', () => {
    it('deve ter labels associados aos inputs', () => {
      renderWithProviders(<Register />);

      const loginInput = screen.getByLabelText(/login/i);
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/^senha/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);

      expect(loginInput).toHaveAttribute('id', 'login');
      expect(emailInput).toHaveAttribute('id', 'email');
      expect(passwordInput).toHaveAttribute('id', 'password');
      expect(confirmPasswordInput).toHaveAttribute('id', 'confirmPassword');
    });

    it('deve ter placeholders informativos', () => {
      renderWithProviders(<Register />);

      expect(screen.getByPlaceholderText('Digite seu login')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Digite seu email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Digite sua senha')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirme sua senha')).toBeInTheDocument();
    });

    it('deve ter tipos corretos nos inputs', () => {
      renderWithProviders(<Register />);

      const loginInput = screen.getByLabelText(/login/i);
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/^senha/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);

      expect(loginInput).toHaveAttribute('type', 'text');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });

    it('deve ter link com href correto', () => {
      renderWithProviders(<Register />);

      const loginLink = screen.getByRole('link', { name: /faça login/i });
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('deve marcar campos obrigatórios', () => {
      renderWithProviders(<Register />);

      expect(screen.getByText('Login *')).toBeInTheDocument();
      expect(screen.getByText('Email *')).toBeInTheDocument();
      expect(screen.getByText('Senha *')).toBeInTheDocument();
      expect(screen.getByText('Confirmar Senha *')).toBeInTheDocument();
    });
  });

  describe('Estilização e layout', () => {
    it('deve aplicar classes CSS corretas', () => {
      renderWithProviders(<Register />);

      const container = screen.getByText('Receita Secreta').closest('.max-w-md');
      expect(container).toHaveClass('max-w-md', 'w-full', 'space-y-8');
    });

    it('deve ter estrutura de erro bem formatada', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockRegister.mockRejectedValue(new Error('Teste'));
      
      renderWithProviders(<Register />);

      const loginInput = screen.getByLabelText(/login/i);
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/^senha/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      
      await user.type(loginInput, 'test123');
      await user.type(emailInput, 'test@test.com');
      await user.type(passwordInput, 'test123');
      await user.type(confirmPasswordInput, 'test123');
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        const errorContainer = screen.getByText('Erro ao cadastrar usuário. Tente novamente.').closest('div');
        expect(errorContainer).toHaveClass('bg-red-50', 'border', 'border-red-200', 'text-red-700');
      });
    });

    it('deve ter estrutura de sucesso bem formatada', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockRegister.mockResolvedValue(undefined);
      
      renderWithProviders(<Register />);

      const loginInput = screen.getByLabelText(/login/i);
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/^senha/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      
      await user.type(loginInput, 'test123');
      await user.type(emailInput, 'test@test.com');
      await user.type(passwordInput, 'test123');
      await user.type(confirmPasswordInput, 'test123');
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        const successContainer = screen.getByText('Usuário cadastrado com sucesso! Redirecionando...').closest('div');
        expect(successContainer).toHaveClass('bg-green-50', 'border', 'border-green-200', 'text-green-700');
      });
    });
  });

  describe('Validação em tempo real', () => {
    it('deve validar confirmação de senha em tempo real', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithProviders(<Register />);

      const passwordInput = screen.getByLabelText(/^senha/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      
      await user.type(passwordInput, 'senha123');
      await user.type(confirmPasswordInput, 'senha456');
      
      // Sair do campo para triggerar validação
      await user.tab();
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('As senhas não coincidem')).toBeInTheDocument();
      });
    });

    it('deve remover erro quando senhas coincidirem', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithProviders(<Register />);

      const passwordInput = screen.getByLabelText(/^senha/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      const submitButton = screen.getByRole('button', { name: /cadastrar/i });
      
      // Primeiro, criar erro
      await user.type(passwordInput, 'senha123');
      await user.type(confirmPasswordInput, 'senha456');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('As senhas não coincidem')).toBeInTheDocument();
      });

      // Corrigir senha
      await user.clear(confirmPasswordInput);
      await user.type(confirmPasswordInput, 'senha123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('As senhas não coincidem')).not.toBeInTheDocument();
      });
    });
  });

  describe('Casos extremos', () => {
    it('deve funcionar com dados muito longos', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithProviders(<Register />);

      const longLogin = 'a'.repeat(50);
      const longEmail = 'b'.repeat(40) + '@test.com';
      const longPassword = 'c'.repeat(50);

      const loginInput = screen.getByLabelText(/login/i);
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/^senha/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      
      await user.type(loginInput, longLogin);
      await user.type(emailInput, longEmail);
      await user.type(passwordInput, longPassword);
      await user.type(confirmPasswordInput, longPassword);
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          login: longLogin,
          email: longEmail,
          password: longPassword,
        });
      });
    });

    it('deve lidar com caracteres especiais no login válido', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithProviders(<Register />);

      const specialLogin = 'user_123';
      const email = 'user@test.com';
      const password = 'password123';

      const loginInput = screen.getByLabelText(/login/i);
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/^senha/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      
      await user.type(loginInput, specialLogin);
      await user.type(emailInput, email);
      await user.type(passwordInput, password);
      await user.type(confirmPasswordInput, password);
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          login: specialLogin,
          email: email,
          password: password,
        });
      });
    });
  });

  describe('Performance', () => {
    it('deve renderizar rapidamente', () => {
      const startTime = performance.now();
      
      renderWithProviders(<Register />);
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('deve limpar timers ao desmontar', () => {
      const { unmount } = renderWithProviders(<Register />);
      
      unmount();
      
      // Verificar se não há timers pendentes
      expect(vi.getTimerCount()).toBe(0);
    });
  });
});
