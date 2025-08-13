import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../contexts/AuthContext';
import ReceitasList from '../../../pages/ReceitasList';
import ReceitaForm from '../../../pages/ReceitaForm';
import ReceitaView from '../../../pages/ReceitaView';
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

// Mock authenticated user
const mockAuthenticatedUser = () => {
  localStorage.setItem('token', 'valid-token');
  localStorage.setItem('user', JSON.stringify({
    id: '1',
    username: 'Test User',
    email: 'test@test.com',
    role: 'USER'
  }));
};

describe('Receitas Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockAuthenticatedUser();
  });

  describe('Receitas List Flow', () => {
    it('should load and display receitas list', async () => {
      const Wrapper = createWrapper();
      
      render(<ReceitasList />, { wrapper: Wrapper });

      // Wait for receitas to load
      await waitFor(() => {
        expect(screen.getByText(/bolo de chocolate/i)).toBeInTheDocument();
        expect(screen.getByText(/lasanha bolonhesa/i)).toBeInTheDocument();
      });

      // Verify pagination
      expect(screen.getByText(/página 1 de/i)).toBeInTheDocument();
    });

    it('should filter receitas by search term', async () => {
      const Wrapper = createWrapper();
      
      render(<ReceitasList />, { wrapper: Wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/bolo de chocolate/i)).toBeInTheDocument();
      });

      // Search for specific receita
      const searchInput = screen.getByPlaceholderText(/buscar receitas/i);
      fireEvent.change(searchInput, { target: { value: 'bolo' } });

      // Wait for filtered results
      await waitFor(() => {
        expect(screen.getByText(/bolo de chocolate/i)).toBeInTheDocument();
        expect(screen.queryByText(/lasanha bolonhesa/i)).not.toBeInTheDocument();
      });
    });

    it('should filter receitas by category', async () => {
      const Wrapper = createWrapper();
      
      render(<ReceitasList />, { wrapper: Wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/bolo de chocolate/i)).toBeInTheDocument();
      });

      // Filter by category
      const categorySelect = screen.getByLabelText(/categoria/i);
      fireEvent.change(categorySelect, { target: { value: 'Sobremesa' } });

      // Wait for filtered results
      await waitFor(() => {
        expect(screen.getByText(/bolo de chocolate/i)).toBeInTheDocument();
        expect(screen.queryByText(/lasanha bolonhesa/i)).not.toBeInTheDocument();
      });
    });

    it('should filter receitas by difficulty', async () => {
      const Wrapper = createWrapper();
      
      render(<ReceitasList />, { wrapper: Wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/bolo de chocolate/i)).toBeInTheDocument();
      });

      // Filter by difficulty
      const difficultySelect = screen.getByLabelText(/dificuldade/i);
      fireEvent.change(difficultySelect, { target: { value: 'Fácil' } });

      // Wait for filtered results
      await waitFor(() => {
        expect(screen.getByText(/bolo de chocolate/i)).toBeInTheDocument();
      });
    });

    it('should handle pagination', async () => {
      const Wrapper = createWrapper();
      
      render(<ReceitasList />, { wrapper: Wrapper });

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
  });

  describe('Receita Creation Flow', () => {
    it('should create a new receita successfully', async () => {
      const Wrapper = createWrapper();
      
      render(<ReceitaForm />, { wrapper: Wrapper });

      // Fill receita form
      const nomeInput = screen.getByLabelText(/nome da receita/i);
      const descricaoInput = screen.getByLabelText(/descrição/i);
      const modoPreparoInput = screen.getByLabelText(/modo de preparo/i);
      const tempoPreparoInput = screen.getByLabelText(/tempo de preparo/i);
      const porcoesInput = screen.getByLabelText(/porções/i);
      const categoriaSelect = screen.getByLabelText(/categoria/i);
      const dificuldadeSelect = screen.getByLabelText(/dificuldade/i);
      const submitButton = screen.getByRole('button', { name: /salvar receita/i });

      fireEvent.change(nomeInput, { target: { value: 'Nova Receita Teste' } });
      fireEvent.change(descricaoInput, { target: { value: 'Descrição da receita teste' } });
      fireEvent.change(modoPreparoInput, { target: { value: 'Modo de preparo detalhado' } });
      fireEvent.change(tempoPreparoInput, { target: { value: '30' } });
      fireEvent.change(porcoesInput, { target: { value: '4' } });
      fireEvent.change(categoriaSelect, { target: { value: 'Prato Principal' } });
      fireEvent.change(dificuldadeSelect, { target: { value: 'Médio' } });

      fireEvent.click(submitButton);

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText(/receita criada com sucesso/i)).toBeInTheDocument();
      });
    });

    it('should handle validation errors', async () => {
      const Wrapper = createWrapper();
      
      render(<ReceitaForm />, { wrapper: Wrapper });

      // Try to submit empty form
      const submitButton = screen.getByRole('button', { name: /salvar receita/i });
      fireEvent.click(submitButton);

      // Wait for validation errors
      await waitFor(() => {
        expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
        expect(screen.getByText(/descrição é obrigatória/i)).toBeInTheDocument();
      });
    });

    it('should handle server errors during creation', async () => {
      // Override handler for server error
      server.use(
        http.post('http://localhost:8082/receitasecreta/receitas', () => {
          return HttpResponse.json(
            { message: 'Erro interno do servidor' },
            { status: 500 }
          );
        })
      );

      const Wrapper = createWrapper();
      
      render(<ReceitaForm />, { wrapper: Wrapper });

      // Fill and submit form
      const nomeInput = screen.getByLabelText(/nome da receita/i);
      const descricaoInput = screen.getByLabelText(/descrição/i);
      const modoPreparoInput = screen.getByLabelText(/modo de preparo/i);
      const tempoPreparoInput = screen.getByLabelText(/tempo de preparo/i);
      const porcoesInput = screen.getByLabelText(/porções/i);
      const categoriaSelect = screen.getByLabelText(/categoria/i);
      const dificuldadeSelect = screen.getByLabelText(/dificuldade/i);
      const submitButton = screen.getByRole('button', { name: /salvar receita/i });

      fireEvent.change(nomeInput, { target: { value: 'Nova Receita' } });
      fireEvent.change(descricaoInput, { target: { value: 'Descrição' } });
      fireEvent.change(modoPreparoInput, { target: { value: 'Modo de preparo' } });
      fireEvent.change(tempoPreparoInput, { target: { value: '30' } });
      fireEvent.change(porcoesInput, { target: { value: '4' } });
      fireEvent.change(categoriaSelect, { target: { value: 'Prato Principal' } });
      fireEvent.change(dificuldadeSelect, { target: { value: 'Médio' } });

      fireEvent.click(submitButton);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/erro interno do servidor/i)).toBeInTheDocument();
      });
    });
  });

  describe('Receita View Flow', () => {
    it('should display receita details', async () => {
      const Wrapper = createWrapper();
      
      // Mock route params
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useParams: () => ({ id: '1' })
        };
      });

      render(<ReceitaView />, { wrapper: Wrapper });

      // Wait for receita to load
      await waitFor(() => {
        expect(screen.getByText(/bolo de chocolate/i)).toBeInTheDocument();
        expect(screen.getByText(/delicioso bolo de chocolate/i)).toBeInTheDocument();
        expect(screen.getByText(/45 minutos/i)).toBeInTheDocument();
        expect(screen.getByText(/8 porções/i)).toBeInTheDocument();
      });
    });

    it('should handle receita not found', async () => {
      // Override handler for not found
      server.use(
        http.get('http://localhost:8082/receitasecreta/receitas/:id', () => {
          return HttpResponse.json(
            { message: 'Receita não encontrada' },
            { status: 404 }
          );
        })
      );

      const Wrapper = createWrapper();
      
      render(<ReceitaView />, { wrapper: Wrapper });

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/receita não encontrada/i)).toBeInTheDocument();
      });
    });
  });

  describe('Receita Update Flow', () => {
    it('should update receita successfully', async () => {
      const Wrapper = createWrapper();
      
      // Mock route params for edit
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useParams: () => ({ id: '1' })
        };
      });

      render(<ReceitaForm />, { wrapper: Wrapper });

      // Wait for form to load with existing data
      await waitFor(() => {
        expect(screen.getByDisplayValue(/bolo de chocolate/i)).toBeInTheDocument();
      });

      // Update receita name
      const nomeInput = screen.getByLabelText(/nome da receita/i);
      fireEvent.change(nomeInput, { target: { value: 'Bolo de Chocolate Atualizado' } });

      const submitButton = screen.getByRole('button', { name: /atualizar receita/i });
      fireEvent.click(submitButton);

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText(/receita atualizada com sucesso/i)).toBeInTheDocument();
      });
    });
  });

  describe('Receita Delete Flow', () => {
    it('should delete receita successfully', async () => {
      const Wrapper = createWrapper();
      
      render(<ReceitasList />, { wrapper: Wrapper });

      // Wait for receitas to load
      await waitFor(() => {
        expect(screen.getByText(/bolo de chocolate/i)).toBeInTheDocument();
      });

      // Find and click delete button
      const receitaCard = screen.getByText(/bolo de chocolate/i).closest('[data-testid="receita-card"]');
      const deleteButton = within(receitaCard!).getByRole('button', { name: /excluir/i });
      fireEvent.click(deleteButton);

      // Confirm deletion in modal
      const confirmButton = screen.getByRole('button', { name: /confirmar/i });
      fireEvent.click(confirmButton);

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText(/receita excluída com sucesso/i)).toBeInTheDocument();
      });

      // Verify receita is removed from list
      await waitFor(() => {
        expect(screen.queryByText(/bolo de chocolate/i)).not.toBeInTheDocument();
      });
    });

    it('should handle delete errors', async () => {
      // Override handler for delete error
      server.use(
        http.delete('http://localhost:8082/receitasecreta/receitas/:id', () => {
          return HttpResponse.json(
            { message: 'Erro ao excluir receita' },
            { status: 500 }
          );
        })
      );

      const Wrapper = createWrapper();
      
      render(<ReceitasList />, { wrapper: Wrapper });

      // Wait for receitas to load
      await waitFor(() => {
        expect(screen.getByText(/bolo de chocolate/i)).toBeInTheDocument();
      });

      // Find and click delete button
      const receitaCard = screen.getByText(/bolo de chocolate/i).closest('[data-testid="receita-card"]');
      const deleteButton = within(receitaCard!).getByRole('button', { name: /excluir/i });
      fireEvent.click(deleteButton);

      // Confirm deletion in modal
      const confirmButton = screen.getByRole('button', { name: /confirmar/i });
      fireEvent.click(confirmButton);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/erro ao excluir receita/i)).toBeInTheDocument();
      });
    });
  });

  describe('Receita Ingredients Flow', () => {
    it('should manage receita ingredients', async () => {
      const Wrapper = createWrapper();
      
      render(<ReceitaForm />, { wrapper: Wrapper });

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByLabelText(/nome da receita/i)).toBeInTheDocument();
      });

      // Add ingredient
      const addIngredientButton = screen.getByRole('button', { name: /adicionar ingrediente/i });
      fireEvent.click(addIngredientButton);

      // Fill ingredient details
      const produtoSelect = screen.getByLabelText(/produto/i);
      const quantidadeInput = screen.getByLabelText(/quantidade/i);
      const unidadeSelect = screen.getByLabelText(/unidade/i);

      fireEvent.change(produtoSelect, { target: { value: '1' } });
      fireEvent.change(quantidadeInput, { target: { value: '2' } });
      fireEvent.change(unidadeSelect, { target: { value: 'xícaras' } });

      // Verify ingredient is added
      expect(screen.getByDisplayValue('2')).toBeInTheDocument();
      expect(screen.getByDisplayValue('xícaras')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Override handler for network error
      server.use(
        http.get('http://localhost:8082/receitasecreta/receitas', () => {
          return HttpResponse.error();
        })
      );

      const Wrapper = createWrapper();
      
      render(<ReceitasList />, { wrapper: Wrapper });

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/erro de conexão/i)).toBeInTheDocument();
      });

      // Verify retry button is available
      const retryButton = screen.getByRole('button', { name: /tentar novamente/i });
      expect(retryButton).toBeInTheDocument();
    });

    it('should handle timeout errors', async () => {
      // Override handler for timeout
      server.use(
        http.get('http://localhost:8082/receitasecreta/receitas', () => {
          return new Promise(() => {}); // Never resolves
        })
      );

      const Wrapper = createWrapper();
      
      render(<ReceitasList />, { wrapper: Wrapper });

      // Should show loading state
      expect(screen.getByText(/carregando/i)).toBeInTheDocument();
    });
  });
});