import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../contexts/AuthContext';
import Login from '../../../pages/Login';
import Register from '../../../pages/Register';
import Dashboard from '../../../pages/Dashboard';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Auth Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Login Flow', () => {
    it('should complete successful login flow', async () => {
      const Wrapper = createWrapper();
      
      render(<Login />, { wrapper: Wrapper });

      // Fill login form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      // Wait for login to complete
      await waitFor(() => {
        expect(localStorage.getItem).toHaveBeenCalledWith('token');
      });

      // Verify success message or redirect
      await waitFor(() => {
        expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument();
      });
    });

    it('should handle login failure', async () => {
      // Override handler for failed login
      server.use(
        http.post('http://localhost:8082/receitasecreta/auth/login', () => {
          return HttpResponse.json(
            { message: 'Credenciais inválidas' },
            { status: 401 }
          );
        })
      );

      const Wrapper = createWrapper();
      
      render(<Login />, { wrapper: Wrapper });

      // Fill login form with invalid credentials
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      fireEvent.change(emailInput, { target: { value: 'invalid@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/credenciais inválidas/i)).toBeInTheDocument();
      });

      // Verify user is not logged in
      expect(localStorage.setItem).not.toHaveBeenCalledWith('token', expect.any(String));
    });

    it('should handle network errors during login', async () => {
      // Override handler for network error
      server.use(
        http.post('http://localhost:8082/receitasecreta/auth/login', () => {
          return HttpResponse.error();
        })
      );

      const Wrapper = createWrapper();
      
      render(<Login />, { wrapper: Wrapper });

      // Fill and submit form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/erro de conexão/i)).toBeInTheDocument();
      });
    });
  });

  describe('Registration Flow', () => {
    it('should complete successful registration flow', async () => {
      const Wrapper = createWrapper();
      
      render(<Register />, { wrapper: Wrapper });

      // Fill registration form
      const usernameInput = screen.getByLabelText(/nome de usuário/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      const submitButton = screen.getByRole('button', { name: /cadastrar/i });

      fireEvent.change(usernameInput, { target: { value: 'newuser' } });
      fireEvent.change(emailInput, { target: { value: 'newuser@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      // Wait for registration to complete
      await waitFor(() => {
        expect(screen.getByText(/cadastro realizado com sucesso/i)).toBeInTheDocument();
      });
    });

    it('should handle registration with existing email', async () => {
      // Override handler for existing email
      server.use(
        http.post('http://localhost:8082/receitasecreta/auth/register', () => {
          return HttpResponse.json(
            { message: 'E-mail já está em uso' },
            { status: 409 }
          );
        })
      );

      const Wrapper = createWrapper();
      
      render(<Register />, { wrapper: Wrapper });

      // Fill registration form
      const usernameInput = screen.getByLabelText(/nome de usuário/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      const submitButton = screen.getByRole('button', { name: /cadastrar/i });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/e-mail já está em uso/i)).toBeInTheDocument();
      });
    });
  });

  describe('Password Reset Flow', () => {
    it('should handle forgot password request', async () => {
      const Wrapper = createWrapper();
      
      render(<Login />, { wrapper: Wrapper });

      // Click forgot password link
      const forgotPasswordLink = screen.getByText(/esqueci minha senha/i);
      fireEvent.click(forgotPasswordLink);

      // Fill email for password reset
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /enviar/i });

      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.click(submitButton);

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText(/instruções enviadas para seu email/i)).toBeInTheDocument();
      });
    });

    it('should handle forgot password with invalid email', async () => {
      // Override handler for invalid email
      server.use(
        http.post('http://localhost:8082/receitasecreta/auth/forgot-password', () => {
          return HttpResponse.json(
            { message: 'E-mail não encontrado' },
            { status: 404 }
          );
        })
      );

      const Wrapper = createWrapper();
      
      render(<Login />, { wrapper: Wrapper });

      // Click forgot password link
      const forgotPasswordLink = screen.getByText(/esqueci minha senha/i);
      fireEvent.click(forgotPasswordLink);

      // Fill invalid email
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /enviar/i });

      fireEvent.change(emailInput, { target: { value: 'invalid@test.com' } });
      fireEvent.click(submitButton);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/e-mail não encontrado/i)).toBeInTheDocument();
      });
    });
  });

  describe('Authentication State Persistence', () => {
    it('should maintain authentication state across page reloads', async () => {
      // Set up authenticated state
      const mockToken = 'mock-jwt-token';
      const mockUser = {
        id: '1',
        username: 'Test User',
        email: 'test@test.com',
        role: 'USER'
      };

      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      const Wrapper = createWrapper();
      
      render(<Dashboard />, { wrapper: Wrapper });

      // Verify user is authenticated
      await waitFor(() => {
        expect(screen.getByText(/bem-vindo/i)).toBeInTheDocument();
        expect(screen.getByText(mockUser.username)).toBeInTheDocument();
      });
    });

    it('should handle expired token', async () => {
      // Override handler to return 401
      server.use(
        http.get('http://localhost:8082/receitasecreta/receitas', () => {
          return HttpResponse.json(
            { message: 'Token expirado' },
            { status: 401 }
          );
        })
      );

      // Set up expired token
      localStorage.setItem('token', 'expired-token');
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        username: 'Test User',
        email: 'test@test.com',
        role: 'USER'
      }));

      const Wrapper = createWrapper();
      
      render(<Dashboard />, { wrapper: Wrapper });

      // Wait for automatic logout
      await waitFor(() => {
        expect(localStorage.removeItem).toHaveBeenCalledWith('token');
        expect(localStorage.removeItem).toHaveBeenCalledWith('user');
      });
    });
  });

  describe('Protected Routes', () => {
    it('should redirect unauthenticated users to login', async () => {
      const Wrapper = createWrapper();
      
      render(<Dashboard />, { wrapper: Wrapper });

      // Should redirect to login
      await waitFor(() => {
        expect(screen.getByText(/fazer login/i)).toBeInTheDocument();
      });
    });

    it('should allow authenticated users to access protected routes', async () => {
      // Set up authenticated state
      localStorage.setItem('token', 'valid-token');
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        username: 'Test User',
        email: 'test@test.com',
        role: 'USER'
      }));

      const Wrapper = createWrapper();
      
      render(<Dashboard />, { wrapper: Wrapper });

      // Should access dashboard
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });
    });
  });
});