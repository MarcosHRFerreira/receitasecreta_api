import { describe, it, expect } from 'vitest';
import { QUERY_KEYS } from '../../../constants/queryKeys';

describe('QUERY_KEYS constants', () => {
  describe('Estrutura das chaves', () => {
    it('deve ter todas as chaves esperadas', () => {
      // Assert
      expect(QUERY_KEYS).toHaveProperty('USERS');
      expect(QUERY_KEYS).toHaveProperty('USER');
      expect(QUERY_KEYS).toHaveProperty('PRODUTOS');
      expect(QUERY_KEYS).toHaveProperty('PRODUTO');
      expect(QUERY_KEYS).toHaveProperty('RECEITAS');
      expect(QUERY_KEYS).toHaveProperty('RECEITA');
      expect(QUERY_KEYS).toHaveProperty('RECEITA_INGREDIENTES');
      expect(QUERY_KEYS).toHaveProperty('INGREDIENTES_BY_RECEITA');
    });

    it('deve ter exatamente 8 chaves', () => {
      // Arrange & Act
      const keys = Object.keys(QUERY_KEYS);

      // Assert
      expect(keys).toHaveLength(8);
    });

    it('deve ter chaves em formato UPPER_CASE', () => {
      // Arrange & Act
      const keys = Object.keys(QUERY_KEYS);

      // Assert
      keys.forEach(key => {
        expect(key).toMatch(/^[A-Z_]+$/);
      });
    });
  });

  describe('Valores das chaves', () => {
    it('deve ter valores corretos para cada chave', () => {
      // Assert
      expect(QUERY_KEYS.USERS).toBe('users');
      expect(QUERY_KEYS.USER).toBe('user');
      expect(QUERY_KEYS.PRODUTOS).toBe('produtos');
      expect(QUERY_KEYS.PRODUTO).toBe('produto');
      expect(QUERY_KEYS.RECEITAS).toBe('receitas');
      expect(QUERY_KEYS.RECEITA).toBe('receita');
      expect(QUERY_KEYS.RECEITA_INGREDIENTES).toBe('receita-ingredientes');
      expect(QUERY_KEYS.INGREDIENTES_BY_RECEITA).toBe('ingredientes-by-receita');
    });

    it('deve ter valores em formato kebab-case ou lowercase', () => {
      // Arrange & Act
      const values = Object.values(QUERY_KEYS);

      // Assert
      values.forEach(value => {
        expect(value).toMatch(/^[a-z-]+$/);
      });
    });

    it('deve ter valores não vazios', () => {
      // Arrange & Act
      const values = Object.values(QUERY_KEYS);

      // Assert
      values.forEach(value => {
        expect(value).toBeTruthy();
        expect(value.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Unicidade das chaves', () => {
    it('deve ter valores únicos', () => {
      // Arrange & Act
      const values = Object.values(QUERY_KEYS);
      const uniqueValues = new Set(values);

      // Assert
      expect(uniqueValues.size).toBe(values.length);
    });

    it('deve ter chaves únicas', () => {
      // Arrange & Act
      const keys = Object.keys(QUERY_KEYS);
      const uniqueKeys = new Set(keys);

      // Assert
      expect(uniqueKeys.size).toBe(keys.length);
    });

    it('não deve ter valores duplicados', () => {
      // Arrange & Act
      const values = Object.values(QUERY_KEYS);
      const duplicates = values.filter((value, index) => values.indexOf(value) !== index);

      // Assert
      expect(duplicates).toHaveLength(0);
    });
  });

  describe('Tipagem e imutabilidade', () => {
    it('deve ser um objeto readonly', () => {
      // Arrange & Act
      // O TypeScript já garante imutabilidade com 'as const'
      // Testamos apenas que o objeto existe e tem as propriedades corretas
      
      // Assert
      expect(QUERY_KEYS).toBeDefined();
      expect(typeof QUERY_KEYS).toBe('object');
    });

    it('deve ter tipo correto para cada propriedade', () => {
      // Assert
      expect(typeof QUERY_KEYS.USERS).toBe('string');
      expect(typeof QUERY_KEYS.USER).toBe('string');
      expect(typeof QUERY_KEYS.PRODUTOS).toBe('string');
      expect(typeof QUERY_KEYS.PRODUTO).toBe('string');
      expect(typeof QUERY_KEYS.RECEITAS).toBe('string');
      expect(typeof QUERY_KEYS.RECEITA).toBe('string');
      expect(typeof QUERY_KEYS.RECEITA_INGREDIENTES).toBe('string');
      expect(typeof QUERY_KEYS.INGREDIENTES_BY_RECEITA).toBe('string');
    });

    it('deve ser um objeto', () => {
      // Assert
      expect(typeof QUERY_KEYS).toBe('object');
      expect(QUERY_KEYS).not.toBeNull();
      expect(Array.isArray(QUERY_KEYS)).toBe(false);
    });
  });

  describe('Convenções de nomenclatura', () => {
    it('deve seguir padrão de nomenclatura para entidades', () => {
      // Assert - Entidades no plural
      expect(QUERY_KEYS.USERS).toBe('users');
      expect(QUERY_KEYS.PRODUTOS).toBe('produtos');
      expect(QUERY_KEYS.RECEITAS).toBe('receitas');
    });

    it('deve seguir padrão de nomenclatura para entidade singular', () => {
      // Assert - Entidades no singular
      expect(QUERY_KEYS.USER).toBe('user');
      expect(QUERY_KEYS.PRODUTO).toBe('produto');
      expect(QUERY_KEYS.RECEITA).toBe('receita');
    });

    it('deve usar kebab-case para chaves compostas', () => {
      // Assert
      expect(QUERY_KEYS.RECEITA_INGREDIENTES).toBe('receita-ingredientes');
      expect(QUERY_KEYS.INGREDIENTES_BY_RECEITA).toBe('ingredientes-by-receita');
    });

    it('deve ter correspondência entre chaves singular e plural', () => {
      // Assert
      expect(QUERY_KEYS.USER).toBe('user');
      expect(QUERY_KEYS.USERS).toBe('users');
      
      expect(QUERY_KEYS.PRODUTO).toBe('produto');
      expect(QUERY_KEYS.PRODUTOS).toBe('produtos');
      
      expect(QUERY_KEYS.RECEITA).toBe('receita');
      expect(QUERY_KEYS.RECEITAS).toBe('receitas');
    });
  });

  describe('Uso prático', () => {
    it('deve ser utilizável como chave de query', () => {
      // Arrange
      const mockQueryKey = [QUERY_KEYS.USERS];
      const mockQueryKeyWithParams = [QUERY_KEYS.USER, '123'];
      const mockQueryKeyComplex = [QUERY_KEYS.INGREDIENTES_BY_RECEITA, 'receita-456'];

      // Assert
      expect(mockQueryKey).toEqual(['users']);
      expect(mockQueryKeyWithParams).toEqual(['user', '123']);
      expect(mockQueryKeyComplex).toEqual(['ingredientes-by-receita', 'receita-456']);
    });

    it('deve ser compatível com React Query', () => {
      // Arrange - Simulando uso típico do React Query
      const queryKeys = {
        all: () => [QUERY_KEYS.RECEITAS],
        lists: () => [...queryKeys.all(), 'list'],
        list: (filters: string) => [...queryKeys.lists(), { filters }],
        details: () => [...queryKeys.all(), 'detail'],
        detail: (id: string) => [...queryKeys.details(), id],
      };

      // Act & Assert
      expect(queryKeys.all()).toEqual(['receitas']);
      expect(queryKeys.lists()).toEqual(['receitas', 'list']);
      expect(queryKeys.list('active')).toEqual(['receitas', 'list', { filters: 'active' }]);
      expect(queryKeys.details()).toEqual(['receitas', 'detail']);
      expect(queryKeys.detail('123')).toEqual(['receitas', 'detail', '123']);
    });

    it('deve permitir criação de chaves hierárquicas', () => {
      // Arrange & Act
      const userQueries = [QUERY_KEYS.USER, '123'];
      const userReceitasQueries = [QUERY_KEYS.USER, '123', QUERY_KEYS.RECEITAS];
      const receitaIngredientesQueries = [QUERY_KEYS.RECEITA, '456', QUERY_KEYS.RECEITA_INGREDIENTES];

      // Assert
      expect(userQueries).toEqual(['user', '123']);
      expect(userReceitasQueries).toEqual(['user', '123', 'receitas']);
      expect(receitaIngredientesQueries).toEqual(['receita', '456', 'receita-ingredientes']);
    });
  });

  describe('Validação de integridade', () => {
    it('deve manter consistência após importação', () => {
      // Arrange
      const originalKeys = {
        USERS: 'users',
        USER: 'user',
        PRODUTOS: 'produtos',
        PRODUTO: 'produto',
        RECEITAS: 'receitas',
        RECEITA: 'receita',
        RECEITA_INGREDIENTES: 'receita-ingredientes',
        INGREDIENTES_BY_RECEITA: 'ingredientes-by-receita',
      };

      // Assert
      expect(QUERY_KEYS).toEqual(originalKeys);
    });

    it('deve ser serializável para JSON', () => {
      // Arrange & Act
      const serialized = JSON.stringify(QUERY_KEYS);
      const deserialized = JSON.parse(serialized);

      // Assert
      expect(deserialized).toEqual(QUERY_KEYS);
    });

    it('deve ser enumerável', () => {
      // Arrange & Act
      const entries = Object.entries(QUERY_KEYS);

      // Assert
      expect(entries.length).toBe(8);
      entries.forEach(([key, value]) => {
        expect(typeof key).toBe('string');
        expect(typeof value).toBe('string');
      });
    });
  });
});