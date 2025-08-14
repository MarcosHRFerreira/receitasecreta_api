import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { apiService } from '../../../services/api';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';
import type { ProdutoRequest } from '../../../types';

// Configuração do servidor de mocks
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
});

afterAll(() => {
  server.close();
});

describe('Produtos API Integration Tests', () => {
  beforeEach(() => {
    // Arrange: Configurar token de autenticação
    localStorage.setItem('token', 'mock-jwt-token');
  });

  describe('GET /produtos', () => {
    it('deve retornar status 200 e lista paginada de produtos', async () => {
      // Arrange & Act
      const response = await apiService.getProdutos();

      // Assert
      expect(response).toBeDefined();
      expect(response.content).toHaveLength(3);
      expect(response.content[0].nome).toBe('Farinha de Trigo');
      expect(response.totalElements).toBe(3);
      expect(response.size).toBe(10);
      expect(response.number).toBe(0);
    });

    it('deve retornar produtos com parâmetros de paginação', async () => {
      // Arrange
      const params = { page: 1, size: 5 };

      // Act
      const response = await apiService.getProdutos(params);

      // Assert
      expect(response).toBeDefined();
      expect(response.size).toBe(5); // Mock retorna size do parâmetro
      expect(response.number).toBe(1); // Mock retorna number do parâmetro
    });

    it('deve retornar status 401 para usuário não autenticado', async () => {
      // Arrange
      localStorage.removeItem('token');
      server.use(
        http.get('*/produtos', () => {
          return HttpResponse.json(
            { message: 'Token não fornecido' },
            { status: 401 }
          );
        })
      );

      // Act & Assert
      await expect(apiService.getProdutos()).rejects.toThrow();
    });

    it('deve retornar status 500 para erro interno do servidor', async () => {
      // Arrange
      server.use(
        http.get('*/produtos', () => {
          return HttpResponse.json(
            { message: 'Erro interno do servidor' },
            { status: 500 }
          );
        })
      );

      // Act & Assert
      await expect(apiService.getProdutos()).rejects.toThrow();
    });
  });

  describe('GET /produtos/:id', () => {
    it('deve retornar status 200 e dados do produto específico', async () => {
      // Arrange
      const produtoId = '1';

      // Act
      const response = await apiService.getProdutoById(produtoId);

      // Assert
      expect(response).toBeDefined();
      expect(response.id).toBe('1');
      expect(response.nome).toBe('Farinha de Trigo');
      expect(response.categoria).toBe('INGREDIENTE_SECO');
    });

    it('deve retornar status 404 para produto não encontrado', async () => {
      // Arrange
      const produtoId = '999';
      server.use(
        http.get('*/produtos/:id', () => {
          return HttpResponse.json(
            { message: 'Produto não encontrado' },
            { status: 404 }
          );
        })
      );

      // Act & Assert
      await expect(apiService.getProdutoById(produtoId)).rejects.toThrow();
    });
  });

  describe('POST /produtos', () => {
    it('deve retornar status 201 e criar produto com dados válidos', async () => {
      // Arrange
      const produtoData: ProdutoRequest = {
        nome: 'Açúcar Cristal',
        categoriaproduto: 'INGREDIENTE_SECO',
        unidademedida: 'KILO',
        custoporunidade: 3.50,
        fornecedor: 'Fornecedor ABC',
        descricao: 'Açúcar cristal refinado'
      };

      // Act
      const response = await apiService.createProduto(produtoData);

      // Assert
      expect(response).toBeDefined();
      expect(response.nome).toBe('Açúcar Cristal');
      expect(response.categoria).toBe('INGREDIENTE_SECO');
      expect(response.custoporunidade).toBe(3.50);
    });

    it('deve retornar status 400 para dados inválidos', async () => {
      // Arrange
      server.use(
        http.post('*/produtos', () => {
          return HttpResponse.json(
            { message: 'Dados inválidos' },
            { status: 400 }
          );
        })
      );

      const produtoData: ProdutoRequest = {
        nome: '',
        categoriaproduto: 'INGREDIENTE_SECO',
        unidademedida: 'KILO',
        custoporunidade: -1,
        fornecedor: '',
        descricao: ''
      };

      // Act & Assert
      await expect(apiService.createProduto(produtoData)).rejects.toThrow();
    });

    it('deve retornar status 409 para produto já existente', async () => {
      // Arrange
      server.use(
        http.post('*/produtos', () => {
          return HttpResponse.json(
            { message: 'Produto já existe' },
            { status: 409 }
          );
        })
      );

      const produtoData: ProdutoRequest = {
        nome: 'Farinha de Trigo',
        categoriaproduto: 'INGREDIENTE_SECO',
        unidademedida: 'KILO',
        custoporunidade: 2.50,
        fornecedor: 'Fornecedor XYZ',
        descricao: 'Farinha de trigo especial'
      };

      // Act & Assert
      await expect(apiService.createProduto(produtoData)).rejects.toThrow();
    });
  });

  describe('PUT /produtos/:id', () => {
    it('deve retornar status 200 e atualizar produto existente', async () => {
      // Arrange
      const produtoId = '1';
      const produtoData: ProdutoRequest = {
        nome: 'Farinha de Trigo Integral',
        categoriaproduto: 'INGREDIENTE_SECO',
        unidademedida: 'KILO',
        custoporunidade: 3.00,
        fornecedor: 'Fornecedor Atualizado',
        descricao: 'Farinha integral orgânica'
      };

      server.use(
        http.put('*/produtos/:id', () => {
          return HttpResponse.json({
            id: '1',
            nome: 'Farinha de Trigo Integral',
            categoria: 'INGREDIENTE_SECO',
            unidademedida: 'KILO',
            custoporunidade: 3.00,
            fornecedor: 'Fornecedor Atualizado',
            descricao: 'Farinha integral orgânica',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z'
          });
        })
      );

      // Act
      const response = await apiService.updateProduto(produtoId, produtoData);

      // Assert
      expect(response).toBeDefined();
      expect(response.nome).toBe('Farinha de Trigo Integral');
      expect(response.custoporunidade).toBe(3.00);
    });

    it('deve retornar status 404 para produto não encontrado', async () => {
      // Arrange
      const produtoId = '999';
      const produtoData: ProdutoRequest = {
        nome: 'Produto Inexistente',
        categoriaproduto: 'INGREDIENTE_SECO',
        unidademedida: 'KILO',
        custoporunidade: 1.00,
        fornecedor: 'Fornecedor',
        descricao: 'Descrição'
      };

      server.use(
        http.put('*/produtos/:id', () => {
          return HttpResponse.json(
            { message: 'Produto não encontrado' },
            { status: 404 }
          );
        })
      );

      // Act & Assert
      await expect(apiService.updateProduto(produtoId, produtoData)).rejects.toThrow();
    });
  });

  describe('DELETE /produtos/:id', () => {
    it('deve retornar status 204 para exclusão bem-sucedida', async () => {
      // Arrange
      const produtoId = '1';

      // Act
      const response = await apiService.deleteProduto(produtoId);

      // Assert
      expect(response).toBeUndefined();
    });

    it('deve retornar status 404 para produto não encontrado', async () => {
      // Arrange
      const produtoId = '999';
      server.use(
        http.delete('*/produtos/:id', () => {
          return HttpResponse.json(
            { message: 'Produto não encontrado' },
            { status: 404 }
          );
        })
      );

      // Act & Assert
      await expect(apiService.deleteProduto(produtoId)).rejects.toThrow();
    });

    it('deve retornar status 409 para produto em uso', async () => {
      // Arrange
      const produtoId = '1';
      server.use(
        http.delete('*/produtos/:id', () => {
          return HttpResponse.json(
            { message: 'Produto está sendo usado em receitas' },
            { status: 409 }
          );
        })
      );

      // Act & Assert
      await expect(apiService.deleteProduto(produtoId)).rejects.toThrow();
    });
  });
});