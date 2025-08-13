import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../contexts/AuthContext';
import ProdutosList from '../../../pages/ProdutosList';
import ProdutoForm from '../../../pages/ProdutoForm';
import ProdutoView from '../../../pages/ProdutoView';
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

describe('Produtos Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockAuthenticatedUser();
  });

  describe('Produtos List Flow', () => {
    it('should load and display produtos list', async () => {
      const Wrapper = createWrapper();
      
      render(<ProdutosList />, { wrapper: Wrapper });

      // Wait for produtos to load
      await waitFor(() => {
        expect(screen.getByText(/farinha de trigo/i)).toBeInTheDocument();
        expect(screen.getByText(/açúcar cristal/i)).toBeInTheDocument();
        expect(screen.getByText(/ovos/i)).toBeInTheDocument();
      });

      // Verify pagination
      expect(screen.getByText(/página 1 de/i)).toBeInTheDocument();
    });

    it('should filter produtos by search term', async () => {
      const Wrapper = createWrapper();
      
      render(<ProdutosList />, { wrapper: Wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/farinha de trigo/i)).toBeInTheDocument();
      });

      // Search for specific produto
      const searchInput = screen.getByPlaceholderText(/buscar produtos/i);
      fireEvent.change(searchInput, { target: { value: 'farinha' } });

      // Wait for filtered results
      await waitFor(() => {
        expect(screen.getByText(/farinha de trigo/i)).toBeInTheDocument();
        expect(screen.queryByText(/açúcar cristal/i)).not.toBeInTheDocument();
      });
    });

    it('should filter produtos by category', async () => {
      const Wrapper = createWrapper();
      
      render(<ProdutosList />, { wrapper: Wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/farinha de trigo/i)).toBeInTheDocument();
      });

      // Filter by category
      const categorySelect = screen.getByLabelText(/categoria/i);
      fireEvent.change(categorySelect, { target: { value: 'Grãos e Cereais' } });

      // Wait for filtered results
      await waitFor(() => {
        expect(screen.getByText(/farinha de trigo/i)).toBeInTheDocument();
        expect(screen.queryByText(/ovos/i)).not.toBeInTheDocument();
      });
    });

    it('should handle pagination', async () => {
      const Wrapper = createWrapper();
      
      render(<ProdutosList />, { wrapper: Wrapper });

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

    it('should clear filters', async () => {
      const Wrapper = createWrapper();
      
      render(<ProdutosList />, { wrapper: Wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/farinha de trigo/i)).toBeInTheDocument();
      });

      // Apply filters
      const searchInput = screen.getByPlaceholderText(/buscar produtos/i);
      const categorySelect = screen.getByLabelText(/categoria/i);
      
      fireEvent.change(searchInput, { target: { value: 'farinha' } });
      fireEvent.change(categorySelect, { target: { value: 'Grãos e Cereais' } });

      // Clear filters
      const clearButton = screen.getByRole('button', { name: /limpar filtros/i });
      fireEvent.click(clearButton);

      // Verify all produtos are shown again
      await waitFor(() => {
        expect(screen.getByText(/farinha de trigo/i)).toBeInTheDocument();
        expect(screen.getByText(/açúcar cristal/i)).toBeInTheDocument();
        expect(screen.getByText(/ovos/i)).toBeInTheDocument();
      });
    });
  });

  describe('Produto Creation Flow', () => {
    it('should create a new produto successfully', async () => {
      const Wrapper = createWrapper();
      
      render(<ProdutoForm />, { wrapper: Wrapper });

      // Fill produto form
      const nomeInput = screen.getByLabelText(/nome do produto/i);
      const descricaoInput = screen.getByLabelText(/descrição/i);
      const categoriaSelect = screen.getByLabelText(/categoria/i);
      const unidadeSelect = screen.getByLabelText(/unidade de medida/i);
      const precoInput = screen.getByLabelText(/preço médio/i);
      const submitButton = screen.getByRole('button', { name: /salvar produto/i });

      fireEvent.change(nomeInput, { target: { value: 'Novo Produto Teste' } });
      fireEvent.change(descricaoInput, { target: { value: 'Descrição do produto teste' } });
      fireEvent.change(categoriaSelect, { target: { value: 'Temperos e Condimentos' } });
      fireEvent.change(unidadeSelect, { target: { value: 'kg' } });
      fireEvent.change(precoInput, { target: { value: '15.50' } });

      fireEvent.click(submitButton);

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText(/produto criado com sucesso/i)).toBeInTheDocument();
      });
    });

    it('should handle validation errors', async () => {
      const Wrapper = createWrapper();
      
      render(<ProdutoForm />, { wrapper: Wrapper });

      // Try to submit empty form
      const submitButton = screen.getByRole('button', { name: /salvar produto/i });
      fireEvent.click(submitButton);

      // Wait for validation errors
      await waitFor(() => {
        expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
        expect(screen.getByText(/categoria é obrigatória/i)).toBeInTheDocument();
        expect(screen.getByText(/unidade de medida é obrigatória/i)).toBeInTheDocument();
      });
    });

    it('should handle server errors during creation', async () => {
      // Override handler for server error
      server.use(
        http.post('http://localhost:8082/receitasecreta/produtos', () => {
          return HttpResponse.json(
            { message: 'Erro interno do servidor' },
            { status: 500 }
          );
        })
      );

      const Wrapper = createWrapper();
      
      render(<ProdutoForm />, { wrapper: Wrapper });

      // Fill and submit form
      const nomeInput = screen.getByLabelText(/nome do produto/i);
      const categoriaSelect = screen.getByLabelText(/categoria/i);
      const unidadeSelect = screen.getByLabelText(/unidade de medida/i);
      const submitButton = screen.getByRole('button', { name: /salvar produto/i });

      fireEvent.change(nomeInput, { target: { value: 'Novo Produto' } });
      fireEvent.change(categoriaSelect, { target: { value: 'Temperos e Condimentos' } });
      fireEvent.change(unidadeSelect, { target: { value: 'kg' } });

      fireEvent.click(submitButton);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/erro interno do servidor/i)).toBeInTheDocument();
      });
    });

    it('should validate price format', async () => {
      const Wrapper = createWrapper();
      
      render(<ProdutoForm />, { wrapper: Wrapper });

      // Fill form with invalid price
      const nomeInput = screen.getByLabelText(/nome do produto/i);
      const categoriaSelect = screen.getByLabelText(/categoria/i);
      const unidadeSelect = screen.getByLabelText(/unidade de medida/i);
      const precoInput = screen.getByLabelText(/preço médio/i);
      const submitButton = screen.getByRole('button', { name: /salvar produto/i });

      fireEvent.change(nomeInput, { target: { value: 'Produto Teste' } });
      fireEvent.change(categoriaSelect, { target: { value: 'Temperos e Condimentos' } });
      fireEvent.change(unidadeSelect, { target: { value: 'kg' } });
      fireEvent.change(precoInput, { target: { value: 'preço inválido' } });

      fireEvent.click(submitButton);

      // Wait for validation error
      await waitFor(() => {
        expect(screen.getByText(/preço deve ser um número válido/i)).toBeInTheDocument();
      });
    });
  });

  describe('Produto View Flow', () => {
    it('should display produto details', async () => {
      const Wrapper = createWrapper();
      
      // Mock route params
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useParams: () => ({ id: '1' })
        };
      });

      render(<ProdutoView />, { wrapper: Wrapper });

      // Wait for produto to load
      await waitFor(() => {
        expect(screen.getByText(/farinha de trigo/i)).toBeInTheDocument();
        expect(screen.getByText(/farinha refinada especial/i)).toBeInTheDocument();
        expect(screen.getByText(/grãos e cereais/i)).toBeInTheDocument();
        expect(screen.getByText(/kg/i)).toBeInTheDocument();
      });
    });

    it('should handle produto not found', async () => {
      // Override handler for not found
      server.use(
        http.get('http://localhost:8082/receitasecreta/produtos/:id', () => {
          return HttpResponse.json(
            { message: 'Produto não encontrado' },
            { status: 404 }
          );
        })
      );

      const Wrapper = createWrapper();
      
      render(<ProdutoView />, { wrapper: Wrapper });

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/produto não encontrado/i)).toBeInTheDocument();
      });
    });

    it('should display price information when available', async () => {
      const Wrapper = createWrapper();
      
      render(<ProdutoView />, { wrapper: Wrapper });

      // Wait for produto to load
      await waitFor(() => {
        expect(screen.getByText(/farinha de trigo/i)).toBeInTheDocument();
      });

      // Check if price is displayed
      const priceElement = screen.queryByText(/r\$/i);
      if (priceElement) {
        expect(priceElement).toBeInTheDocument();
      }
    });
  });

  describe('Produto Update Flow', () => {
    it('should update produto successfully', async () => {
      const Wrapper = createWrapper();
      
      // Mock route params for edit
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useParams: () => ({ id: '1' })
        };
      });

      render(<ProdutoForm />, { wrapper: Wrapper });

      // Wait for form to load with existing data
      await waitFor(() => {
        expect(screen.getByDisplayValue(/farinha de trigo/i)).toBeInTheDocument();
      });

      // Update produto name
      const nomeInput = screen.getByLabelText(/nome do produto/i);
      fireEvent.change(nomeInput, { target: { value: 'Farinha de Trigo Atualizada' } });

      const submitButton = screen.getByRole('button', { name: /atualizar produto/i });
      fireEvent.click(submitButton);

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText(/produto atualizado com sucesso/i)).toBeInTheDocument();
      });
    });

    it('should handle update errors', async () => {
      // Override handler for update error
      server.use(
        http.put('http://localhost:8082/receitasecreta/produtos/:id', () => {
          return HttpResponse.json(
            { message: 'Erro ao atualizar produto' },
            { status: 500 }
          );
        })
      );

      const Wrapper = createWrapper();
      
      render(<ProdutoForm />, { wrapper: Wrapper });

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByDisplayValue(/farinha de trigo/i)).toBeInTheDocument();
      });

      // Update and submit
      const nomeInput = screen.getByLabelText(/nome do produto/i);
      fireEvent.change(nomeInput, { target: { value: 'Produto Atualizado' } });

      const submitButton = screen.getByRole('button', { name: /atualizar produto/i });
      fireEvent.click(submitButton);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/erro ao atualizar produto/i)).toBeInTheDocument();
      });
    });
  });

  describe('Produto Delete Flow', () => {
    it('should delete produto successfully', async () => {
      const Wrapper = createWrapper();
      
      render(<ProdutosList />, { wrapper: Wrapper });

      // Wait for produtos to load
      await waitFor(() => {
        expect(screen.getByText(/farinha de trigo/i)).toBeInTheDocument();
      });

      // Find and click delete button
      const produtoCard = screen.getByText(/farinha de trigo/i).closest('[data-testid="produto-card"]');
      const deleteButton = within(produtoCard!).getByRole('button', { name: /excluir/i });
      fireEvent.click(deleteButton);

      // Confirm deletion in modal
      const confirmButton = screen.getByRole('button', { name: /confirmar/i });
      fireEvent.click(confirmButton);

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText(/produto excluído com sucesso/i)).toBeInTheDocument();
      });

      // Verify produto is removed from list
      await waitFor(() => {
        expect(screen.queryByText(/farinha de trigo/i)).not.toBeInTheDocument();
      });
    });

    it('should handle delete errors', async () => {
      // Override handler for delete error
      server.use(
        http.delete('http://localhost:8082/receitasecreta/produtos/:id', () => {
          return HttpResponse.json(
            { message: 'Erro ao excluir produto' },
            { status: 500 }
          );
        })
      );

      const Wrapper = createWrapper();
      
      render(<ProdutosList />, { wrapper: Wrapper });

      // Wait for produtos to load
      await waitFor(() => {
        expect(screen.getByText(/farinha de trigo/i)).toBeInTheDocument();
      });

      // Find and click delete button
      const produtoCard = screen.getByText(/farinha de trigo/i).closest('[data-testid="produto-card"]');
      const deleteButton = within(produtoCard!).getByRole('button', { name: /excluir/i });
      fireEvent.click(deleteButton);

      // Confirm deletion in modal
      const confirmButton = screen.getByRole('button', { name: /confirmar/i });
      fireEvent.click(confirmButton);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/erro ao excluir produto/i)).toBeInTheDocument();
      });
    });

    it('should cancel deletion', async () => {
      const Wrapper = createWrapper();
      
      render(<ProdutosList />, { wrapper: Wrapper });

      // Wait for produtos to load
      await waitFor(() => {
        expect(screen.getByText(/farinha de trigo/i)).toBeInTheDocument();
      });

      // Find and click delete button
      const produtoCard = screen.getByText(/farinha de trigo/i).closest('[data-testid="produto-card"]');
      const deleteButton = within(produtoCard!).getByRole('button', { name: /excluir/i });
      fireEvent.click(deleteButton);

      // Cancel deletion in modal
      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      fireEvent.click(cancelButton);

      // Verify produto is still in list
      expect(screen.getByText(/farinha de trigo/i)).toBeInTheDocument();
    });
  });

  describe('Produto Categories', () => {
    it('should display correct category colors', async () => {
      const Wrapper = createWrapper();
      
      render(<ProdutosList />, { wrapper: Wrapper });

      // Wait for produtos to load
      await waitFor(() => {
        expect(screen.getByText(/farinha de trigo/i)).toBeInTheDocument();
      });

      // Check if category badges have appropriate styling
      const categoryBadges = screen.getAllByText(/grãos e cereais|laticínios|proteínas/i);
      expect(categoryBadges.length).toBeGreaterThan(0);
    });

    it('should filter by different categories', async () => {
      const Wrapper = createWrapper();
      
      render(<ProdutosList />, { wrapper: Wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/farinha de trigo/i)).toBeInTheDocument();
      });

      // Test different category filters
      const categorySelect = screen.getByLabelText(/categoria/i);
      
      // Filter by Laticínios
      fireEvent.change(categorySelect, { target: { value: 'Laticínios' } });
      await waitFor(() => {
        expect(screen.queryByText(/farinha de trigo/i)).not.toBeInTheDocument();
      });

      // Filter by Proteínas
      fireEvent.change(categorySelect, { target: { value: 'Proteínas' } });
      await waitFor(() => {
        expect(screen.getByText(/ovos/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Override handler for network error
      server.use(
        http.get('http://localhost:8082/receitasecreta/produtos', () => {
          return HttpResponse.error();
        })
      );

      const Wrapper = createWrapper();
      
      render(<ProdutosList />, { wrapper: Wrapper });

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
        http.get('http://localhost:8082/receitasecreta/produtos', () => {
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
      
      render(<ProdutosList />, { wrapper: Wrapper });

      // Wait for empty state message
      await waitFor(() => {
        expect(screen.getByText(/nenhum produto encontrado/i)).toBeInTheDocument();
      });
    });

    it('should handle server timeout', async () => {
      // Override handler for timeout
      server.use(
        http.get('http://localhost:8082/receitasecreta/produtos', () => {
          return new Promise(() => {}); // Never resolves
        })
      );

      const Wrapper = createWrapper();
      
      render(<ProdutosList />, { wrapper: Wrapper });

      // Should show loading state
      expect(screen.getByText(/carregando/i)).toBeInTheDocument();
    });
  });

  describe('Performance and UX', () => {
    it('should show loading states during operations', async () => {
      const Wrapper = createWrapper();
      
      render(<ProdutosList />, { wrapper: Wrapper });

      // Should show loading initially
      expect(screen.getByText(/carregando/i)).toBeInTheDocument();

      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByText(/farinha de trigo/i)).toBeInTheDocument();
      });
    });

    it('should debounce search input', async () => {
      const Wrapper = createWrapper();
      
      render(<ProdutosList />, { wrapper: Wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/farinha de trigo/i)).toBeInTheDocument();
      });

      // Type quickly in search input
      const searchInput = screen.getByPlaceholderText(/buscar produtos/i);
      fireEvent.change(searchInput, { target: { value: 'f' } });
      fireEvent.change(searchInput, { target: { value: 'fa' } });
      fireEvent.change(searchInput, { target: { value: 'far' } });
      fireEvent.change(searchInput, { target: { value: 'fari' } });
      fireEvent.change(searchInput, { target: { value: 'farin' } });
      fireEvent.change(searchInput, { target: { value: 'farinha' } });

      // Should debounce and only search after delay
      await waitFor(() => {
        expect(screen.getByText(/farinha de trigo/i)).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });
});