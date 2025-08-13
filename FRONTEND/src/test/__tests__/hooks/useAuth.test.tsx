import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth } from '../../../hooks/useAuth';
import { AuthContext } from '../../../contexts/AuthContextDefinition';
import { mockAuthenticatedUser } from '../../utils/test-utils';
import type { AuthContextType } from '../../../types';

// Mock do contexto de autenticação
const mockAuthContext: AuthContextType = {
  user: mockAuthenticatedUser,
  isAuthenticated: true,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
};

const mockAuthContextUnauthenticated: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
};

const mockAuthContextLoading: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
};

// Wrapper para fornecer contexto nos testes
const createWrapper = (contextValue: AuthContextType) => {
  return ({ children }: { children: React.ReactNode }) => (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

describe('useAuth', () => {
  describe('quando usado dentro do AuthProvider', () => {
    it('deve retornar o contexto de autenticação quando usuário está autenticado', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(mockAuthContext),
      });

      // Assert
      expect(result.current).toEqual(mockAuthContext);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockAuthenticatedUser);
      expect(result.current.isLoading).toBe(false);
    });

    it('deve retornar o contexto quando usuário não está autenticado', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(mockAuthContextUnauthenticated),
      });

      // Assert
      expect(result.current).toEqual(mockAuthContextUnauthenticated);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('deve retornar o contexto quando está carregando', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(mockAuthContextLoading),
      });

      // Assert
      expect(result.current).toEqual(mockAuthContextLoading);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.isLoading).toBe(true);
    });

    it('deve fornecer todas as funções do contexto', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(mockAuthContext),
      });

      // Assert
      expect(typeof result.current.login).toBe('function');
      expect(typeof result.current.logout).toBe('function');
      expect(typeof result.current.register).toBe('function');
      expect(typeof result.current.forgotPassword).toBe('function');
      expect(typeof result.current.resetPassword).toBe('function');
    });
  });

  describe('quando usado fora do AuthProvider', () => {
    it('deve lançar erro quando usado fora do provider', () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Act & Assert
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      // Cleanup
      consoleSpy.mockRestore();
    });

    it('deve lançar erro quando contexto é undefined', () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const UndefinedWrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContext.Provider value={undefined as any}>
          {children}
        </AuthContext.Provider>
      );

      // Act & Assert
      expect(() => {
        renderHook(() => useAuth(), { wrapper: UndefinedWrapper });
      }).toThrow('useAuth must be used within an AuthProvider');

      // Cleanup
      consoleSpy.mockRestore();
    });
  });

  describe('integração com funções do contexto', () => {
    it('deve permitir chamar login através do hook', () => {
      // Arrange
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(mockAuthContext),
      });

      // Act
      result.current.login({ email: 'test@test.com', password: 'password' });

      // Assert
      expect(mockAuthContext.login).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password',
      });
    });

    it('deve permitir chamar logout através do hook', () => {
      // Arrange
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(mockAuthContext),
      });

      // Act
      result.current.logout();

      // Assert
      expect(mockAuthContext.logout).toHaveBeenCalled();
    });

    it('deve permitir chamar register através do hook', () => {
      // Arrange
      const registerData = {
        username: 'Test User',
        email: 'test@test.com',
        password: 'password',
      };
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(mockAuthContext),
      });

      // Act
      result.current.register(registerData);

      // Assert
      expect(mockAuthContext.register).toHaveBeenCalledWith(registerData);
    });

    it('deve permitir chamar forgotPassword através do hook', () => {
      // Arrange
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(mockAuthContext),
      });

      // Act
      result.current.forgotPassword({ email: 'test@test.com' });

      // Assert
      expect(mockAuthContext.forgotPassword).toHaveBeenCalledWith({
        email: 'test@test.com',
      });
    });

    it('deve permitir chamar resetPassword através do hook', () => {
      // Arrange
      const resetData = {
        token: 'reset-token',
        password: 'new-password',
      };
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(mockAuthContext),
      });

      // Act
      result.current.resetPassword(resetData);

      // Assert
      expect(mockAuthContext.resetPassword).toHaveBeenCalledWith(resetData);
    });
  });
});