import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UnidadeMedida } from '../../../types';
import {
  useUsers,
  useUser,
  useDeleteUser,
  useProdutos,
  useProduto,
  useCreateProduto,
  useUpdateProduto,
  useDeleteProduto,
  useReceitas,
  useReceita,
  useCreateReceita,
  useUpdateReceita,
  useDeleteReceita,
  useReceitaIngredientes,
  useIngredientesByReceita,
  useCreateReceitaIngrediente,
  useUpdateReceitaIngrediente,
  useDeleteReceitaIngrediente,
} from '../../../hooks/useApi';
import { apiService } from '../../../services/api';
import { renderWithQueryClient, createTestQueryClient } from '../../utils/test-utils';
import type {
  User,
  Produto,
  Receita,
  ReceitaIngrediente,
  ProdutoRequest,
  ReceitaRequest,
  ReceitaIngredienteRequest,
  PageRequest,
} from '../../../types';

// Mock do apiService
vi.mock('../../../services/api', () => ({
  apiService: {
    getUsers: vi.fn(),
    getUserById: vi.fn(),
    deleteUser: vi.fn(),
    getProdutos: vi.fn(),
    getProdutoById: vi.fn(),
    createProduto: vi.fn(),
    updateProduto: vi.fn(),
    deleteProduto: vi.fn(),
    getReceitas: vi.fn(),
    getReceitaById: vi.fn(),
    createReceita: vi.fn(),
    updateReceita: vi.fn(),
    deleteReceita: vi.fn(),
    getReceitaIngredientes: vi.fn(),
    getIngredientesByReceita: vi.fn(),
    createReceitaIngrediente: vi.fn(),
    updateReceitaIngrediente: vi.fn(),
    deleteReceitaIngrediente: vi.fn(),
  },
}));

