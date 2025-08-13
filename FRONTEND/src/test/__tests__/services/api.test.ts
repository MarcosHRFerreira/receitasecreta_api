import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { apiService } from '../../../services/api';
import type {
  UserAuthRequest,
  UserRequest,
  ProdutoRequest,
  ReceitaRequest,
  ReceitaIngredienteRequest,
  ReceitaIngredienteDeleteRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthResponse,
  User,
  Produto,
  Receita,
  ReceitaIngrediente,
  PageResponse,
  PageRequest,
  TokenValidationResponse,
} from '../../../types';
import { mockLocalStorage } from '../../utils/test-utils';

// Mock do axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

// Mock do localStorage
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock do console para evitar logs nos testes
const consoleSpy = {
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
  warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
};

// Dados de teste
const mockAuthResponse: AuthResponse = {
  token: 'mock-jwt-token',
  user: {
    id: '1',
    username: 'Test User',
    email: 'test@test.com',
    role: 'USER',
  },
};

const mockUser: User = {
  id: '1',
  username: 'Test User',
  email: 'test@test.com',
  role: 'USER',
};

const mockProduto: Produto = {
  id: '1',
  nome: 'Produto Teste',
  categoria: 'PROTEINA',
  unidadeMedida: 'kg',
};

const mockReceita: Receita = {
  id: '1',
  nome: 'Receita Teste',
  descricao: 'Descrição da receita',
  modoPreparo: 'Modo de preparo',
  tempoPreparo: 30,
  porcoes: 4,
  userId: '1',
};

const mockReceitaIngrediente: ReceitaIngrediente = {
  receitaId: '1',
  produtoId: '1',
  quantidade: 2,
  produto: mockProduto,
};

const mockPageResponse: PageResponse<any> = {
  content: [],
  totalElements: 0,
  totalPages: 1,
  size: 10,
  number: 0,
  first: true,
  last: true,
};

// Mock da instância do axios
const mockAxiosInstance = {
  create: vi.fn(() => mockAxiosInstance),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: {
      use: vi.fn(),
    },
    response: {
      use: vi.fn(),
    },
  },
};

