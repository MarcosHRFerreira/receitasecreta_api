import { describe, it, expect } from 'vitest';
import { cn } from '../../../utils/cn';

describe('cn utility', () => {
  describe('Combinação básica de classes', () => {
    it('deve combinar múltiplas classes CSS', () => {
      // Arrange & Act
      const result = cn('base-class', 'additional-class', 'third-class');

      // Assert
      expect(result).toBe('base-class additional-class third-class');
    });

    it('deve combinar uma única classe', () => {
      // Arrange & Act
      const result = cn('single-class');

      // Assert
      expect(result).toBe('single-class');
    });

    it('deve retornar string vazia quando não há argumentos', () => {
      // Arrange & Act
      const result = cn();

      // Assert
      expect(result).toBe('');
    });
  });

  describe('Valores condicionais', () => {
    it('deve incluir classes quando condição é verdadeira', () => {
      // Arrange & Act
      const result = cn('base', true && 'conditional-true', 'always');

      // Assert
      expect(result).toBe('base conditional-true always');
    });

    it('deve excluir classes quando condição é falsa', () => {
      // Arrange & Act
      const result = cn('base', false && 'conditional-false', 'always');

      // Assert
      expect(result).toBe('base always');
    });

    it('deve lidar com múltiplas condições', () => {
      // Arrange
      const isActive = true;
      const isDisabled = false;
      const hasError = true;

      // Act
      const result = cn(
        'btn',
        isActive && 'btn-active',
        isDisabled && 'btn-disabled',
        hasError && 'btn-error'
      );

      // Assert
      expect(result).toBe('btn btn-active btn-error');
    });
  });

  describe('Valores falsy', () => {
    it('deve ignorar valores null', () => {
      // Arrange & Act
      const result = cn('base', null, 'end');

      // Assert
      expect(result).toBe('base end');
    });

    it('deve ignorar valores undefined', () => {
      // Arrange & Act
      const result = cn('base', undefined, 'end');

      // Assert
      expect(result).toBe('base end');
    });

    it('deve ignorar strings vazias', () => {
      // Arrange & Act
      const result = cn('base', '', 'end');

      // Assert
      expect(result).toBe('base end');
    });

    it('deve ignorar valores 0', () => {
      // Arrange & Act
      const result = cn('base', 0, 'end');

      // Assert
      expect(result).toBe('base end');
    });

    it('deve ignorar false', () => {
      // Arrange & Act
      const result = cn('base', false, 'end');

      // Assert
      expect(result).toBe('base end');
    });
  });

  describe('Arrays e objetos', () => {
    it('deve processar arrays de classes', () => {
      // Arrange & Act
      const result = cn(['class1', 'class2'], 'class3');

      // Assert
      expect(result).toBe('class1 class2 class3');
    });

    it('deve processar objetos com condições', () => {
      // Arrange & Act
      const result = cn({
        'active': true,
        'disabled': false,
        'error': true
      });

      // Assert
      expect(result).toBe('active error');
    });

    it('deve combinar arrays, objetos e strings', () => {
      // Arrange & Act
      const result = cn(
        'base',
        ['array1', 'array2'],
        { 'obj-true': true, 'obj-false': false },
        'end'
      );

      // Assert
      expect(result).toBe('base array1 array2 obj-true end');
    });
  });

  describe('Tailwind CSS merge', () => {
    it('deve fazer merge de classes conflitantes do Tailwind', () => {
      // Arrange & Act
      const result = cn('px-2 py-1 px-3');

      // Assert
      // tailwind-merge deve manter apenas o último px-3
      expect(result).toBe('py-1 px-3');
    });

    it('deve fazer merge de classes de cor conflitantes', () => {
      // Arrange & Act
      const result = cn('text-red-500 text-blue-600');

      // Assert
      // tailwind-merge deve manter apenas o último text-blue-600
      expect(result).toBe('text-blue-600');
    });

    it('deve fazer merge de classes de tamanho conflitantes', () => {
      // Arrange & Act
      const result = cn('w-4 h-4 w-6 h-6');

      // Assert
      // tailwind-merge deve manter apenas os últimos w-6 h-6
      expect(result).toBe('w-6 h-6');
    });

    it('deve preservar classes não conflitantes', () => {
      // Arrange & Act
      const result = cn('flex items-center justify-between px-4 py-2');

      // Assert
      expect(result).toBe('flex items-center justify-between px-4 py-2');
    });

    it('deve fazer merge complexo com condicionais', () => {
      // Arrange
      const isLarge = true;
      const isPrimary = false;

      // Act
      const result = cn(
        'btn px-2 py-1',
        isLarge && 'px-4 py-2',
        isPrimary ? 'bg-blue-500' : 'bg-gray-500'
      );

      // Assert
      // tailwind-merge deve resolver conflitos de padding
      expect(result).toBe('btn px-4 py-2 bg-gray-500');
    });
  });

  describe('Casos edge', () => {
    it('deve lidar com argumentos mistos complexos', () => {
      // Arrange & Act
      const result = cn(
        'base',
        null,
        undefined,
        false && 'hidden',
        true && 'visible',
        ['array-class'],
        { 'obj-class': true },
        '',
        'end'
      );

      // Assert
      expect(result).toBe('base visible array-class obj-class end');
    });

    it('deve lidar com classes duplicadas', () => {
      // Arrange & Act
      const result = cn('duplicate', 'other', 'duplicate');

      // Assert
      expect(result).toBe('duplicate other duplicate');
    });

    it('deve lidar com espaços extras', () => {
      // Arrange & Act
      const result = cn('  spaced  ', '  class  ');

      // Assert
      expect(result).toBe('spaced class');
    });

    it('deve funcionar com números como strings', () => {
      // Arrange & Act
      const result = cn('w-4', '8', 'h-6');

      // Assert
      expect(result).toBe('w-4 8 h-6');
    });
  });

  describe('Performance e tipos', () => {
    it('deve aceitar diferentes tipos de ClassValue', () => {
      // Arrange
      const stringClass = 'string-class';
      const arrayClass = ['array', 'class'];
      const objectClass = { 'object-class': true };
      const conditionalClass = true && 'conditional';

      // Act
      const result = cn(stringClass, arrayClass, objectClass, conditionalClass);

      // Assert
      expect(result).toBe('string-class array class object-class conditional');
    });

    it('deve retornar string para qualquer combinação válida', () => {
      // Arrange & Act
      const result = cn('test');

      // Assert
      expect(typeof result).toBe('string');
    });
  });
});