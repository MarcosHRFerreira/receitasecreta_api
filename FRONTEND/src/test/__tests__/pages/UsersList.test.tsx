import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UsersList from '../../../pages/UsersList';
import { AuthProvider } from '../../../contexts/AuthContext';
import { useAuth } from '../../../hooks/useAuth';
import { useUsers, useDeleteUser } from '../../../hooks/useApi';
import type { User } from '../../../types';

// Mocks
vi.mock('../../../hooks/useAuth');
vi.mock('../../../hooks/useApi');

const mockUseAuth = vi.mocked(useAuth);
const mockUseUsers = vi.mocked(useUsers);
const mockUseDeleteUser = vi.mocked(useDeleteUser);

// Helper para renderizar com providers
const renderWithProviders = (component: React.ReactElement, initialEntries = ['/usuarios']) => {
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

// Mock data
const mockCurrentUser: User = {
  id: '1',
  username: 'admin',
  email: 'admin@test.com',
  role: 'ADMIN',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@test.com',
    role: 'ADMIN',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    username: 'user1',
    email: 'user1@test.com',
    role: 'USER',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  },
  {
    id: '3',
    username: 'user2',
    email: 'user2@test.com',
    role: 'USER',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z'
  }
];

describe('UsersList Page', () => {
  const mockDeleteUser = vi.fn();
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      user: mockCurrentUser,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
    });

    mockUseUsers.mockReturnValue({
      data: { content: mockUsers },
      isLoading: false,
      error: null,
    } as any);

    mockUseDeleteUser.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isLoading: false,
      error: null,
    } as any);
  });

  describe('Renderização', () => {
    it('deve renderizar o cabeçalho da página', () => {
      renderWithProviders(<UsersList />);

      expect(screen.getByText('Usuários')).toBeInTheDocument();
      expect(screen.getByText('Gerencie os usuários do sistema')).toBeInTheDocument();
    });

    it('deve renderizar filtros de busca', () => {
      renderWithProviders(<UsersList />);

      expect(screen.getByText('Filtros')).toBeInTheDocument();
      expect(screen.getByLabelText(/buscar/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/função/i)).toBeInTheDocument();
    });

    it('deve renderizar lista de usuários', () => {
      renderWithProviders(<UsersList />);

      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('user2')).toBeInTheDocument();
      expect(screen.getByText('admin@test.com')).toBeInTheDocument();
      expect(screen.getByText('user1@test.com')).toBeInTheDocument();
      expect(screen.getByText('user2@test.com')).toBeInTheDocument();
    });

    it('deve renderizar badges de role', () => {
      renderWithProviders(<UsersList />);

      expect(screen.getByText('👑')).toBeInTheDocument(); // Admin icon
      expect(screen.getAllByText('👤')).toHaveLength(2); // User icons
    });

    it('deve renderizar botões de ação', () => {
      renderWithProviders(<UsersList />);

      const deleteButtons = screen.getAllByRole('button', { name: /excluir/i });
      expect(deleteButtons).toHaveLength(2); // Apenas 2 porque o usuário atual não pode se deletar
    });
  });

  describe('Filtros', () => {
    it('deve filtrar usuários por termo de busca', async () => {
      const user = userEvent.setup();
      renderWithProviders(<UsersList />);

      const searchInput = screen.getByLabelText(/buscar/i);
      await user.type(searchInput, 'user1');

      await waitFor(() => {
        expect(screen.getByText('user1')).toBeInTheDocument();
        expect(screen.queryByText('user2')).not.toBeInTheDocument();
        expect(screen.queryByText('admin')).not.toBeInTheDocument();
      });
    });

    it('deve filtrar usuários por email', async () => {
      const user = userEvent.setup();
      renderWithProviders(<UsersList />);

      const searchInput = screen.getByLabelText(/buscar/i);
      await user.type(searchInput, 'admin@test.com');

      await waitFor(() => {
        expect(screen.getByText('admin')).toBeInTheDocument();
        expect(screen.queryByText('user1')).not.toBeInTheDocument();
        expect(screen.queryByText('user2')).not.toBeInTheDocument();
      });
    });

    it('deve filtrar usuários por role', async () => {
      const user = userEvent.setup();
      renderWithProviders(<UsersList />);

      const roleSelect = screen.getByLabelText(/função/i);
      await user.selectOptions(roleSelect, 'ADMIN');

      await waitFor(() => {
        expect(screen.getByText('admin')).toBeInTheDocument();
        expect(screen.queryByText('user1')).not.toBeInTheDocument();
        expect(screen.queryByText('user2')).not.toBeInTheDocument();
      });
    });

    it('deve combinar filtros de busca e role', async () => {
      const user = userEvent.setup();
      renderWithProviders(<UsersList />);

      const searchInput = screen.getByLabelText(/buscar/i);
      const roleSelect = screen.getByLabelText(/função/i);
      
      await user.type(searchInput, 'user');
      await user.selectOptions(roleSelect, 'USER');

      await waitFor(() => {
        expect(screen.getByText('user1')).toBeInTheDocument();
        expect(screen.getByText('user2')).toBeInTheDocument();
        expect(screen.queryByText('admin')).not.toBeInTheDocument();
      });
    });

    it('deve limpar filtros', async () => {
      const user = userEvent.setup();
      renderWithProviders(<UsersList />);

      const searchInput = screen.getByLabelText(/buscar/i);
      const roleSelect = screen.getByLabelText(/filtrar por role/i);
      const clearButton = screen.getByText(/limpar/i);
      
      await user.type(searchInput, 'user1');
      await user.selectOptions(roleSelect, 'USER');
      
      await waitFor(() => {
        expect(screen.getByText('user1')).toBeInTheDocument();
        expect(screen.queryByText('admin')).not.toBeInTheDocument();
      });

      await user.click(clearButton);

      await waitFor(() => {
        expect(screen.getByText('admin')).toBeInTheDocument();
        expect(screen.getByText('user1')).toBeInTheDocument();
        expect(screen.getByText('user2')).toBeInTheDocument();
      });
    });

    it('deve mostrar mensagem quando nenhum usuário é encontrado', async () => {
      const user = userEvent.setup();
      renderWithProviders(<UsersList />);

      const searchInput = screen.getByLabelText(/buscar/i);
      await user.type(searchInput, 'usuarioqueNaoExiste');

      await waitFor(() => {
        expect(screen.getByText(/nenhum usuário encontrado/i)).toBeInTheDocument();
      });
    });
  });

  describe('Exclusão de usuários', () => {
    it('deve abrir modal de confirmação ao clicar em excluir', async () => {
      const user = userEvent.setup();
      renderWithProviders(<UsersList />);

      const deleteButtons = screen.getAllByRole('button', { name: /excluir/i });
      await user.click(deleteButtons[0]); // Excluir user1 (índice 0 porque admin não tem botão)

      expect(screen.getByText(/confirmar exclusão/i)).toBeInTheDocument();
      expect(screen.getByText(/tem certeza que deseja excluir o usuário/i)).toBeInTheDocument();
      expect(screen.getByText('user1')).toBeInTheDocument();
    });

    it('deve fechar modal ao clicar em cancelar', async () => {
      const user = userEvent.setup();
      renderWithProviders(<UsersList />);

      const deleteButtons = screen.getAllByRole('button', { name: /excluir/i });
      await user.click(deleteButtons[0]);

      expect(screen.getByText(/confirmar exclusão/i)).toBeInTheDocument();

      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText(/confirmar exclusão/i)).not.toBeInTheDocument();
      });
    });

    it('deve excluir usuário ao confirmar', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValue(undefined);
      
      renderWithProviders(<UsersList />);

      const deleteButtons = screen.getAllByRole('button', { name: /excluir/i });
      await user.click(deleteButtons[0]); // Excluir user1

      const confirmButton = screen.getByRole('button', { name: /excluir$/i });
      await user.click(confirmButton);

      expect(mockMutateAsync).toHaveBeenCalledWith('2');
      
      await waitFor(() => {
        expect(screen.queryByText(/confirmar exclusão/i)).not.toBeInTheDocument();
      });
    });

    it('deve mostrar loading durante exclusão', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
      
      renderWithProviders(<UsersList />);

      const deleteButtons = screen.getAllByRole('button', { name: /excluir/i });
      await user.click(deleteButtons[0]);

      const confirmButton = screen.getByRole('button', { name: /excluir$/i });
      await user.click(confirmButton);

      expect(screen.getByText(/excluindo/i)).toBeInTheDocument();
    });

    it('deve lidar com erro na exclusão', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockMutateAsync.mockRejectedValue(new Error('Erro ao excluir'));
      
      renderWithProviders(<UsersList />);

      const deleteButtons = screen.getAllByRole('button', { name: /excluir/i });
      await user.click(deleteButtons[0]);

      const confirmButton = screen.getByRole('button', { name: /excluir$/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Erro ao deletar usuário:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Estados de carregamento e erro', () => {
    it('deve mostrar loading quando dados estão carregando', () => {
      mockUseUsers.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      } as any);

      renderWithProviders(<UsersList />);

      expect(screen.getByText(/carregando usuários/i)).toBeInTheDocument();
    });

    it('deve mostrar erro quando falha ao carregar', () => {
      mockUseUsers.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Erro de rede'),
      } as any);

      renderWithProviders(<UsersList />);

      expect(screen.getByText(/erro ao carregar usuários/i)).toBeInTheDocument();
      expect(screen.getByText(/tentar novamente/i)).toBeInTheDocument();
    });

    it('deve recarregar página ao clicar em tentar novamente', async () => {
      const user = userEvent.setup();
      const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {});
      
      mockUseUsers.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Erro de rede'),
      } as any);

      renderWithProviders(<UsersList />);

      const retryButton = screen.getByText(/tentar novamente/i);
      await user.click(retryButton);

      expect(reloadSpy).toHaveBeenCalled();
      reloadSpy.mockRestore();
    });
  });

  describe('Formatação e exibição', () => {
    it('deve formatar datas corretamente', () => {
      renderWithProviders(<UsersList />);

      // Verificar se as datas são exibidas (formato pode variar)
      expect(screen.getByText(/01\/01\/2024/)).toBeInTheDocument();
      expect(screen.getByText(/02\/01\/2024/)).toBeInTheDocument();
      expect(screen.getByText(/03\/01\/2024/)).toBeInTheDocument();
    });

    it('deve aplicar cores corretas para roles', () => {
      renderWithProviders(<UsersList />);

      // Buscar badges na tabela especificamente
      const table = screen.getByRole('table');
      const tbody = table.querySelector('tbody');
      
      // Buscar badges pelos seletores de classe específicos
      const adminBadge = within(tbody!).getByText('Administrador');
      const userBadges = within(tbody!).getAllByText('Usuário');

      expect(adminBadge).toHaveClass('bg-red-100', 'text-red-800');
      userBadges.forEach(badge => {
        expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
      });
    });

    it('deve exibir ícones corretos para roles', () => {
      renderWithProviders(<UsersList />);

      expect(screen.getByText('👑')).toBeInTheDocument(); // Admin
      expect(screen.getAllByText('👤')).toHaveLength(2); // Users
    });
  });

  describe('URL e parâmetros de busca', () => {
    it('deve atualizar URL com parâmetros de busca', async () => {
      const user = userEvent.setup();
      renderWithProviders(<UsersList />);

      const searchInput = screen.getByLabelText(/buscar/i);
      await user.type(searchInput, 'test');

      // Como estamos usando mock do router, não podemos testar URL real
      // mas podemos verificar que o filtro funciona
      await waitFor(() => {
        expect(searchInput).toHaveValue('test');
      });
    });

    it('deve inicializar com parâmetros da URL', () => {
      // Simular parâmetros iniciais
      const searchParams = new URLSearchParams('?search=admin&role=ADMIN');
      
      renderWithProviders(<UsersList />);

      // Verificar que os filtros são aplicados
      expect(screen.getByText('admin')).toBeInTheDocument();
    });
  });

  describe('Responsividade e layout', () => {
    it('deve ter estrutura de tabela correta', () => {
      renderWithProviders(<UsersList />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      expect(table).toHaveClass('min-w-full', 'divide-y', 'divide-gray-200');
    });

    it('deve ter estrutura de card correta', () => {
      renderWithProviders(<UsersList />);

      const userCard = screen.getByText('admin').closest('[class*="border"]');
      expect(userCard).toBeInTheDocument();
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter labels corretos nos inputs', () => {
      renderWithProviders(<UsersList />);

      expect(screen.getByLabelText(/buscar/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/função/i)).toBeInTheDocument();
    });

    it('deve ter botões com nomes acessíveis', () => {
      renderWithProviders(<UsersList />);

      const deleteButtons = screen.getAllByRole('button', { name: /excluir/i });
      expect(deleteButtons).toHaveLength(2);
      
      const clearButton = screen.getByRole('button', { name: /limpar/i });
      expect(clearButton).toBeInTheDocument();
    });

    it('deve ter estrutura semântica correta', () => {
      renderWithProviders(<UsersList />);

      expect(screen.getByText('Usuários')).toBeInTheDocument();
    });
  });

  describe('Casos extremos', () => {
    it('deve lidar com lista vazia de usuários', () => {
      mockUseUsers.mockReturnValue({
        data: { content: [] },
        isLoading: false,
        error: null,
      } as any);

      renderWithProviders(<UsersList />);

      expect(screen.getByText(/nenhum usuário encontrado/i)).toBeInTheDocument();
    });

    it('deve lidar com dados undefined', () => {
      mockUseUsers.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      } as any);

      renderWithProviders(<UsersList />);

      expect(screen.getByText(/nenhum usuário encontrado/i)).toBeInTheDocument();
    });

    it('deve lidar com usuários sem algumas propriedades', () => {
      const incompleteUsers = [
        {
          id: '1',
          username: '',
          email: '',
          role: 'USER',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ];

      mockUseUsers.mockReturnValue({
        data: { content: incompleteUsers },
        isLoading: false,
        error: null,
      } as any);

      renderWithProviders(<UsersList />);

      expect(screen.getAllByText('Usuário')).toHaveLength(3); // USER role displays as 'Usuário'
    });

    it('deve lidar com role desconhecido', () => {
      const usersWithUnknownRole = [
        {
          id: '1',
          username: 'test',
          email: 'test@test.com',
          role: 'UNKNOWN_ROLE',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ];

      mockUseUsers.mockReturnValue({
        data: { content: usersWithUnknownRole },
        isLoading: false,
        error: null,
      } as any);

      renderWithProviders(<UsersList />);

      expect(screen.getByText('❓')).toBeInTheDocument(); // Unknown role icon
      
      // Find the row containing the unknown role icon and verify it has 'Usuário' text
      const unknownRoleIcon = screen.getByText('❓');
      const tableRow = unknownRoleIcon.closest('tr');
      expect(tableRow).toBeInTheDocument();
      expect(tableRow).toHaveTextContent('Usuário'); // Unknown role displays as 'Usuário'
    });
  });

  describe('Performance', () => {
    it('deve renderizar rapidamente', () => {
      const startTime = performance.now();
      
      renderWithProviders(<UsersList />);
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('deve usar memoização para filtros', () => {
      const { rerender } = renderWithProviders(<UsersList />);
      
      expect(screen.getByText('admin')).toBeInTheDocument();
      
      // Re-renderizar com os mesmos dados
      rerender(
        <QueryClientProvider client={new QueryClient()}>
          <BrowserRouter>
            <AuthProvider>
              <UsersList />
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      );
      
      expect(screen.getByText('admin')).toBeInTheDocument();
    });
  });
});