// Dados de teste
const mockUser: User = {
  id: '1',
  username: 'Test User',
  email: 'test@test.com',
  role: 'USER',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

const mockProduto: Produto = {
  produtoId: '1',
  nomeProduto: 'Produto Teste',
  categoriaproduto: 'INGREDIENTE_SECO',
  unidademedida: 'KILO',
  custoporunidade: 10.50,
  fornecedor: 'Fornecedor Teste',
  descricao: 'Descrição do produto teste',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  userId: '1'
};

const mockReceita: Receita = {
  receitaId: '1',
  nomeReceita: 'Receita Teste',
  categoria: 'BOLO',
  dificuldade: 'FACIL',
  tempoPreparo: '30 min',
  rendimento: '4 porções',
  modoPreparo: 'Modo de preparo da receita',
  notas: 'Notas da receita',
  tags: 'teste,bolo',
  favorita: false,
  dataCriacao: '2024-01-01T00:00:00Z',
  dataAlteracao: '2024-01-01T00:00:00Z',
  userId: '1'
};

const mockReceitaIngrediente: ReceitaIngrediente = {
  receitaId: '1',
  produtoId: '1',
  quantidade: 2,
  unidadeMedida: 'GRAMA',
  observacao: 'Observação do ingrediente',
  produto: mockProduto
};

const mockPageRequest: PageRequest = {
  page: 0,
  size: 10,
};

describe('useApi hooks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('User hooks', () => {
    describe('useUsers', () => {
      it('deve buscar lista de usuários', async () => {
        // Arrange
        const mockUsers = [mockUser];
        vi.mocked(apiService.getUsers).mockResolvedValue({
          content: mockUsers,
          totalElements: 1,
          totalPages: 1,
          size: 10,
          number: 0,
        });

        // Act
        const { result } = renderHook(() => useUsers(mockPageRequest), {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          ),
        });

        // Assert
        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });
        expect(apiService.getUsers).toHaveBeenCalledWith(mockPageRequest);
        expect(result.current.data?.content).toEqual(mockUsers);
      });

      it('deve lidar com erro ao buscar usuários', async () => {
        // Arrange
        const error = new Error('Erro ao buscar usuários');
        vi.mocked(apiService.getUsers).mockRejectedValue(error);

        // Act
        const { result } = renderHook(() => useUsers(), {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          ),
        });

        // Assert
        await waitFor(() => {
          expect(result.current.isError).toBe(true);
        });
        expect(result.current.error).toEqual(error);
      });
    });

    describe('useUser', () => {
      it('deve buscar usuário por ID', async () => {
        // Arrange
        vi.mocked(apiService.getUserById).mockResolvedValue(mockUser);

        // Act
        const { result } = renderHook(() => useUser('1'), {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          ),
        });

        // Assert
        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });
        expect(apiService.getUserById).toHaveBeenCalledWith('1');
        expect(result.current.data).toEqual(mockUser);
      });

      it('não deve buscar quando ID está vazio', () => {
        // Act
        const { result } = renderHook(() => useUser(''), {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          ),
        });

        // Assert
        expect(result.current.isFetching).toBe(false);
        expect(apiService.getUserById).not.toHaveBeenCalled();
      });
    });

    describe('useDeleteUser', () => {
      it('deve deletar usuário e invalidar cache', async () => {
        // Arrange
        vi.mocked(apiService.deleteUser).mockResolvedValue(undefined);
        const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

        // Act
        const { result } = renderHook(() => useDeleteUser(), {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          ),
        });

        result.current.mutate('1');

        // Assert
        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });
        expect(apiService.deleteUser).toHaveBeenCalledWith('1');
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['users'] });
      });
    });
  });

  describe('Produto hooks', () => {
    describe('useProdutos', () => {
      it('deve buscar lista de produtos', async () => {
        // Arrange
        const mockProdutos = [mockProduto];
        vi.mocked(apiService.getProdutos).mockResolvedValue({
          content: mockProdutos,
          totalElements: 1,
          totalPages: 1,
          size: 10,
          number: 0,
        });

        // Act
        const { result } = renderHook(() => useProdutos(mockPageRequest), {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          ),
        });

        // Assert
        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });
        expect(apiService.getProdutos).toHaveBeenCalledWith(mockPageRequest);
        expect(result.current.data?.content).toEqual(mockProdutos);
      });
    });

    describe('useCreateProduto', () => {
      it('deve criar produto e invalidar cache', async () => {
        // Arrange
        const produtoRequest: ProdutoRequest = {
          nome: 'Novo Produto',
          categoria: 'PROTEINA',
          unidadeMedida: 'kg',
        };
        vi.mocked(apiService.createProduto).mockResolvedValue(mockProduto);
        const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

        // Act
        const { result } = renderHook(() => useCreateProduto(), {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          ),
        });

        result.current.mutate(produtoRequest);

        // Assert
        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });
        expect(apiService.createProduto).toHaveBeenCalledWith(produtoRequest);
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['produtos'] });
      });
    });

    describe('useUpdateProduto', () => {
      it('deve atualizar produto e invalidar caches específicos', async () => {
        // Arrange
        const updateData = { nome: 'Produto Atualizado' };
        vi.mocked(apiService.updateProduto).mockResolvedValue(mockProduto);
        const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

        // Act
        const { result } = renderHook(() => useUpdateProduto(), {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          ),
        });

        result.current.mutate({ id: '1', data: updateData });

        // Assert
        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });
        expect(apiService.updateProduto).toHaveBeenCalledWith('1', updateData);
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['produtos'] });
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['produto', '1'] });
      });
    });
  });

  describe('Receita hooks', () => {
    describe('useReceitas', () => {
      it('deve buscar lista de receitas', async () => {
        // Arrange
        const mockReceitas = [mockReceita];
        vi.mocked(apiService.getReceitas).mockResolvedValue({
          content: mockReceitas,
          totalElements: 1,
          totalPages: 1,
          size: 10,
          number: 0,
        });

        // Act
        const { result } = renderHook(() => useReceitas(mockPageRequest), {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          ),
        });

        // Assert
        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });
        expect(apiService.getReceitas).toHaveBeenCalledWith(mockPageRequest);
        expect(result.current.data?.content).toEqual(mockReceitas);
      });
    });

    describe('useCreateReceita', () => {
      it('deve criar receita e invalidar cache', async () => {
        // Arrange
        const receitaRequest: ReceitaRequest = {
          nome: 'Nova Receita',
          descricao: 'Descrição',
          modoPreparo: 'Modo de preparo',
          tempoPreparo: 30,
          porcoes: 4,
        };
        vi.mocked(apiService.createReceita).mockResolvedValue(mockReceita);
        const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

        // Act
        const { result } = renderHook(() => useCreateReceita(), {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          ),
        });

        result.current.mutate(receitaRequest);

        // Assert
        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });
        expect(apiService.createReceita).toHaveBeenCalledWith(receitaRequest);
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['receitas'] });
      });
    });
  });

  describe('ReceitaIngrediente hooks', () => {
    describe('useIngredientesByReceita', () => {
      it('deve buscar ingredientes por receita com configurações específicas', async () => {
        // Arrange
        const mockIngredientes = [mockReceitaIngrediente];
        vi.mocked(apiService.getIngredientesByReceita).mockResolvedValue(mockIngredientes);

        // Act
        const { result } = renderHook(() => useIngredientesByReceita('1'), {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          ),
        });

        // Assert
        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });
        expect(apiService.getIngredientesByReceita).toHaveBeenCalledWith('1');
        expect(result.current.data).toEqual(mockIngredientes);
      });

      it('não deve buscar quando receitaId está vazio', () => {
        // Act
        const { result } = renderHook(() => useIngredientesByReceita(''), {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          ),
        });

        // Assert
        expect(result.current.isFetching).toBe(false);
        expect(apiService.getIngredientesByReceita).not.toHaveBeenCalled();
      });
    });

    describe('useCreateReceitaIngrediente', () => {
      it('deve criar ingrediente e invalidar caches relacionados', async () => {
        // Arrange
        const mockIngrediente = {
          receitaId: '1',
          nome: 'Açúcar',
          quantidade: 100,
          unidadeMedida: UnidadeMedida.GRAMA
        };

        const mockResponse = {
          id: '1',
          ...mockIngrediente
        };

        apiService.createReceitaIngrediente = vi.fn().mockResolvedValue(mockResponse);
        
        const queryClient = createTestQueryClient();
        const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

        // Act
        const { result } = renderHook(() => useCreateReceitaIngrediente(), {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          ),
        });

        await act(async () => {
          await result.current.mutateAsync(mockIngrediente);
        });

        // Assert
        expect(apiService.createReceitaIngrediente).toHaveBeenCalledWith(mockIngrediente);
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
          queryKey: ['receita-ingredientes']
        });
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
          queryKey: ['ingredientes-by-receita', '1']
        });
      });
    });
  });
});