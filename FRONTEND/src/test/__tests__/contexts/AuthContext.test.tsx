import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../../../contexts/AuthContext';
import { useAuth } from '../../../hooks/useAuth';
import { apiService } from '../../../services/api';
import type { UserAuthRequest, UserRequest, AuthResponse, User } from '../../../types';
import { mockLocalStorage } from '../../utils/test-utils';

// Mock do apiService
vi.mock('../../../services/api', () => ({
  apiService: {
    login: vi.fn(),
    register: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    validateResetToken: vi.fn(),
  },
}));

const mockedApiService = vi.mocked(apiService);

// Mock do localStorage
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock do console para evitar logs nos testes
const consoleSpy = {
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
};

// Dados de teste
const mockUser: User = {
  id: '1',
  username: 'Test User',
  email: 'test@test.com',
  role: 'USER',
};

const mockAuthResponse: AuthResponse = {
  token: 'mock-jwt-token',
  user: mockUser,
};

const mockCredentials: UserAuthRequest = {
  login: 'test@test.com',
  password: 'password123',
};

const mockUserData: UserRequest = {
  username: 'Test User',
  email: 'test@test.com',
  password: 'password123',
  login: 'test@test.com',
};

// Componente de teste para acessar o contexto
const TestComponent = () => {
  const {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
  } = useAuth();

  return (
    <div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
      <div data-testid="token">{token || 'null'}</div>
      <div data-testid="isLoading">{isLoading.toString()}</div>
      <div data-testid="isAuthenticated">{isAuthenticated.toString()}</div>
      <button
        data-testid="login-btn"
        onClick={() => login(mockCredentials)}
      >
        Login
      </button>
      <button
        data-testid="register-btn"
        onClick={() => register(mockUserData)}
      >
        Register
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

const renderWithAuthProvider = () => {
  return render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    
    // Resetar mocks do apiService
    mockedApiService.login.mockReset();
    mockedApiService.register.mockReset();
    mockedApiService.forgotPassword.mockReset();
    mockedApiService.resetPassword.mockReset();
    mockedApiService.validateResetToken.mockReset();
    
    // Configurar mocks padrão
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Inicialização', () => {
    it('deve inicializar com estado padrão quando não há dados no localStorage', async () => {
      // Arrange
      mockLocalStorage.getItem.mockReturnValue(null);

      // Act
      renderWithAuthProvider();

      // Assert - Estado inicial
      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('token')).toHaveTextContent('null');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      
      // Aguardar o loading terminar
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('token');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('user');
    });

    it('deve restaurar autenticação do localStorage quando dados válidos estão disponíveis', async () => {
      // Arrange
      const savedToken = 'saved-token';
      const savedUser = JSON.stringify(mockUser);
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'token') return savedToken;
        if (key === 'user') return savedUser;
        return null;
      });

      // Act
      renderWithAuthProvider();

      // Assert - Aguardar restauração
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
      expect(screen.getByTestId('token')).toHaveTextContent(savedToken);
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
    });

    it('deve limpar dados corrompidos do localStorage', async () => {
      // Arrange
      const savedToken = 'saved-token';
      const corruptedUser = 'invalid-json';
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'token') return savedToken;
        if (key === 'user') return corruptedUser;
        return null;
      });

      // Act
      renderWithAuthProvider();

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('token')).toHaveTextContent('null');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    });

    it('deve ignorar dados inválidos do localStorage (undefined/null strings)', async () => {
      // Arrange
      const savedToken = 'saved-token';
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'token') return savedToken;
        if (key === 'user') return 'undefined';
        return null;
      });

      // Act
      renderWithAuthProvider();

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('token')).toHaveTextContent('null');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    });
  });

  describe('Login', () => {
    it('deve fazer login com sucesso', async () => {
      // Arrange
      const user = userEvent.setup();
      mockedApiService.login.mockResolvedValue(mockAuthResponse);
      renderWithAuthProvider();

      // Aguardar inicialização
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      // Act
      await act(async () => {
        await user.click(screen.getByTestId('login-btn'));
      });

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
        expect(screen.getByTestId('token')).toHaveTextContent(mockAuthResponse.token);
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      expect(mockedApiService.login).toHaveBeenCalledWith(mockCredentials);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', mockAuthResponse.token);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
    });

    it.skip('deve lidar com erro de login', async () => {
      // Arrange
      const user = userEvent.setup();
      const loginError = new Error('Invalid credentials');
      mockedApiService.login.mockRejectedValue(loginError);
      renderWithAuthProvider();

      // Aguardar inicialização
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      // Act & Assert
      await act(async () => {
        await user.click(screen.getByTestId('login-btn'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('token')).toHaveTextContent('null');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('Erro durante o login'),
        expect.any(Object)
      );
    });

    it('deve definir isLoading durante o processo de login', async () => {
      // Arrange
      const user = userEvent.setup();
      let resolveLogin: (value: AuthResponse) => void;
      const loginPromise = new Promise<AuthResponse>((resolve) => {
        resolveLogin = resolve;
      });
      mockedApiService.login.mockReturnValue(loginPromise);
      renderWithAuthProvider();

      // Aguardar inicialização
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      // Act - Iniciar login
      await act(async () => {
        await user.click(screen.getByTestId('login-btn'));
      });

      // Assert - Loading deve estar true
      expect(screen.getByTestId('isLoading')).toHaveTextContent('true');

      // Act - Resolver login
      await act(async () => {
        resolveLogin!(mockAuthResponse);
      });

      // Assert - Loading deve voltar para false
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });
    });
  });

  describe('Register', () => {
    it('deve registrar usuário com sucesso', async () => {
      // Arrange
      const user = userEvent.setup();
      mockedApiService.register.mockResolvedValue(mockAuthResponse);
      renderWithAuthProvider();

      // Aguardar inicialização
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      // Act
      await act(async () => {
        await user.click(screen.getByTestId('register-btn'));
      });

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
        expect(screen.getByTestId('token')).toHaveTextContent(mockAuthResponse.token);
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      expect(mockedApiService.register).toHaveBeenCalledWith(mockUserData);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', mockAuthResponse.token);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
    });

    it.skip('deve lidar com erro de registro', async () => {
      // Arrange
      const user = userEvent.setup();
      const registerError = new Error('Registration failed');
      
      // Configurar mock antes de renderizar
      mockedApiService.register.mockImplementation(() => Promise.reject(registerError));
      
      renderWithAuthProvider();

      // Aguardar inicialização
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      // Act & Assert
      await act(async () => {
        await user.click(screen.getByTestId('register-btn'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('token')).toHaveTextContent('null');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('Erro no registro'),
        registerError
      );
    });
  });

  describe('Logout', () => {
    it('deve fazer logout e limpar estado', async () => {
      // Arrange
      const user = userEvent.setup();
      const savedToken = 'saved-token';
      const savedUser = JSON.stringify(mockUser);
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'token') return savedToken;
        if (key === 'user') return savedUser;
        return null;
      });

      renderWithAuthProvider();

      // Aguardar restauração da autenticação
      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      });

      // Act
      await act(async () => {
        await user.click(screen.getByTestId('logout-btn'));
      });

      // Assert
      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('token')).toHaveTextContent('null');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('Gerenciamento de Estado', () => {
    it('deve calcular isAuthenticated corretamente', async () => {
      // Arrange
      renderWithAuthProvider();

      // Assert - Estado inicial
      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      });

      // Act - Simular login
      const user = userEvent.setup();
      mockedApiService.login.mockResolvedValue(mockAuthResponse);
      
      await act(async () => {
        await user.click(screen.getByTestId('login-btn'));
      });

      // Assert - Após login
      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      });

      // Act - Logout
      await act(async () => {
        await user.click(screen.getByTestId('logout-btn'));
      });

      // Assert - Após logout
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    });

    it('deve detectar mudanças no localStorage e atualizar estado', async () => {
      // Arrange
      const savedToken = 'saved-token';
      const savedUser = JSON.stringify(mockUser);
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'token') return savedToken;
        if (key === 'user') return savedUser;
        return null;
      });

      renderWithAuthProvider();

      // Aguardar restauração
      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      });

      // Act - Simular remoção do token externamente
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'token') return null;
        if (key === 'user') return savedUser;
        return null;
      });

      // Aguardar detecção da mudança (o intervalo é de 1000ms)
      await waitFor(
        () => {
          expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
        },
        { timeout: 2000 }
      );

      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('token')).toHaveTextContent('null');
    });
  });

  describe('Logs de Debug', () => {
    it('deve registrar logs durante inicialização', async () => {
      // Arrange & Act
      renderWithAuthProvider();

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('Inicializando autenticação')
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('Dados do localStorage'),
        expect.any(Object)
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('Inicialização da autenticação concluída')
      );
    });

    it('deve registrar logs durante login', async () => {
      // Arrange
      const user = userEvent.setup();
      mockedApiService.login.mockResolvedValue(mockAuthResponse);
      renderWithAuthProvider();

      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      // Act
      await act(async () => {
        await user.click(screen.getByTestId('login-btn'));
      });

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      });

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('Iniciando processo de login'),
        expect.any(Object)
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('Login realizado com sucesso')
      );
    });
  });
});