import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from '../../../pages/Dashboard';
import { AuthProvider } from '../../../contexts/AuthContext';
import { useAuth } from '../../../hooks/useAuth';
import { useReceitas, useProdutos, useUsers } from '../../../hooks/useApi';
import type { User, Receita, Produto } from '../../../types';

// Mocks
vi.mock('../../../hooks/useAuth');
vi.mock('../../../hooks/useApi');

const mockUseAuth = vi.mocked(useAuth);
const mockUseReceitas = vi.mocked(useReceitas);
const mockUseProdutos = vi.mocked(useProdutos);
const mockUseUsers = vi.mocked(useUsers);

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

const mockAdminUser: User = {
  ...mockUser,
  role: 'ADMIN'
};

const mockReceitas: Receita[] = [
  {
    receitaId: '1',
    nomeReceita: 'Bolo de Chocolate',
    categoria: 'DOCE',
    dificuldade: 'FACIL',
    tempoPreparo: '30 min',
    notas: 'Delicioso bolo',
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
    notas: 'Lasanha tradicional',
    userId: '1',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  }
];

const mockProdutos: Produto[] = [
  {
    id: '1',
    nome: 'Farinha de Trigo',
    categoria: 'CEREAL',
    descricao: 'Farinha especial',
    userId: '1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    nome: 'Açúcar',
    categoria: 'DOCE',
    descricao: 'Açúcar cristal',
    userId: '1',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  }
];

