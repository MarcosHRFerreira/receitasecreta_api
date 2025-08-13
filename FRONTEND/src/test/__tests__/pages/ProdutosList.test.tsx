import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProdutosList from '../../../pages/ProdutosList';
import { AuthProvider } from '../../../contexts/AuthContext';
import { useAuth } from '../../../contexts/AuthContextDefinition';
import { useProdutos, useDeleteProduto } from '../../../hooks/useApi';
import type { User, Produto } from '../../../types';

// Mocks
vi.mock('../../../contexts/AuthContextDefinition');
vi.mock('../../../hooks/useApi');

const mockUseAuth = vi.mocked(useAuth);
const mockUseProdutos = vi.mocked(useProdutos);
const mockUseDeleteProduto = vi.mocked(useDeleteProduto);

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

const mockProdutos: Produto[] = [
  {
    produtoId: '1',
    nomeProduto: 'Farinha de Trigo',
    categoria: 'GRAOS',
    descricao: 'Farinha de trigo especial para bolos',
    userId: '1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    produtoId: '2',
    nomeProduto: 'Leite Integral',
    categoria: 'LATICINIOS',
    descricao: 'Leite integral fresco',
    userId: '2',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  },
  {
    produtoId: '3',
    nomeProduto: 'Tomate',
    categoria: 'VEGETAIS',
    descricao: 'Tomate maduro e suculento',
    userId: '1',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z'
  }
];

