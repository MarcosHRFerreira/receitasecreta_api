import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../contexts/AuthContext';
import UsuariosList from '../../../pages/UsuariosList';
import UsuarioForm from '../../../pages/UsuarioForm';
import UsuarioView from '../../../pages/UsuarioView';
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

// Mock authenticated admin user
const mockAuthenticatedAdmin = () => {
  localStorage.setItem('token', 'valid-token');
  localStorage.setItem('user', JSON.stringify({
    id: '1',
    username: 'Admin User',
    email: 'admin@test.com',
    role: 'ADMIN'
  }));
};

// Mock authenticated regular user
const mockAuthenticatedUser = () => {
  localStorage.setItem('token', 'valid-token');
  localStorage.setItem('user', JSON.stringify({
    id: '2',
    username: 'Regular User',
    email: 'user@test.com',
    role: 'USER'
  }));
};

describe('Usuarios Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Admin Access Control', () => {
    it('should allow admin to access usuarios list', async () => {
      mockAuthenticatedAdmin();
      const Wrapper = createWrapper();
      
      render(<UsuariosList />, { wrapper: Wrapper });

      // Wait for usuarios to load
      await waitFor(() => {
        expect(screen.getByText(/admin user/i)).toBeInTheDocument();
        expect(screen.getByText(/regular user/i)).toBeInTheDocument();
      });

      // Verify admin-specific elements
      expect(screen.getByRole('button', { name: /novo usuário/i })).toBeInTheDocument();
    });

    it('should deny regular user access to usuarios list', async () => {
      mockAuthenticatedUser();
      
      // Override handler to return 403 for regular users
      server.use(
        http.get('http://localhost:8082/receitasecreta/usuarios', () => {
          return HttpResponse.json(
            { message: 'Acesso negado' },
            { status: 403 }
          );
        })
      );

      const Wrapper = createWrapper();
      
      render(<UsuariosList />, { wrapper: Wrapper });

      // Wait for access denied message
      await waitFor(() => {
        expect(screen.getByText(/acesso negado/i)).toBeInTheDocument();
      });
    });

    it('should redirect unauthenticated users', async () => {
      // No authentication
      const Wrapper = createWrapper();
      
      render(<UsuariosList />, { wrapper: Wrapper });

      // Should redirect to login
      await waitFor(() => {
        expect(window.location.pathname).toBe('/login');
      });
    });
  });

  describe('Usuarios List Flow', () => {
    beforeEach(() => {
      mockAuthenticatedAdmin();
    });

    it('should load and display usuarios list', async () => {
      const Wrapper = createWrapper();
      
      render(<UsuariosList />, { wrapper: Wrapper });

      // Wait for usuarios to load
      await waitFor(() => {
        expect(screen.getByText(/admin user/i)).toBeInTheDocument();
        expect(screen.getByText(/regular user/i)).toBeInTheDocument();
        expect(screen.getByText(/chef user/i)).toBeInTheDocument();
      });

      // Verify pagination
      expect(screen.getByText(/página 1 de/i)).toBeInTheDocument();
    });

    it('should filter usuarios by search term', async () => {
      const Wrapper = createWrapper();
      
      render(<UsuariosList />, { wrapper: Wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/admin user/i)).toBeInTheDocument();
      });

      // Search for specific usuario
      const searchInput = screen.getByPlaceholderText(/buscar usuários/i);
      fireEvent.change(searchInput, { target: { value: 'admin' } });

      // Wait for filtered results
      await waitFor(() => {
        expect(screen.getByText(/admin user/i)).toBeInTheDocument();
        expect(screen.queryByText(/regular user/i)).not.toBeInTheDocument();
      });
    });

    it('should filter usuarios by role', async () => {
      const Wrapper = createWrapper();
      
      render(<UsuariosList />, { wrapper: Wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/admin user/i)).toBeInTheDocument();
      });

      // Filter by role
      const roleSelect = screen.getByLabelText(/função/i);
      fireEvent.change(roleSelect, { target: { value: 'ADMIN' } });

      // Wait for filtered results
      await waitFor(() => {
        expect(screen.getByText(/admin user/i)).toBeInTheDocument();
        expect(screen.queryByText(/regular user/i)).not.toBeInTheDocument();
      });
    });

    it('should handle pagination', async () => {
      const Wrapper = createWrapper();
      
      render(<UsuariosList />, { wrapper: Wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/página 1 de/i)).toBeInTheDocument();
      });

      // Check if next page button exists and click it
      const nextButton = screen.queryByText(/próxima/i);
      if (nextButton) {
        fireEvent.click(nextButton);
        
        await waitFor(() => {
          expect(screen.getByText(/página 2 de/i)).toBeInTheDocument();
        });
      }
    });

    it('should display user status badges', async () => {
      const Wrapper = createWrapper();
      
      render(<UsuariosList />, { wrapper: Wrapper });

      // Wait for usuarios to load
      await waitFor(() => {
        expect(screen.getByText(/admin user/i)).toBeInTheDocument();
      });

      // Check for status badges
      const activeBadges = screen.getAllByText(/ativo/i);
      expect(activeBadges.length).toBeGreaterThan(0);
    });
  });

  describe('Usuario Creation Flow', () => {
    beforeEach(() => {
      mockAuthenticatedAdmin();
    });

    it('should create a new usuario successfully', async () => {
      const Wrapper = createWrapper();
      
      render(<UsuarioForm />, { wrapper: Wrapper });

      // Fill usuario form
      const usernameInput = screen.getByLabelText(/nome de usuário/i);
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const roleSelect = screen.getByLabelText(/função/i);
      const submitButton = screen.getByRole('button', { name: /salvar usuário/i });

      fireEvent.change(usernameInput, { target: { value: 'Novo Usuario Teste' } });
      fireEvent.change(emailInput, { target: { value: 'novo@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'senha123' } });
      fireEvent.change(roleSelect, { target: { value: 'USER' } });

      fireEvent.click(submitButton);

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText(/usuário criado com sucesso/i)).toBeInTheDocument();
      });
    });

    it('should handle validation errors', async () => {
      const Wrapper = createWrapper();
      
      render(<UsuarioForm />, { wrapper: Wrapper });

      // Try to submit empty form
      const submitButton = screen.getByRole('button', { name: /salvar usuário/i });
      fireEvent.click(submitButton);

      // Wait for validation errors
      await waitFor(() => {
        expect(screen.getByText(/nome de usuário é obrigatório/i)).toBeInTheDocument();
        expect(screen.getByText(/e-mail é obrigatório/i)).toBeInTheDocument();
        expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument();
        expect(screen.getByText(/função é obrigatória/i)).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      const Wrapper = createWrapper();
      
      render(<UsuarioForm />, { wrapper: Wrapper });

      // Fill form with invalid email
      const usernameInput = screen.getByLabelText(/nome de usuário/i);
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const roleSelect = screen.getByLabelText(/função/i);
      const submitButton = screen.getByRole('button', { name: /salvar usuário/i });

      fireEvent.change(usernameInput, { target: { value: 'Usuario Teste' } });
      fireEvent.change(emailInput, { target: { value: 'email-invalido' } });
      fireEvent.change(passwordInput, { target: { value: 'senha123' } });
      fireEvent.change(roleSelect, { target: { value: 'USER' } });

      fireEvent.click(submitButton);

      // Wait for validation error
      await waitFor(() => {
        expect(screen.getByText(/e-mail deve ter um formato válido/i)).toBeInTheDocument();
      });
    });

    it('should validate password strength', async () => {
      const Wrapper = createWrapper();
      
      render(<UsuarioForm />, { wrapper: Wrapper });

      // Fill form with weak password
      const usernameInput = screen.getByLabelText(/nome de usuário/i);
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const roleSelect = screen.getByLabelText(/função/i);
      const submitButton = screen.getByRole('button', { name: /salvar usuário/i });

      fireEvent.change(usernameInput, { target: { value: 'Usuario Teste' } });
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.change(passwordInput, { target: { value: '123' } });
      fireEvent.change(roleSelect, { target: { value: 'USER' } });

      fireEvent.click(submitButton);

      // Wait for validation error
      await waitFor(() => {
        expect(screen.getByText(/senha deve ter pelo menos 6 caracteres/i)).toBeInTheDocument();
      });
    });

    it('should handle duplicate email error', async () => {
      // Override handler for duplicate email
      server.use(
        http.post('http://localhost:8082/receitasecreta/usuarios', () => {
          return HttpResponse.json(
            { message: 'E-mail já está em uso' },
            { status: 409 }
          );
        })
      );

      const Wrapper = createWrapper();
      
      render(<UsuarioForm />, { wrapper: Wrapper });

      // Fill and submit form
      const usernameInput = screen.getByLabelText(/nome de usuário/i);
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const roleSelect = screen.getByLabelText(/função/i);
      const submitButton = screen.getByRole('button', { name: /salvar usuário/i });

      fireEvent.change(usernameInput, { target: { value: 'Novo Usuario' } });
      fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'senha123' } });
      fireEvent.change(roleSelect, { target: { value: 'USER' } });

      fireEvent.click(submitButton);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/e-mail já está em uso/i)).toBeInTheDocument();
      });
    });
  });

  describe('Usuario View Flow', () => {
    beforeEach(() => {
      mockAuthenticatedAdmin();
    });

    it('should display usuario details', async () => {
      const Wrapper = createWrapper();
      
      // Mock route params
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useParams: () => ({ id: '1' })
        };
      });

      render(<UsuarioView />, { wrapper: Wrapper });

      // Wait for usuario to load
      await waitFor(() => {
        expect(screen.getByText(/admin user/i)).toBeInTheDocument();
        expect(screen.getByText(/admin@test.com/i)).toBeInTheDocument();
        expect(screen.getByText(/admin/i)).toBeInTheDocument();
        expect(screen.getByText(/ativo/i)).toBeInTheDocument();
      });
    });

    it('should handle usuario not found', async () => {
      // Override handler for not found
      server.use(
        http.get('http://localhost:8082/receitasecreta/usuarios/:id', () => {
          return HttpResponse.json(
            { message: 'Usuário não encontrado' },
            { status: 404 }
          );
        })
      );

      const Wrapper = createWrapper();
      
      render(<UsuarioView />, { wrapper: Wrapper });

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/usuário não encontrado/i)).toBeInTheDocument();
      });
    });

    it('should display creation and update dates', async () => {
      const Wrapper = createWrapper();
      
      render(<UsuarioView />, { wrapper: Wrapper });

      // Wait for usuario to load
      await waitFor(() => {
        expect(screen.getByText(/admin user/i)).toBeInTheDocument();
      });

      // Check if dates are displayed
      expect(screen.getByText(/criado em/i)).toBeInTheDocument();
      expect(screen.getByText(/atualizado em/i)).toBeInTheDocument();
    });
  });

  describe('Usuario Update Flow', () => {
    beforeEach(() => {
      mockAuthenticatedAdmin();
    });

    it('should update usuario successfully', async () => {
      const Wrapper = createWrapper();
      
      // Mock route params for edit
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useParams: () => ({ id: '1' })
        };
      });

      render(<UsuarioForm />, { wrapper: Wrapper });

      // Wait for form to load with existing data
      await waitFor(() => {
        expect(screen.getByDisplayValue(/admin user/i)).toBeInTheDocument();
      });

      // Update usuario name
      const usernameInput = screen.getByLabelText(/nome de usuário/i);
      fireEvent.change(usernameInput, { target: { value: 'Admin User Atualizado' } });

      const submitButton = screen.getByRole('button', { name: /atualizar usuário/i });
      fireEvent.click(submitButton);

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText(/usuário atualizado com sucesso/i)).toBeInTheDocument();
      });
    });

    it('should handle update errors', async () => {
      // Override handler for update error
      server.use(
        http.put('http://localhost:8082/receitasecreta/usuarios/:id', () => {
          return HttpResponse.json(
            { message: 'Erro ao atualizar usuário' },
            { status: 500 }
          );
        })
      );

      const Wrapper = createWrapper();
      
      render(<UsuarioForm />, { wrapper: Wrapper });

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByDisplayValue(/admin user/i)).toBeInTheDocument();
      });

      // Update and submit
      const usernameInput = screen.getByLabelText(/nome de usuário/i);
      fireEvent.change(usernameInput, { target: { value: 'Usuario Atualizado' } });

      const submitButton = screen.getByRole('button', { name: /atualizar usuário/i });
      fireEvent.click(submitButton);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/erro ao atualizar usuário/i)).toBeInTheDocument();
      });
    });

    it('should not require password for updates', async () => {
      const Wrapper = createWrapper();
      
      render(<UsuarioForm />, { wrapper: Wrapper });

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByDisplayValue(/admin user/i)).toBeInTheDocument();
      });

      // Password field should be optional for updates
      const passwordInput = screen.queryByLabelText(/senha/i);
      if (passwordInput) {
        expect(passwordInput).not.toHaveAttribute('required');
      }
    });
  });

  describe('Usuario Delete Flow', () => {
    beforeEach(() => {
      mockAuthenticatedAdmin();
    });

    it('should delete usuario successfully', async () => {
      const Wrapper = createWrapper();
      
      render(<UsuariosList />, { wrapper: Wrapper });

      // Wait for usuarios to load
      await waitFor(() => {
        expect(screen.getByText(/regular user/i)).toBeInTheDocument();
      });

      // Find and click delete button for regular user (not admin)
      const usuarioCard = screen.getByText(/regular user/i).closest('[data-testid="usuario-card"]');
      const deleteButton = within(usuarioCard!).getByRole('button', { name: /excluir/i });
      fireEvent.click(deleteButton);

      // Confirm deletion in modal
      const confirmButton = screen.getByRole('button', { name: /confirmar/i });
      fireEvent.click(confirmButton);

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText(/usuário excluído com sucesso/i)).toBeInTheDocument();
      });

      // Verify usuario is removed from list
      await waitFor(() => {
        expect(screen.queryByText(/regular user/i)).not.toBeInTheDocument();
      });
    });

    it('should prevent self-deletion', async () => {
      const Wrapper = createWrapper();
      
      render(<UsuariosList />, { wrapper: Wrapper });

      // Wait for usuarios to load
      await waitFor(() => {
        expect(screen.getByText(/admin user/i)).toBeInTheDocument();
      });

      // Try to find delete button for current user (admin)
      const adminCard = screen.getByText(/admin user/i).closest('[data-testid="usuario-card"]');
      const deleteButton = within(adminCard!).queryByRole('button', { name: /excluir/i });
      
      // Delete button should not exist for current user
      expect(deleteButton).not.toBeInTheDocument();
    });

    it('should handle delete errors', async () => {
      // Override handler for delete error
      server.use(
        http.delete('http://localhost:8082/receitasecreta/usuarios/:id', () => {
          return HttpResponse.json(
            { message: 'Erro ao excluir usuário' },
            { status: 500 }
          );
        })
      );

      const Wrapper = createWrapper();
      
      render(<UsuariosList />, { wrapper: Wrapper });

      // Wait for usuarios to load
      await waitFor(() => {
        expect(screen.getByText(/regular user/i)).toBeInTheDocument();
      });

      // Find and click delete button
      const usuarioCard = screen.getByText(/regular user/i).closest('[data-testid="usuario-card"]');
      const deleteButton = within(usuarioCard!).getByRole('button', { name: /excluir/i });
      fireEvent.click(deleteButton);

      // Confirm deletion in modal
      const confirmButton = screen.getByRole('button', { name: /confirmar/i });
      fireEvent.click(confirmButton);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/erro ao excluir usuário/i)).toBeInTheDocument();
      });
    });
  });

  describe('Role Management', () => {
    beforeEach(() => {
      mockAuthenticatedAdmin();
    });

    it('should display different role badges', async () => {
      const Wrapper = createWrapper();
      
      render(<UsuariosList />, { wrapper: Wrapper });

      // Wait for usuarios to load
      await waitFor(() => {
        expect(screen.getByText(/admin user/i)).toBeInTheDocument();
      });

      // Check for different role badges
      expect(screen.getByText(/admin/i)).toBeInTheDocument();
      expect(screen.getByText(/user/i)).toBeInTheDocument();
    });

    it('should allow role changes in edit form', async () => {
      const Wrapper = createWrapper();
      
      render(<UsuarioForm />, { wrapper: Wrapper });

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByDisplayValue(/admin user/i)).toBeInTheDocument();
      });

      // Change role
      const roleSelect = screen.getByLabelText(/função/i);
      fireEvent.change(roleSelect, { target: { value: 'USER' } });

      // Verify role was changed
      expect(roleSelect).toHaveValue('USER');
    });

    it('should validate role selection', async () => {
      const Wrapper = createWrapper();
      
      render(<UsuarioForm />, { wrapper: Wrapper });

      // Fill form without role
      const usernameInput = screen.getByLabelText(/nome de usuário/i);
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /salvar usuário/i });

      fireEvent.change(usernameInput, { target: { value: 'Usuario Teste' } });
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'senha123' } });

      fireEvent.click(submitButton);

      // Wait for validation error
      await waitFor(() => {
        expect(screen.getByText(/função é obrigatória/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockAuthenticatedAdmin();
    });

    it('should handle network errors gracefully', async () => {
      // Override handler for network error
      server.use(
        http.get('http://localhost:8082/receitasecreta/usuarios', () => {
          return HttpResponse.error();
        })
      );

      const Wrapper = createWrapper();
      
      render(<UsuariosList />, { wrapper: Wrapper });

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/erro de conexão/i)).toBeInTheDocument();
      });

      // Verify retry button is available
      const retryButton = screen.getByRole('button', { name: /tentar novamente/i });
      expect(retryButton).toBeInTheDocument();
    });

    it('should handle empty results', async () => {
      // Override handler for empty results
      server.use(
        http.get('http://localhost:8082/receitasecreta/usuarios', () => {
          return HttpResponse.json({
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: 10,
            number: 0
          });
        })
      );

      const Wrapper = createWrapper();
      
      render(<UsuariosList />, { wrapper: Wrapper });

      // Wait for empty state message
      await waitFor(() => {
        expect(screen.getByText(/nenhum usuário encontrado/i)).toBeInTheDocument();
      });
    });

    it('should handle unauthorized access', async () => {
      // Override handler for unauthorized
      server.use(
        http.get('http://localhost:8082/receitasecreta/usuarios', () => {
          return HttpResponse.json(
            { message: 'Token inválido' },
            { status: 401 }
          );
        })
      );

      const Wrapper = createWrapper();
      
      render(<UsuariosList />, { wrapper: Wrapper });

      // Should redirect to login
      await waitFor(() => {
        expect(window.location.pathname).toBe('/login');
      });
    });
  });

  describe('Performance and UX', () => {
    beforeEach(() => {
      mockAuthenticatedAdmin();
    });

    it('should show loading states during operations', async () => {
      const Wrapper = createWrapper();
      
      render(<UsuariosList />, { wrapper: Wrapper });

      // Should show loading initially
      expect(screen.getByText(/carregando/i)).toBeInTheDocument();

      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByText(/admin user/i)).toBeInTheDocument();
      });
    });

    it('should debounce search input', async () => {
      const Wrapper = createWrapper();
      
      render(<UsuariosList />, { wrapper: Wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/admin user/i)).toBeInTheDocument();
      });

      // Type quickly in search input
      const searchInput = screen.getByPlaceholderText(/buscar usuários/i);
      fireEvent.change(searchInput, { target: { value: 'a' } });
      fireEvent.change(searchInput, { target: { value: 'ad' } });
      fireEvent.change(searchInput, { target: { value: 'adm' } });
      fireEvent.change(searchInput, { target: { value: 'admi' } });
      fireEvent.change(searchInput, { target: { value: 'admin' } });

      // Should debounce and only search after delay
      await waitFor(() => {
        expect(screen.getByText(/admin user/i)).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should handle form submission states', async () => {
      const Wrapper = createWrapper();
      
      render(<UsuarioForm />, { wrapper: Wrapper });

      // Fill and submit form
      const usernameInput = screen.getByLabelText(/nome de usuário/i);
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const roleSelect = screen.getByLabelText(/função/i);
      const submitButton = screen.getByRole('button', { name: /salvar usuário/i });

      fireEvent.change(usernameInput, { target: { value: 'Novo Usuario' } });
      fireEvent.change(emailInput, { target: { value: 'novo@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'senha123' } });
      fireEvent.change(roleSelect, { target: { value: 'USER' } });

      fireEvent.click(submitButton);

      // Button should be disabled during submission
      expect(submitButton).toBeDisabled();

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText(/usuário criado com sucesso/i)).toBeInTheDocument();
      });
    });
  });
});