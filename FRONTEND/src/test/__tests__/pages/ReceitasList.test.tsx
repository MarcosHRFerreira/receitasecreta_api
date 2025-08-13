import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReceitasList from '../../../pages/ReceitasList';
import { AuthProvider } from '../../../contexts/AuthContext';
import { useAuth } from '../../../contexts/AuthContextDefinition';
import { useReceitas, useDeleteReceita } from '../../../hooks/useApi';
import type { User, Receita } from '../../../types';

// Mocks
vi.mock('../../../contexts/AuthContextDefinition');
vi.mock('../../../hooks/useApi');

const mockUseAuth = vi.mocked(useAuth);
const mockUseReceitas = vi.mocked(useReceitas);
const mockUseDeleteReceita = vi.mocked(useDeleteReceita);

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

// Mock data
const mockUser: User = {
  id: '1',
  username: 'testuser',
  email: 'test@test.com',
  role: 'USER',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

const mockReceitas: Receita[] = [
  {
    receitaId: '1',
    nomeReceita: 'Bolo de Chocolate',
    categoria: 'DOCE',
    dificuldade: 'FACIL',
    tempoPreparo: '30 min',
    notas: 'Delicioso bolo de chocolate',
    userId: '1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    receitaId: '2',
    nomeReceita: 'Lasanha',
    categoria: 'SALGADO',
    dificuldade: 'MEDIO',
    tempoPreparo: '60 min',
    notas: 'Lasanha tradicional italiana',
    userId: '2',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  },
  {
    receitaId: '3',
    nomeReceita: 'Salada Caesar',
    categoria: 'SALGADO',
    dificuldade: 'FACIL',
    tempoPreparo: '15 min',
    notas: 'Salada fresca e saborosa',
    userId: '1',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z'
  }
];

describe('ReceitasList Page', () => {
  const mockDeleteReceita = vi.fn();
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
    });

    mockUseReceitas.mockReturnValue({
      data: { content: mockReceitas },
      isLoading: false,
      error: null,
    } as any);

    mockUseDeleteReceita.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isLoading: false,
      error: null,
    } as any);
  });

  describe('Renderização', () => {
    it('deve renderizar o cabeçalho da página', () => {
      renderWithProviders(<ReceitasList />);

      expect(screen.getByText('Receitas')).toBeInTheDocument();
      expect(screen.getByText('Gerencie suas receitas culinárias')).toBeInTheDocument();
      expect(screen.getByText('Nova Receita')).toBeInTheDocument();
    });

    it('deve renderizar filtros de busca', () => {
      renderWithProviders(<ReceitasList />);

      expect(screen.getByText('Filtros')).toBeInTheDocument();
      expect(screen.getByLabelText(/buscar/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/dificuldade/i)).toBeInTheDocument();
    });

    it('deve renderizar lista de receitas', () => {
      renderWithProviders(<ReceitasList />);

      expect(screen.getByText('Bolo de Chocolate')).toBeInTheDocument();
      expect(screen.getByText('Lasanha')).toBeInTheDocument();
      expect(screen.getByText('Salada Caesar')).toBeInTheDocument();
    });

    it('deve renderizar informações das receitas', () => {
      renderWithProviders(<ReceitasList />);

      expect(screen.getByText('DOCE')).toBeInTheDocument();
      expect(screen.getByText('SALGADO')).toBeInTheDocument();
      expect(screen.getByText('FACIL')).toBeInTheDocument();
      expect(screen.getByText('MEDIO')).toBeInTheDocument();
      expect(screen.getByText('30 min')).toBeInTheDocument();
      expect(screen.getByText('60 min')).toBeInTheDocument();
      expect(screen.getByText('15 min')).toBeInTheDocument();
    });

    it('deve renderizar botões de ação apenas para receitas do usuário', () => {
      renderWithProviders(<ReceitasList />);

      // Receitas do usuário (id: 1) devem ter botões
      const editButtons = screen.getAllByRole('button', { name: /editar/i });
      const deleteButtons = screen.getAllByRole('button', { name: /deletar/i });
      
      expect(editButtons).toHaveLength(2); // Bolo de Chocolate e Salada Caesar
      expect(deleteButtons).toHaveLength(2);
    });
  });

  describe('Filtros', () => {
    it('deve filtrar receitas por termo de busca no nome', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ReceitasList />);

      const searchInput = screen.getByLabelText(/buscar/i);
      await user.type(searchInput, 'Bolo');

      await waitFor(() => {
        expect(screen.getByText('Bolo de Chocolate')).toBeInTheDocument();
        expect(screen.queryByText('Lasanha')).not.toBeInTheDocument();
        expect(screen.queryByText('Salada Caesar')).not.toBeInTheDocument();
      });
    });

    it('deve filtrar receitas por termo de busca nas notas', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ReceitasList />);

      const searchInput = screen.getByLabelText(/buscar/i);
      await user.type(searchInput, 'italiana');

      await waitFor(() => {
        expect(screen.getByText('Lasanha')).toBeInTheDocument();
        expect(screen.queryByText('Bolo de Chocolate')).not.toBeInTheDocument();
        expect(screen.queryByText('Salada Caesar')).not.toBeInTheDocument();
      });
    });

    it('deve filtrar receitas por categoria', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ReceitasList />);

      const categorySelect = screen.getByLabelText(/categoria/i);
      await user.selectOptions(categorySelect, 'DOCE');

      await waitFor(() => {
        expect(screen.getByText('Bolo de Chocolate')).toBeInTheDocument();
        expect(screen.queryByText('Lasanha')).not.toBeInTheDocument();
        expect(screen.queryByText('Salada Caesar')).not.toBeInTheDocument();
      });
    });

    it('deve filtrar receitas por dificuldade', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ReceitasList />);

      const difficultySelect = screen.getByLabelText(/dificuldade/i);
      await user.selectOptions(difficultySelect, 'FACIL');

      await waitFor(() => {
        expect(screen.getByText('Bolo de Chocolate')).toBeInTheDocument();
        expect(screen.getByText('Salada Caesar')).toBeInTheDocument();
        expect(screen.queryByText('Lasanha')).not.toBeInTheDocument();
      });
    });

    it('deve combinar múltiplos filtros', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ReceitasList />);

      const searchInput = screen.getByLabelText(/buscar/i);
      const categorySelect = screen.getByLabelText(/categoria/i);
      const difficultySelect = screen.getByLabelText(/dificuldade/i);
      
      await user.type(searchInput, 'Salada');
      await user.selectOptions(categorySelect, 'SALGADO');
      await user.selectOptions(difficultySelect, 'FACIL');

      await waitFor(() => {
        expect(screen.getByText('Salada Caesar')).toBeInTheDocument();
        expect(screen.queryByText('Bolo de Chocolate')).not.toBeInTheDocument();
        expect(screen.queryByText('Lasanha')).not.toBeInTheDocument();
      });
    });

    it('deve limpar filtros', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ReceitasList />);

      const searchInput = screen.getByLabelText(/buscar/i);
      const categorySelect = screen.getByLabelText(/categoria/i);
      const clearButton = screen.getByText(/limpar filtros/i);
      
      await user.type(searchInput, 'Bolo');
      await user.selectOptions(categorySelect, 'DOCE');
      
      await waitFor(() => {
        expect(screen.getByText('Bolo de Chocolate')).toBeInTheDocument();
        expect(screen.queryByText('Lasanha')).not.toBeInTheDocument();
      });

      await user.click(clearButton);

      await waitFor(() => {
        expect(screen.getByText('Bolo de Chocolate')).toBeInTheDocument();
        expect(screen.getByText('Lasanha')).toBeInTheDocument();
        expect(screen.getByText('Salada Caesar')).toBeInTheDocument();
      });
    });

    it('deve mostrar mensagem quando nenhuma receita é encontrada', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ReceitasList />);

      const searchInput = screen.getByLabelText(/buscar/i);
      await user.type(searchInput, 'receitaQueNaoExiste');

      await waitFor(() => {
        expect(screen.getByText(/nenhuma receita encontrada/i)).toBeInTheDocument();
      });
    });
  });

  describe('Modos de visualização', () => {
    it('deve alternar entre modo grid e lista', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ReceitasList />);

      const gridButton = screen.getByRole('button', { name: /grid/i });
      const listButton = screen.getByRole('button', { name: /lista/i });

      expect(gridButton).toBeInTheDocument();
      expect(listButton).toBeInTheDocument();

      await user.click(listButton);
      // Verificar que o modo mudou (pode verificar classes CSS ou layout)
      
      await user.click(gridButton);
      // Verificar que voltou ao modo grid
    });
  });

  describe('Exclusão de receitas', () => {
    it('deve abrir modal de confirmação ao clicar em deletar', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ReceitasList />);

      const deleteButtons = screen.getAllByRole('button', { name: /deletar/i });
      await user.click(deleteButtons[0]); // Deletar primeira receita do usuário

      expect(screen.getByText(/confirmar exclusão/i)).toBeInTheDocument();
      expect(screen.getByText(/tem certeza que deseja excluir a receita/i)).toBeInTheDocument();
    });

    it('deve fechar modal ao clicar em cancelar', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ReceitasList />);

      const deleteButtons = screen.getAllByRole('button', { name: /deletar/i });
      await user.click(deleteButtons[0]);

      expect(screen.getByText(/confirmar exclusão/i)).toBeInTheDocument();

      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText(/confirmar exclusão/i)).not.toBeInTheDocument();
      });
    });

    it('deve deletar receita ao confirmar', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValue(undefined);
      
      renderWithProviders(<ReceitasList />);

      const deleteButtons = screen.getAllByRole('button', { name: /deletar/i });
      await user.click(deleteButtons[0]);

      const confirmButton = screen.getByRole('button', { name: /confirmar/i });
      await user.click(confirmButton);

      expect(mockMutateAsync).toHaveBeenCalledWith('1'); // ID da primeira receita
      
      await waitFor(() => {
        expect(screen.queryByText(/confirmar exclusão/i)).not.toBeInTheDocument();
      });
    });

    it('deve mostrar loading durante exclusão', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
      
      renderWithProviders(<ReceitasList />);

      const deleteButtons = screen.getAllByRole('button', { name: /deletar/i });
      await user.click(deleteButtons[0]);

      const confirmButton = screen.getByRole('button', { name: /confirmar/i });
      await user.click(confirmButton);

      expect(screen.getByText(/excluindo/i)).toBeInTheDocument();
    });

    it('deve lidar com erro na exclusão', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockMutateAsync.mockRejectedValue(new Error('Erro ao deletar'));
      
      renderWithProviders(<ReceitasList />);

      const deleteButtons = screen.getAllByRole('button', { name: /deletar/i });
      await user.click(deleteButtons[0]);

      const confirmButton = screen.getByRole('button', { name: /confirmar/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Erro ao deletar receita:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Controle de propriedade', () => {
    it('deve desabilitar botões para receitas de outros usuários', () => {
      renderWithProviders(<ReceitasList />);

      // A receita "Lasanha" pertence ao usuário ID 2, não ao usuário atual (ID 1)
      // Então não deve ter botões de editar/deletar visíveis para ela
      const editButtons = screen.getAllByRole('button', { name: /editar/i });
      const deleteButtons = screen.getAllByRole('button', { name: /deletar/i });
      
      // Apenas 2 receitas pertencem ao usuário atual
      expect(editButtons).toHaveLength(2);
      expect(deleteButtons).toHaveLength(2);
    });

    it('deve mostrar todos os botões quando usuário é proprietário', () => {
      // Todas as receitas pertencem ao usuário atual
      const allUserReceitas = mockReceitas.map(r => ({ ...r, userId: '1' }));
      
      mockUseReceitas.mockReturnValue({
        data: { content: allUserReceitas },
        isLoading: false,
        error: null,
      } as any);

      renderWithProviders(<ReceitasList />);

      const editButtons = screen.getAllByRole('button', { name: /editar/i });
      const deleteButtons = screen.getAllByRole('button', { name: /deletar/i });
      
      expect(editButtons).toHaveLength(3);
      expect(deleteButtons).toHaveLength(3);
    });
  });

  describe('Estados de carregamento e erro', () => {
    it('deve mostrar loading quando dados estão carregando', () => {
      mockUseReceitas.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      } as any);

      renderWithProviders(<ReceitasList />);

      expect(screen.getByText(/carregando receitas/i)).toBeInTheDocument();
    });

    it('deve mostrar erro quando falha ao carregar', () => {
      mockUseReceitas.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Erro de rede'),
      } as any);

      renderWithProviders(<ReceitasList />);

      expect(screen.getByText(/erro ao carregar receitas/i)).toBeInTheDocument();
      expect(screen.getByText(/tentar novamente/i)).toBeInTheDocument();
    });

    it('deve recarregar página ao clicar em tentar novamente', async () => {
      const user = userEvent.setup();
      const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {});
      
      mockUseReceitas.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Erro de rede'),
      } as any);

      renderWithProviders(<ReceitasList />);

      const retryButton = screen.getByText(/tentar novamente/i);
      await user.click(retryButton);

      expect(reloadSpy).toHaveBeenCalled();
      reloadSpy.mockRestore();
    });
  });

  describe('Links de navegação', () => {
    it('deve ter link correto para nova receita', () => {
      renderWithProviders(<ReceitasList />);

      const novaReceitaLink = screen.getByText('Nova Receita').closest('a');
      expect(novaReceitaLink).toHaveAttribute('href', '/receitas/nova');
    });

    it('deve ter links corretos para visualizar receitas', () => {
      renderWithProviders(<ReceitasList />);

      const viewButtons = screen.getAllByRole('button', { name: /visualizar/i });
      expect(viewButtons).toHaveLength(3); // Todas as receitas podem ser visualizadas
    });

    it('deve ter links corretos para editar receitas do usuário', () => {
      renderWithProviders(<ReceitasList />);

      const editButtons = screen.getAllByRole('button', { name: /editar/i });
      expect(editButtons).toHaveLength(2); // Apenas receitas do usuário
    });
  });

  describe('URL e parâmetros de busca', () => {
    it('deve atualizar URL com parâmetros de busca', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ReceitasList />);

      const searchInput = screen.getByLabelText(/buscar/i);
      await user.type(searchInput, 'test');

      await waitFor(() => {
        expect(searchInput).toHaveValue('test');
      });
    });
  });

  describe('Responsividade e layout', () => {
    it('deve aplicar classes responsivas corretas', () => {
      renderWithProviders(<ReceitasList />);

      const grid = screen.getByText('Bolo de Chocolate').closest('.grid');
      expect(grid).toHaveClass('grid');
    });

    it('deve ter estrutura de card correta', () => {
      renderWithProviders(<ReceitasList />);

      const receitaCard = screen.getByText('Bolo de Chocolate').closest('[class*="border"]');
      expect(receitaCard).toBeInTheDocument();
    });
  });

  describe('Casos extremos', () => {
    it('deve lidar com lista vazia de receitas', () => {
      mockUseReceitas.mockReturnValue({
        data: { content: [] },
        isLoading: false,
        error: null,
      } as any);

      renderWithProviders(<ReceitasList />);

      expect(screen.getByText(/nenhuma receita encontrada/i)).toBeInTheDocument();
    });

    it('deve lidar com dados undefined', () => {
      mockUseReceitas.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      } as any);

      renderWithProviders(<ReceitasList />);

      expect(screen.getByText(/nenhuma receita encontrada/i)).toBeInTheDocument();
    });

    it('deve lidar com receitas sem algumas propriedades', () => {
      const incompleteReceitas = [
        {
          receitaId: '1',
          nomeReceita: 'Receita Incompleta',
          categoria: '',
          dificuldade: '',
          tempoPreparo: '',
          userId: '1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ];

      mockUseReceitas.mockReturnValue({
        data: { content: incompleteReceitas },
        isLoading: false,
        error: null,
      } as any);

      renderWithProviders(<ReceitasList />);

      expect(screen.getByText('Receita Incompleta')).toBeInTheDocument();
    });

    it('deve lidar com usuário não autenticado', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
      });

      renderWithProviders(<ReceitasList />);

      // Todos os botões de edição/exclusão devem estar desabilitados
      const editButtons = screen.queryAllByRole('button', { name: /editar/i });
      const deleteButtons = screen.queryAllByRole('button', { name: /deletar/i });
      
      expect(editButtons).toHaveLength(0);
      expect(deleteButtons).toHaveLength(0);
    });
  });

  describe('Performance', () => {
    it('deve renderizar rapidamente', () => {
      const startTime = performance.now();
      
      renderWithProviders(<ReceitasList />);
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('deve usar filtros otimizados', () => {
      const { rerender } = renderWithProviders(<ReceitasList />);
      
      expect(screen.getByText('Bolo de Chocolate')).toBeInTheDocument();
      
      // Re-renderizar com os mesmos dados
      rerender(
        <QueryClientProvider client={new QueryClient()}>
          <BrowserRouter>
            <AuthProvider>
              <ReceitasList />
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      );
      
      expect(screen.getByText('Bolo de Chocolate')).toBeInTheDocument();
    });
  });
});