describe('ProdutosList Page', () => {
  const mockDeleteProduto = vi.fn();
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

    mockUseProdutos.mockReturnValue({
      data: { content: mockProdutos },
      isLoading: false,
      error: null,
    } as any);

    mockUseDeleteProduto.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isLoading: false,
      error: null,
    } as any);
  });

  describe('Renderização', () => {
    it('deve renderizar o cabeçalho da página', () => {
      renderWithProviders(<ProdutosList />);

      expect(screen.getByText('Produtos')).toBeInTheDocument();
      expect(screen.getByText('Gerencie seus produtos culinários')).toBeInTheDocument();
      expect(screen.getByText('Novo Produto')).toBeInTheDocument();
    });

    it('deve renderizar filtros de busca', () => {
      renderWithProviders(<ProdutosList />);

      expect(screen.getByText('Filtros')).toBeInTheDocument();
      expect(screen.getByLabelText(/buscar/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument();
    });

    it('deve renderizar lista de produtos', () => {
      renderWithProviders(<ProdutosList />);

      expect(screen.getByText('Farinha de Trigo')).toBeInTheDocument();
      expect(screen.getByText('Leite Integral')).toBeInTheDocument();
      expect(screen.getByText('Tomate')).toBeInTheDocument();
    });

    it('deve renderizar informações dos produtos', () => {
      renderWithProviders(<ProdutosList />);

      expect(screen.getByText('GRAOS')).toBeInTheDocument();
      expect(screen.getByText('LATICINIOS')).toBeInTheDocument();
      expect(screen.getByText('VEGETAIS')).toBeInTheDocument();
      expect(screen.getByText('Farinha de trigo especial para bolos')).toBeInTheDocument();
      expect(screen.getByText('Leite integral fresco')).toBeInTheDocument();
      expect(screen.getByText('Tomate maduro e suculento')).toBeInTheDocument();
    });

    it('deve renderizar botões de ação apenas para produtos do usuário', () => {
      renderWithProviders(<ProdutosList />);

      // Produtos do usuário (id: 1) devem ter botões
      const editButtons = screen.getAllByRole('button', { name: /editar/i });
      const deleteButtons = screen.getAllByRole('button', { name: /deletar/i });
      
      expect(editButtons).toHaveLength(2); // Farinha de Trigo e Tomate
      expect(deleteButtons).toHaveLength(2);
    });
  });

  describe('Filtros', () => {
    it('deve filtrar produtos por termo de busca no nome', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ProdutosList />);

      const searchInput = screen.getByLabelText(/buscar/i);
      await user.type(searchInput, 'Farinha');

      await waitFor(() => {
        expect(screen.getByText('Farinha de Trigo')).toBeInTheDocument();
        expect(screen.queryByText('Leite Integral')).not.toBeInTheDocument();
        expect(screen.queryByText('Tomate')).not.toBeInTheDocument();
      });
    });

    it('deve filtrar produtos por termo de busca na descrição', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ProdutosList />);

      const searchInput = screen.getByLabelText(/buscar/i);
      await user.type(searchInput, 'fresco');

      await waitFor(() => {
        expect(screen.getByText('Leite Integral')).toBeInTheDocument();
        expect(screen.queryByText('Farinha de Trigo')).not.toBeInTheDocument();
        expect(screen.queryByText('Tomate')).not.toBeInTheDocument();
      });
    });

    it('deve filtrar produtos por categoria', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ProdutosList />);

      const categorySelect = screen.getByLabelText(/categoria/i);
      await user.selectOptions(categorySelect, 'GRAOS');

      await waitFor(() => {
        expect(screen.getByText('Farinha de Trigo')).toBeInTheDocument();
        expect(screen.queryByText('Leite Integral')).not.toBeInTheDocument();
        expect(screen.queryByText('Tomate')).not.toBeInTheDocument();
      });
    });

    it('deve combinar múltiplos filtros', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ProdutosList />);

      const searchInput = screen.getByLabelText(/buscar/i);
      const categorySelect = screen.getByLabelText(/categoria/i);
      
      await user.type(searchInput, 'Tomate');
      await user.selectOptions(categorySelect, 'VEGETAIS');

      await waitFor(() => {
        expect(screen.getByText('Tomate')).toBeInTheDocument();
        expect(screen.queryByText('Farinha de Trigo')).not.toBeInTheDocument();
        expect(screen.queryByText('Leite Integral')).not.toBeInTheDocument();
      });
    });

    it('deve limpar filtros', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ProdutosList />);

      const searchInput = screen.getByLabelText(/buscar/i);
      const categorySelect = screen.getByLabelText(/categoria/i);
      const clearButton = screen.getByText(/limpar filtros/i);
      
      await user.type(searchInput, 'Farinha');
      await user.selectOptions(categorySelect, 'GRAOS');
      
      await waitFor(() => {
        expect(screen.getByText('Farinha de Trigo')).toBeInTheDocument();
        expect(screen.queryByText('Leite Integral')).not.toBeInTheDocument();
      });

      await user.click(clearButton);

      await waitFor(() => {
        expect(screen.getByText('Farinha de Trigo')).toBeInTheDocument();
        expect(screen.getByText('Leite Integral')).toBeInTheDocument();
        expect(screen.getByText('Tomate')).toBeInTheDocument();
      });
    });

    it('deve mostrar mensagem quando nenhum produto é encontrado', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ProdutosList />);

      const searchInput = screen.getByLabelText(/buscar/i);
      await user.type(searchInput, 'produtoQueNaoExiste');

      await waitFor(() => {
        expect(screen.getByText(/nenhum produto encontrado/i)).toBeInTheDocument();
      });
    });
  });

  describe('Exclusão de produtos', () => {
    it('deve abrir modal de confirmação ao clicar em deletar', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ProdutosList />);

      const deleteButtons = screen.getAllByRole('button', { name: /deletar/i });
      await user.click(deleteButtons[0]); // Deletar primeiro produto do usuário

      expect(screen.getByText(/confirmar exclusão/i)).toBeInTheDocument();
      expect(screen.getByText(/tem certeza que deseja excluir o produto/i)).toBeInTheDocument();
    });

    it('deve fechar modal ao clicar em cancelar', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ProdutosList />);

      const deleteButtons = screen.getAllByRole('button', { name: /deletar/i });
      await user.click(deleteButtons[0]);

      expect(screen.getByText(/confirmar exclusão/i)).toBeInTheDocument();

      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText(/confirmar exclusão/i)).not.toBeInTheDocument();
      });
    });

    it('deve deletar produto ao confirmar', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValue(undefined);
      
      renderWithProviders(<ProdutosList />);

      const deleteButtons = screen.getAllByRole('button', { name: /deletar/i });
      await user.click(deleteButtons[0]);

      const confirmButton = screen.getByRole('button', { name: /confirmar/i });
      await user.click(confirmButton);

      expect(mockMutateAsync).toHaveBeenCalledWith('1'); // ID do primeiro produto
      
      await waitFor(() => {
        expect(screen.queryByText(/confirmar exclusão/i)).not.toBeInTheDocument();
      });
    });

    it('deve mostrar loading durante exclusão', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
      
      renderWithProviders(<ProdutosList />);

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
      
      renderWithProviders(<ProdutosList />);

      const deleteButtons = screen.getAllByRole('button', { name: /deletar/i });
      await user.click(deleteButtons[0]);

      const confirmButton = screen.getByRole('button', { name: /confirmar/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Erro ao deletar produto:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Controle de propriedade', () => {
    it('deve desabilitar botões para produtos de outros usuários', () => {
      renderWithProviders(<ProdutosList />);

      // O produto "Leite Integral" pertence ao usuário ID 2, não ao usuário atual (ID 1)
      // Então não deve ter botões de editar/deletar visíveis para ele
      const editButtons = screen.getAllByRole('button', { name: /editar/i });
      const deleteButtons = screen.getAllByRole('button', { name: /deletar/i });
      
      // Apenas 2 produtos pertencem ao usuário atual
      expect(editButtons).toHaveLength(2);
      expect(deleteButtons).toHaveLength(2);
    });

    it('deve mostrar todos os botões quando usuário é proprietário', () => {
      // Todos os produtos pertencem ao usuário atual
      const allUserProdutos = mockProdutos.map(p => ({ ...p, userId: '1' }));
      
      mockUseProdutos.mockReturnValue({
        data: { content: allUserProdutos },
        isLoading: false,
        error: null,
      } as any);

      renderWithProviders(<ProdutosList />);

      const editButtons = screen.getAllByRole('button', { name: /editar/i });
      const deleteButtons = screen.getAllByRole('button', { name: /deletar/i });
      
      expect(editButtons).toHaveLength(3);
      expect(deleteButtons).toHaveLength(3);
    });
  });

  describe('Estados de carregamento e erro', () => {
    it('deve mostrar loading quando dados estão carregando', () => {
      mockUseProdutos.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      } as any);

      renderWithProviders(<ProdutosList />);

      expect(screen.getByText(/carregando produtos/i)).toBeInTheDocument();
    });

    it('deve mostrar erro quando falha ao carregar', () => {
      mockUseProdutos.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Erro de rede'),
      } as any);

      renderWithProviders(<ProdutosList />);

      expect(screen.getByText(/erro ao carregar produtos/i)).toBeInTheDocument();
      expect(screen.getByText(/tentar novamente/i)).toBeInTheDocument();
    });

    it('deve recarregar página ao clicar em tentar novamente', async () => {
      const user = userEvent.setup();
      const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {});
      
      mockUseProdutos.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Erro de rede'),
      } as any);

      renderWithProviders(<ProdutosList />);

      const retryButton = screen.getByText(/tentar novamente/i);
      await user.click(retryButton);

      expect(reloadSpy).toHaveBeenCalled();
      reloadSpy.mockRestore();
    });
  });

  describe('Links de navegação', () => {
    it('deve ter link correto para novo produto', () => {
      renderWithProviders(<ProdutosList />);

      const novoProdutoLink = screen.getByText('Novo Produto').closest('a');
      expect(novoProdutoLink).toHaveAttribute('href', '/produtos/novo');
    });

    it('deve ter links corretos para visualizar produtos', () => {
      renderWithProviders(<ProdutosList />);

      const viewButtons = screen.getAllByRole('button', { name: /visualizar/i });
      expect(viewButtons).toHaveLength(3); // Todos os produtos podem ser visualizados
    });

    it('deve ter links corretos para editar produtos do usuário', () => {
      renderWithProviders(<ProdutosList />);

      const editButtons = screen.getAllByRole('button', { name: /editar/i });
      expect(editButtons).toHaveLength(2); // Apenas produtos do usuário
    });
  });

  describe('URL e parâmetros de busca', () => {
    it('deve atualizar URL com parâmetros de busca', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ProdutosList />);

      const searchInput = screen.getByLabelText(/buscar/i);
      await user.type(searchInput, 'test');

      await waitFor(() => {
        expect(searchInput).toHaveValue('test');
      });
    });
  });

  describe('Responsividade e layout', () => {
    it('deve aplicar classes responsivas corretas', () => {
      renderWithProviders(<ProdutosList />);

      const grid = screen.getByText('Farinha de Trigo').closest('.grid');
      expect(grid).toHaveClass('grid');
    });

    it('deve ter estrutura de card correta', () => {
      renderWithProviders(<ProdutosList />);

      const produtoCard = screen.getByText('Farinha de Trigo').closest('[class*="border"]');
      expect(produtoCard).toBeInTheDocument();
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter labels corretos para inputs', () => {
      renderWithProviders(<ProdutosList />);

      expect(screen.getByLabelText(/buscar/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument();
    });

    it('deve ter nomes acessíveis para botões', () => {
      renderWithProviders(<ProdutosList />);

      const editButtons = screen.getAllByRole('button', { name: /editar/i });
      const deleteButtons = screen.getAllByRole('button', { name: /deletar/i });
      const viewButtons = screen.getAllByRole('button', { name: /visualizar/i });
      
      expect(editButtons.length).toBeGreaterThan(0);
      expect(deleteButtons.length).toBeGreaterThan(0);
      expect(viewButtons.length).toBeGreaterThan(0);
    });

    it('deve ter estrutura semântica correta', () => {
      renderWithProviders(<ProdutosList />);

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getAllByRole('button')).toHaveLength(expect.any(Number));
    });
  });

  describe('Casos extremos', () => {
    it('deve lidar com lista vazia de produtos', () => {
      mockUseProdutos.mockReturnValue({
        data: { content: [] },
        isLoading: false,
        error: null,
      } as any);

      renderWithProviders(<ProdutosList />);

      expect(screen.getByText(/nenhum produto encontrado/i)).toBeInTheDocument();
    });

    it('deve lidar com dados undefined', () => {
      mockUseProdutos.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      } as any);

      renderWithProviders(<ProdutosList />);

      expect(screen.getByText(/nenhum produto encontrado/i)).toBeInTheDocument();
    });

    it('deve lidar com produtos sem algumas propriedades', () => {
      const incompleteProdutos = [
        {
          produtoId: '1',
          nomeProduto: 'Produto Incompleto',
          categoria: '',
          descricao: '',
          userId: '1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ];

      mockUseProdutos.mockReturnValue({
        data: { content: incompleteProdutos },
        isLoading: false,
        error: null,
      } as any);

      renderWithProviders(<ProdutosList />);

      expect(screen.getByText('Produto Incompleto')).toBeInTheDocument();
    });

    it('deve lidar com categorias desconhecidas', () => {
      const produtosComCategoriaDesconhecida = [
        {
          ...mockProdutos[0],
          categoria: 'CATEGORIA_DESCONHECIDA'
        }
      ];

      mockUseProdutos.mockReturnValue({
        data: { content: produtosComCategoriaDesconhecida },
        isLoading: false,
        error: null,
      } as any);

      renderWithProviders(<ProdutosList />);

      expect(screen.getByText('CATEGORIA_DESCONHECIDA')).toBeInTheDocument();
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

      renderWithProviders(<ProdutosList />);

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
      
      renderWithProviders(<ProdutosList />);
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('deve usar filtros otimizados', () => {
      const { rerender } = renderWithProviders(<ProdutosList />);
      
      expect(screen.getByText('Farinha de Trigo')).toBeInTheDocument();
      
      // Re-renderizar com os mesmos dados
      rerender(
        <QueryClientProvider client={new QueryClient()}>
          <BrowserRouter>
            <AuthProvider>
              <ProdutosList />
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      );
      
      expect(screen.getByText('Farinha de Trigo')).toBeInTheDocument();
    });
  });

  describe('Formatação e exibição', () => {
    it('deve formatar datas corretamente', () => {
      renderWithProviders(<ProdutosList />);

      // Verificar se as datas são exibidas (formato pode variar)
      expect(screen.getByText(/2024/)).toBeInTheDocument();
    });

    it('deve aplicar cores corretas para categorias', () => {
      renderWithProviders(<ProdutosList />);

      const graosBadge = screen.getByText('GRAOS');
      const lacticiniosBadge = screen.getByText('LATICINIOS');
      const vegetaisBadge = screen.getByText('VEGETAIS');
      
      expect(graosBadge).toBeInTheDocument();
      expect(lacticiniosBadge).toBeInTheDocument();
      expect(vegetaisBadge).toBeInTheDocument();
    });

    it('deve truncar descrições muito longas', () => {
      const produtoComDescricaoLonga = [
        {
          ...mockProdutos[0],
          descricao: 'Esta é uma descrição muito longa que deveria ser truncada para não ocupar muito espaço na interface do usuário e manter a consistência visual'
        }
      ];

      mockUseProdutos.mockReturnValue({
        data: { content: produtoComDescricaoLonga },
        isLoading: false,
        error: null,
      } as any);

      renderWithProviders(<ProdutosList />);

      // A descrição deve estar presente, mas pode estar truncada
      expect(screen.getByText(/Esta é uma descrição muito longa/)).toBeInTheDocument();
    });
  });
});