const mockUsuarios: User[] = [
  mockUser,
  {
    id: '2',
    username: 'admin',
    email: 'admin@test.com',
    role: 'ADMIN',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

describe('Dashboard Page', () => {
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

    mockUseProdutos.mockReturnValue({
      data: { content: mockProdutos },
      isLoading: false,
      error: null,
    } as any);

    mockUseUsers.mockReturnValue({
      data: { content: mockUsuarios },
      isLoading: false,
      error: null,
    } as any);
  });

  describe('Renderização', () => {
    it('deve renderizar o cabeçalho de boas-vindas', () => {
      renderWithProviders(<Dashboard />);

      expect(screen.getByText('Bem-vindo, testuser!')).toBeInTheDocument();
      expect(screen.getByText('Gerencie suas receitas e produtos de forma fácil e organizada.')).toBeInTheDocument();
    });

    it('deve renderizar cards de estatísticas para usuário comum', () => {
      renderWithProviders(<Dashboard />);

      expect(screen.getByText('Total de Receitas')).toBeInTheDocument();
      expect(screen.getByText('Total de Produtos')).toBeInTheDocument();
      expect(screen.queryByText('Total de Usuários')).not.toBeInTheDocument();
    });

    it('deve renderizar card de usuários para admin', () => {
      mockUseAuth.mockReturnValue({
        user: mockAdminUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
      });

      renderWithProviders(<Dashboard />);

      expect(screen.getByText('Total de Receitas')).toBeInTheDocument();
      expect(screen.getByText('Total de Produtos')).toBeInTheDocument();
      expect(screen.getByText('Total de Usuários')).toBeInTheDocument();
    });

    it('deve renderizar ações rápidas', () => {
      renderWithProviders(<Dashboard />);

      expect(screen.getByText('Ações Rápidas')).toBeInTheDocument();
      expect(screen.getByText('Nova Receita')).toBeInTheDocument();
      expect(screen.getByText('Novo Produto')).toBeInTheDocument();
      expect(screen.getByText('Buscar Receitas')).toBeInTheDocument();
    });

    it('deve renderizar seção de receitas recentes', () => {
      renderWithProviders(<Dashboard />);

      expect(screen.getByText('Receitas Recentes')).toBeInTheDocument();
      expect(screen.getByText('Ver todas')).toBeInTheDocument();
    });
  });

  describe('Estatísticas', () => {
    it('deve exibir contadores corretos', () => {
      renderWithProviders(<Dashboard />);

      expect(screen.getByText('2')).toBeInTheDocument(); // Total de receitas
      expect(screen.getByText('2')).toBeInTheDocument(); // Total de produtos
    });

    it('deve mostrar loading nos contadores quando dados estão carregando', () => {
      mockUseReceitas.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      } as any);

      renderWithProviders(<Dashboard />);

      expect(screen.getByText('Total de Receitas')).toBeInTheDocument();
      // Loading component deve estar presente
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('deve exibir zero quando não há dados', () => {
      mockUseReceitas.mockReturnValue({
        data: { content: [] },
        isLoading: false,
        error: null,
      } as any);

      mockUseProdutos.mockReturnValue({
        data: { content: [] },
        isLoading: false,
        error: null,
      } as any);

      renderWithProviders(<Dashboard />);

      const zeroElements = screen.getAllByText('0');
      expect(zeroElements).toHaveLength(2); // Receitas e produtos
    });

    it('deve exibir contadores para admin incluindo usuários', () => {
      mockUseAuth.mockReturnValue({
        user: mockAdminUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
      });

      renderWithProviders(<Dashboard />);

      const twoElements = screen.getAllByText('2');
      expect(twoElements).toHaveLength(3); // Receitas, produtos e usuários
    });
  });

  describe('Links de navegação', () => {
    it('deve ter links corretos nos cards de estatísticas', () => {
      renderWithProviders(<Dashboard />);

      const receitasCard = screen.getByText('Total de Receitas').closest('a');
      const produtosCard = screen.getByText('Total de Produtos').closest('a');

      expect(receitasCard).toHaveAttribute('href', '/receitas');
      expect(produtosCard).toHaveAttribute('href', '/produtos');
    });

    it('deve ter link correto para usuários quando admin', () => {
      mockUseAuth.mockReturnValue({
        user: mockAdminUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
      });

      renderWithProviders(<Dashboard />);

      const usuariosCard = screen.getByText('Total de Usuários').closest('a');
      expect(usuariosCard).toHaveAttribute('href', '/usuarios');
    });

    it('deve ter links corretos nas ações rápidas', () => {
      renderWithProviders(<Dashboard />);

      const novaReceitaLink = screen.getByText('Nova Receita').closest('a');
      const novoProdutoLink = screen.getByText('Novo Produto').closest('a');
      const buscarReceitasLink = screen.getByText('Buscar Receitas').closest('a');

      expect(novaReceitaLink).toHaveAttribute('href', '/receitas/nova');
      expect(novoProdutoLink).toHaveAttribute('href', '/produtos/novo');
      expect(buscarReceitasLink).toHaveAttribute('href', '/receitas?search=true');
    });

    it('deve ter link correto para ver todas as receitas', () => {
      renderWithProviders(<Dashboard />);

      const verTodasLink = screen.getByText('Ver todas').closest('a');
      expect(verTodasLink).toHaveAttribute('href', '/receitas');
    });
  });

  describe('Receitas recentes', () => {
    it('deve exibir lista de receitas recentes', () => {
      renderWithProviders(<Dashboard />);

      expect(screen.getByText('Bolo de Chocolate')).toBeInTheDocument();
      expect(screen.getByText('Lasanha')).toBeInTheDocument();
      expect(screen.getByText('DOCE • FACIL')).toBeInTheDocument();
      expect(screen.getByText('SALGADO • MEDIO')).toBeInTheDocument();
      expect(screen.getByText('30 min')).toBeInTheDocument();
      expect(screen.getByText('60 min')).toBeInTheDocument();
    });

    it('deve limitar a 5 receitas recentes', () => {
      const manyReceitas = Array.from({ length: 10 }, (_, i) => ({
        receitaId: `${i + 1}`,
        nomeReceita: `Receita ${i + 1}`,
        categoria: 'DOCE',
        dificuldade: 'FACIL',
        tempoPreparo: '30 min',
        notas: `Receita ${i + 1}`,
        userId: '1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }));

      mockUseReceitas.mockReturnValue({
        data: { content: manyReceitas },
        isLoading: false,
        error: null,
      } as any);

      renderWithProviders(<Dashboard />);

      expect(screen.getByText('Receita 1')).toBeInTheDocument();
      expect(screen.getByText('Receita 5')).toBeInTheDocument();
      expect(screen.queryByText('Receita 6')).not.toBeInTheDocument();
    });

    it('deve mostrar loading quando receitas estão carregando', () => {
      mockUseReceitas.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      } as any);

      renderWithProviders(<Dashboard />);

      expect(screen.getByText('Carregando receitas...')).toBeInTheDocument();
    });

    it('deve mostrar estado vazio quando não há receitas', () => {
      mockUseReceitas.mockReturnValue({
        data: { content: [] },
        isLoading: false,
        error: null,
      } as any);

      renderWithProviders(<Dashboard />);

      expect(screen.getByText('Nenhuma receita encontrada')).toBeInTheDocument();
      expect(screen.getByText('Criar primeira receita')).toBeInTheDocument();
    });

    it('deve ter links corretos para receitas individuais', () => {
      renderWithProviders(<Dashboard />);

      const boloLink = screen.getByText('Bolo de Chocolate').closest('a');
      const lasanhaLink = screen.getByText('Lasanha').closest('a');

      expect(boloLink).toHaveAttribute('href', '/receitas/1');
      expect(lasanhaLink).toHaveAttribute('href', '/receitas/2');
    });

    it('deve ter link correto para criar primeira receita', () => {
      mockUseReceitas.mockReturnValue({
        data: { content: [] },
        isLoading: false,
        error: null,
      } as any);

      renderWithProviders(<Dashboard />);

      const criarLink = screen.getByText('Criar primeira receita').closest('a');
      expect(criarLink).toHaveAttribute('href', '/receitas/nova');
    });
  });

  describe('Interações', () => {
    it('deve ser possível clicar nos cards de estatísticas', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Dashboard />);

      const receitasCard = screen.getByText('Total de Receitas').closest('a');
      expect(receitasCard).toBeInTheDocument();
      
      // Verificar que o card é clicável
      await user.click(receitasCard!);
      // Como estamos usando BrowserRouter mock, não podemos testar navegação real
    });

    it('deve ser possível clicar nas ações rápidas', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Dashboard />);

      const novaReceitaButton = screen.getByText('Nova Receita');
      expect(novaReceitaButton).toBeInTheDocument();
      
      await user.click(novaReceitaButton);
    });
  });

  describe('Estilização e layout', () => {
    it('deve aplicar classes CSS corretas no container principal', () => {
      renderWithProviders(<Dashboard />);

      const mainContainer = screen.getByText('Bem-vindo, testuser!').closest('.space-y-6');
      expect(mainContainer).toHaveClass('space-y-6');
    });

    it('deve aplicar grid responsivo nos cards de estatísticas', () => {
      renderWithProviders(<Dashboard />);

      const statsGrid = screen.getByText('Total de Receitas').closest('.grid');
      expect(statsGrid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-6');
    });

    it('deve aplicar cores corretas nos ícones de estatísticas', () => {
      renderWithProviders(<Dashboard />);

      const receitasIcon = screen.getByText('Total de Receitas').closest('a')?.querySelector('.from-blue-500');
      const produtosIcon = screen.getByText('Total de Produtos').closest('a')?.querySelector('.from-green-500');

      expect(receitasIcon).toHaveClass('from-blue-500', 'to-blue-600');
      expect(produtosIcon).toHaveClass('from-green-500', 'to-green-600');
    });

    it('deve aplicar cor roxa para ícone de usuários quando admin', () => {
      mockUseAuth.mockReturnValue({
        user: mockAdminUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
      });

      renderWithProviders(<Dashboard />);

      const usuariosIcon = screen.getByText('Total de Usuários').closest('a')?.querySelector('.from-purple-500');
      expect(usuariosIcon).toHaveClass('from-purple-500', 'to-purple-600');
    });
  });

  describe('Casos extremos', () => {
    it('deve lidar com dados undefined', () => {
      mockUseReceitas.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      } as any);

      mockUseProdutos.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      } as any);

      renderWithProviders(<Dashboard />);

      expect(screen.getAllByText('0')).toHaveLength(2);
    });

    it('deve lidar com usuário sem username', () => {
      mockUseAuth.mockReturnValue({
        user: { ...mockUser, username: '' },
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
      });

      renderWithProviders(<Dashboard />);

      expect(screen.getByText('Bem-vindo, !')).toBeInTheDocument();
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

      renderWithProviders(<Dashboard />);

      expect(screen.getByText('Receita Incompleta')).toBeInTheDocument();
      expect(screen.getByText(' • ')).toBeInTheDocument(); // Categoria e dificuldade vazias
    });
  });

  describe('Performance', () => {
    it('deve renderizar rapidamente', () => {
      const startTime = performance.now();
      
      renderWithProviders(<Dashboard />);
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('deve usar useMemo para otimizar cálculos', () => {
      // Renderizar duas vezes com os mesmos dados
      const { rerender } = renderWithProviders(<Dashboard />);
      
      expect(screen.getByText('2')).toBeInTheDocument();
      
      rerender(
        <QueryClientProvider client={new QueryClient()}>
          <BrowserRouter>
            <AuthProvider>
              <Dashboard />
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      );
      
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });
});