describe('ApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    
    // Configurar mock do axios.create
    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Configuração e Interceptors', () => {
    it('deve criar instância do axios com configurações corretas', () => {
      // Act - A instância é criada na importação do módulo
      
      // Assert
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:8082/receitasecreta',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('deve configurar interceptors de request e response', () => {
      // Assert
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });

    describe('Request Interceptor', () => {
      it('deve adicionar token ao header quando disponível', () => {
        // Arrange
        const token = 'mock-token';
        mockLocalStorage.getItem.mockReturnValue(token);
        const config = { headers: {}, url: '/test', method: 'get' };
        
        // Obter o interceptor de request
        const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
        
        // Act
        const result = requestInterceptor(config);
        
        // Assert
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('token');
        expect(result.headers.Authorization).toBe(`Bearer ${token}`);
        expect(consoleSpy.log).toHaveBeenCalledWith(
          expect.stringContaining('Token adicionado ao cabeçalho')
        );
      });

      it('não deve adicionar token quando não disponível', () => {
        // Arrange
        mockLocalStorage.getItem.mockReturnValue(null);
        const config = { headers: {}, url: '/test', method: 'get' };
        
        // Obter o interceptor de request
        const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
        
        // Act
        const result = requestInterceptor(config);
        
        // Assert
        expect(result.headers.Authorization).toBeUndefined();
        expect(consoleSpy.log).toHaveBeenCalledWith(
          expect.stringContaining('Nenhum token encontrado')
        );
      });
    });

    describe('Response Interceptor', () => {
      it('deve lidar com resposta de sucesso', () => {
        // Arrange
        const response = {
          config: { url: '/test', method: 'get' },
          status: 200,
          statusText: 'OK',
          data: { success: true },
        };
        
        // Obter o interceptor de response
        const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][0];
        
        // Act
        const result = responseInterceptor(response);
        
        // Assert
        expect(result).toBe(response);
        expect(consoleSpy.log).toHaveBeenCalledWith(
          expect.stringContaining('Resposta recebida'),
          expect.any(Object)
        );
      });

      it('deve lidar com erro 401 e limpar localStorage', () => {
        // Arrange
        const error = {
          config: { url: '/test', method: 'get' },
          response: { status: 401, statusText: 'Unauthorized' },
          message: 'Unauthorized',
        };
        
        // Obter o interceptor de erro
        const errorInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
        
        // Act & Assert
        expect(() => errorInterceptor(error)).rejects.toEqual(error);
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
        expect(consoleSpy.warn).toHaveBeenCalledWith(
          expect.stringContaining('Token expirado ou inválido')
        );
      });

      it('deve lidar com outros erros sem limpar localStorage', () => {
        // Arrange
        const error = {
          config: { url: '/test', method: 'get' },
          response: { status: 500, statusText: 'Internal Server Error' },
          message: 'Server Error',
        };
        
        // Obter o interceptor de erro
        const errorInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
        
        // Act & Assert
        expect(() => errorInterceptor(error)).rejects.toEqual(error);
        expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
      });
    });
  });

  describe('Métodos de Autenticação', () => {
    describe('login', () => {
      it('deve fazer login com sucesso', async () => {
        // Arrange
        const credentials: UserAuthRequest = {
          login: 'test@test.com',
          password: 'password123',
        };
        mockAxiosInstance.post.mockResolvedValue({ data: mockAuthResponse });

        // Act
        const result = await apiService.login(credentials);

        // Assert
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/login', credentials);
        expect(result).toEqual(mockAuthResponse);
        expect(consoleSpy.log).toHaveBeenCalledWith(
          expect.stringContaining('Executando login'),
          expect.any(Object)
        );
        expect(consoleSpy.log).toHaveBeenCalledWith(
          expect.stringContaining('Login bem-sucedido'),
          expect.any(Object)
        );
      });

      it('deve lidar com erro de login', async () => {
        // Arrange
        const credentials: UserAuthRequest = {
          login: 'test@test.com',
          password: 'wrong-password',
        };
        const error = new Error('Invalid credentials');
        mockAxiosInstance.post.mockRejectedValue(error);

        // Act & Assert
        await expect(apiService.login(credentials)).rejects.toThrow('Invalid credentials');
        expect(consoleSpy.error).toHaveBeenCalledWith(
          expect.stringContaining('Erro no login'),
          error
        );
      });
    });

    describe('register', () => {
      it('deve registrar usuário com sucesso', async () => {
        // Arrange
        const userData: UserRequest = {
          username: 'Test User',
          email: 'test@test.com',
          password: 'password123',
          login: 'test@test.com',
        };
        mockAxiosInstance.post.mockResolvedValue({ data: mockAuthResponse });

        // Act
        const result = await apiService.register(userData);

        // Assert
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/register', userData);
        expect(result).toEqual(mockAuthResponse);
        expect(consoleSpy.log).toHaveBeenCalledWith(
          expect.stringContaining('Executando registro'),
          expect.any(Object)
        );
      });

      it('deve lidar com erro de registro', async () => {
        // Arrange
        const userData: UserRequest = {
          username: 'Test User',
          email: 'invalid-email',
          password: 'weak',
          login: 'invalid-email',
        };
        const error = new Error('Invalid user data');
        mockAxiosInstance.post.mockRejectedValue(error);

        // Act & Assert
        await expect(apiService.register(userData)).rejects.toThrow('Invalid user data');
        expect(consoleSpy.error).toHaveBeenCalledWith(
          expect.stringContaining('Erro no registro'),
          error
        );
      });
    });

    describe('forgotPassword', () => {
      it('deve solicitar recuperação de senha com sucesso', async () => {
        // Arrange
        const data: ForgotPasswordRequest = { email: 'test@test.com' };
        mockAxiosInstance.post.mockResolvedValue({ data: { message: 'Email sent' } });

        // Act
        await apiService.forgotPassword(data);

        // Assert
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/forgot-password', data);
        expect(consoleSpy.log).toHaveBeenCalledWith(
          expect.stringContaining('Solicitando recuperação de senha'),
          data.email
        );
      });
    });

    describe('resetPassword', () => {
      it('deve redefinir senha com sucesso', async () => {
        // Arrange
        const data: ResetPasswordRequest = {
          token: 'reset-token',
          newPassword: 'new-password',
        };
        mockAxiosInstance.post.mockResolvedValue({ data: { message: 'Password reset' } });

        // Act
        await apiService.resetPassword(data);

        // Assert
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/reset-password', {
          token: data.token,
          newPassword: data.newPassword,
        });
      });
    });

    describe('validateResetToken', () => {
      it('deve validar token de reset com sucesso', async () => {
        // Arrange
        const token = 'valid-token';
        const validationResponse: TokenValidationResponse = { valid: true };
        mockAxiosInstance.get.mockResolvedValue({ data: validationResponse });

        // Act
        const result = await apiService.validateResetToken(token);

        // Assert
        expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/auth/validate-reset-token/${token}`);
        expect(result).toEqual(validationResponse);
      });
    });
  });

  describe('Métodos de Usuários', () => {
    describe('getUsers', () => {
      it('deve buscar lista de usuários e converter para formato paginado', async () => {
        // Arrange
        const users = [mockUser];
        const params: PageRequest = { page: 0, size: 10 };
        mockAxiosInstance.get.mockResolvedValue({ data: users });

        // Act
        const result = await apiService.getUsers(params);

        // Assert
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users', { params });
        expect(result).toEqual({
          content: users,
          totalElements: users.length,
          totalPages: 1,
          size: users.length,
          number: 0,
          first: true,
          last: true,
        });
      });
    });

    describe('getUserById', () => {
      it('deve buscar usuário por ID', async () => {
        // Arrange
        mockAxiosInstance.get.mockResolvedValue({ data: mockUser });

        // Act
        const result = await apiService.getUserById('1');

        // Assert
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/1');
        expect(result).toEqual(mockUser);
      });
    });

    describe('deleteUser', () => {
      it('deve deletar usuário', async () => {
        // Arrange
        mockAxiosInstance.delete.mockResolvedValue({});

        // Act
        await apiService.deleteUser('1');

        // Assert
        expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/users/1');
      });
    });
  });

  describe('Métodos de Produtos', () => {
    describe('getProdutos', () => {
      it('deve buscar lista de produtos', async () => {
        // Arrange
        const pageResponse = { ...mockPageResponse, content: [mockProduto] };
        mockAxiosInstance.get.mockResolvedValue({ data: pageResponse });

        // Act
        const result = await apiService.getProdutos();

        // Assert
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/produtos', { params: undefined });
        expect(result).toEqual(pageResponse);
      });
    });

    describe('createProduto', () => {
      it('deve criar produto', async () => {
        // Arrange
        const produtoData: ProdutoRequest = {
          nome: 'Novo Produto',
          categoria: 'PROTEINA',
          unidadeMedida: 'kg',
        };
        mockAxiosInstance.post.mockResolvedValue({ data: mockProduto });

        // Act
        const result = await apiService.createProduto(produtoData);

        // Assert
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/produtos', produtoData);
        expect(result).toEqual(mockProduto);
      });
    });

    describe('updateProduto', () => {
      it('deve atualizar produto', async () => {
        // Arrange
        const updateData = { nome: 'Produto Atualizado' };
        mockAxiosInstance.put.mockResolvedValue({ data: mockProduto });

        // Act
        const result = await apiService.updateProduto('1', updateData);

        // Assert
        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/produtos/1', updateData);
        expect(result).toEqual(mockProduto);
      });
    });
  });

  describe('Métodos de Receitas', () => {
    describe('getReceitas', () => {
      it('deve buscar lista de receitas', async () => {
        // Arrange
        const pageResponse = { ...mockPageResponse, content: [mockReceita] };
        mockAxiosInstance.get.mockResolvedValue({ data: pageResponse });

        // Act
        const result = await apiService.getReceitas();

        // Assert
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/receitas', { params: undefined });
        expect(result).toEqual(pageResponse);
      });
    });

    describe('createReceita', () => {
      it('deve criar receita', async () => {
        // Arrange
        const receitaData: ReceitaRequest = {
          nome: 'Nova Receita',
          descricao: 'Descrição',
          modoPreparo: 'Modo de preparo',
          tempoPreparo: 30,
          porcoes: 4,
        };
        mockAxiosInstance.post.mockResolvedValue({ data: mockReceita });

        // Act
        const result = await apiService.createReceita(receitaData);

        // Assert
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/receitas', receitaData);
        expect(result).toEqual(mockReceita);
      });
    });
  });

  describe('Métodos de Receita Ingredientes', () => {
    describe('getIngredientesByReceita', () => {
      it('deve buscar ingredientes por receita', async () => {
        // Arrange
        const ingredientes = [mockReceitaIngrediente];
        mockAxiosInstance.get.mockResolvedValue({ data: ingredientes });

        // Act
        const result = await apiService.getIngredientesByReceita('1');

        // Assert
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/receitasingredientes/receita/1');
        expect(result).toEqual(ingredientes);
      });
    });

    describe('createReceitaIngrediente', () => {
      it('deve criar ingrediente de receita', async () => {
        // Arrange
        const ingredienteData: ReceitaIngredienteRequest = {
          receitaId: '1',
          produtoId: '1',
          quantidade: 2,
        };
        mockAxiosInstance.post.mockResolvedValue({ data: mockReceitaIngrediente });

        // Act
        const result = await apiService.createReceitaIngrediente(ingredienteData);

        // Assert
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/receitasingredientes', ingredienteData);
        expect(result).toEqual(mockReceitaIngrediente);
      });
    });

    describe('deleteReceitaIngrediente', () => {
      it('deve deletar ingrediente de receita', async () => {
        // Arrange
        const deleteData: ReceitaIngredienteDeleteRequest = {
          receitaId: '1',
          produtoId: '1',
        };
        mockAxiosInstance.delete.mockResolvedValue({});

        // Act
        await apiService.deleteReceitaIngrediente(deleteData);

        // Assert
        expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/receitasingredientes', { data: deleteData });
      });
    });
  });
});