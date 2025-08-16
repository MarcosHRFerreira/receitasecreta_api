import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosProgressEvent, AxiosError } from 'axios';
import type {
  User,
  Produto,
  Receita,
  ReceitaIngrediente
} from '../types';
import type {
  UserAuthRequest,
  UserRequest,
  ProdutoRequest,
  ReceitaRequest,
  ReceitaIngredienteRequest,
  ReceitaIngredienteDeleteRequest,
  AuthResponse,
  PageResponse,
  PageRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  TokenValidationResponse,
  ReceitaImagemResponseDto,
  ReceitaImagemUpdateDto,
  ImagemEstatisticasDto,
  ImageConfigDto,
  ImagemOrdemDto
} from '../types';

const BASE_URL = 'http://localhost:8082/receitasecreta';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token de autenticação
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        console.log('🌐 [API] Interceptor de requisição:', {
          url: config.url,
          method: config.method?.toUpperCase(),
          hasToken: !!token,
          tokenLength: token?.length
        });
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🌐 [API] Token adicionado ao cabeçalho da requisição.');
        } else {
          console.log('🌐 [API] Nenhum token encontrado para adicionar à requisição.');
        }
        return config;
      },
      (error) => {
        console.error('🌐 [API] Erro no interceptor de requisição:', error);
        return Promise.reject(error);
      }
    );

    // Interceptor para tratar respostas e erros
    this.api.interceptors.response.use(
      (response) => {
        console.log('🌐 [API] Resposta recebida:', {
          url: response.config.url,
          method: response.config.method?.toUpperCase(),
          status: response.status,
          statusText: response.statusText,
          hasData: !!response.data
        });
        return response;
      },
      (error) => {
        console.error('🌐 [API] Erro na resposta:', {
          url: error.config?.url,
          method: error.config?.method?.toUpperCase(),
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: error.message,
          responseData: error.response?.data
        });
        
        if (error.response?.status === 401) {
          console.warn('🌐 [API] Token expirado ou inválido (401). Limpando localStorage...');
          // Token expirado ou inválido - apenas limpar localStorage
          // O redirecionamento será tratado pelo AuthContext
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          console.log('🌐 [API] Dados de autenticação removidos do localStorage.');
          // Não fazer redirecionamento forçado aqui para evitar conflitos
        }
        return Promise.reject(error);
      }
    );
  }

  // Métodos de autenticação
  async login(credentials: UserAuthRequest): Promise<AuthResponse> {
    console.log('🌐 [API] Executando login:', { login: credentials.login });
    try {
      const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', credentials);
      console.log('🌐 [API] Login bem-sucedido:', {
        hasToken: !!response.data.token,
        tokenLength: response.data.token?.length,
        userId: response.data.user?.id,
        username: response.data.user?.username
      });
      return response.data;
    } catch (error) {
      console.error('🌐 [API] Erro no login:', error);
      throw error;
    }
  }

  async register(userData: UserRequest): Promise<AuthResponse> {
    console.log('🌐 [API] Executando registro:', { login: userData.login });
    try {
      const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register', userData);
      console.log('🌐 [API] Registro bem-sucedido:', {
        hasToken: !!response.data.token,
        tokenLength: response.data.token?.length,
        userId: response.data.user?.id,
        login: response.data.user?.username
      });
      return response.data;
    } catch (error) {
      console.error('🌐 [API] Erro no registro:', error);
      throw error;
    }
  }

  // Métodos de usuários
  async getUsers(params?: PageRequest): Promise<PageResponse<User>> {
    const response: AxiosResponse<User[]> = await this.api.get('/users', { params });
    // Converter resposta simples para formato paginado
    const users = response.data;
    return {
      content: users,
      totalElements: users.length,
      totalPages: 1,
      size: users.length,
      number: 0,
      first: true,
      last: true
    };
  }

  async getUserById(id: string): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get(`/users/${id}`);
    return response.data;
  }

  async createUser(userData: UserRequest): Promise<User> {
    const response: AxiosResponse<User> = await this.api.post('/users', userData);
    return response.data;
  }

  async updateUser(id: string, userData: Partial<UserRequest>): Promise<User> {
    const response: AxiosResponse<User> = await this.api.put(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.api.delete(`/users/${id}`);
  }

  // Métodos de produtos
  async getProdutos(params?: PageRequest): Promise<PageResponse<Produto>> {
    const response: AxiosResponse<PageResponse<Produto>> = await this.api.get('/produtos', { params });
    return response.data;
  }

  async getProdutoById(id: string): Promise<Produto> {
    const response: AxiosResponse<Produto> = await this.api.get(`/produtos/${id}`);
    return response.data;
  }

  async createProduto(produtoData: ProdutoRequest): Promise<Produto> {
    const response: AxiosResponse<Produto> = await this.api.post('/produtos', produtoData);
    return response.data;
  }

  async updateProduto(id: string, produtoData: Partial<ProdutoRequest>): Promise<Produto> {
    const response: AxiosResponse<Produto> = await this.api.put(`/produtos/${id}`, produtoData);
    return response.data;
  }

  async deleteProduto(id: string): Promise<void> {
    await this.api.delete(`/produtos/${id}`);
  }

  // Métodos de receitas
  async getReceitas(params?: PageRequest): Promise<PageResponse<Receita>> {
    const response: AxiosResponse<PageResponse<Receita>> = await this.api.get('/receitas', { params });
    return response.data;
  }

  async getReceitaById(id: string): Promise<Receita> {
    const response: AxiosResponse<Receita> = await this.api.get(`/receitas/${id}`);
    return response.data;
  }

  async createReceita(receitaData: ReceitaRequest): Promise<Receita> {
    const response: AxiosResponse<Receita> = await this.api.post('/receitas', receitaData);
    return response.data;
  }

  async updateReceita(id: string, receitaData: Partial<ReceitaRequest>): Promise<Receita> {
    const response: AxiosResponse<Receita> = await this.api.put(`/receitas/${id}`, receitaData);
    return response.data;
  }

  async deleteReceita(id: string): Promise<void> {
    await this.api.delete(`/receitas/${id}`);
  }

  // Métodos de ingredientes de receitas
  async getReceitaIngredientes(params?: PageRequest): Promise<PageResponse<ReceitaIngrediente>> {
    const response: AxiosResponse<PageResponse<ReceitaIngrediente>> = await this.api.get('/receitasingredientes', { params });
    return response.data;
  }

  async createReceitaIngrediente(ingredienteData: ReceitaIngredienteRequest): Promise<ReceitaIngrediente> {
    const response: AxiosResponse<ReceitaIngrediente> = await this.api.post('/receitasingredientes', ingredienteData);
    return response.data;
  }

  async updateReceitaIngrediente(ingredienteData: ReceitaIngredienteRequest): Promise<ReceitaIngrediente> {
    const response: AxiosResponse<ReceitaIngrediente> = await this.api.put('/receitasingredientes', ingredienteData);
    return response.data;
  }

  async deleteReceitaIngrediente(deleteData: ReceitaIngredienteDeleteRequest): Promise<void> {
    await this.api.delete('/receitasingredientes', { data: deleteData });
  }

  // Método para buscar ingredientes de uma receita específica
  async getIngredientesByReceita(receitaId: string): Promise<ReceitaIngrediente[]> {
    const response: AxiosResponse<ReceitaIngrediente[]> = await this.api.get(`/receitasingredientes/receita/${receitaId}`);
    return response.data;
  }

  // Métodos para recuperação de senha
  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    console.log('🌐 [API] Solicitando recuperação de senha para:', data.email);
    try {
      const response: AxiosResponse<{ message: string }> = await this.api.post('/auth/forgot-password', data);
      console.log('🌐 [API] Recuperação de senha solicitada com sucesso:', response.data);
    } catch (error) {
      console.error('🌐 [API] Erro ao solicitar recuperação de senha:', error);
      throw error;
    }
  }

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    console.log('🌐 [API] Redefinindo senha com token:', data.token);
    try {
      const response: AxiosResponse<{ message: string }> = await this.api.post('/auth/reset-password', {
        token: data.token,
        newPassword: data.newPassword
      });
      console.log('🌐 [API] Senha redefinida com sucesso:', response.data);
    } catch (error) {
      console.error('🌐 [API] Erro ao redefinir senha:', error);
      throw error;
    }
  }

  async validateResetToken(token: string): Promise<TokenValidationResponse> {
    console.log('🌐 [API] Validando token de recuperação:', token);
    try {
      const response: AxiosResponse<TokenValidationResponse> = await this.api.get(`/auth/validate-reset-token/${token}`);
      console.log('🌐 [API] Token validado:', response.data);
      return response.data;
    } catch (error) {
      console.error('🌐 [API] Erro ao validar token:', error);
      throw error;
    }
  }

  // Métodos para sistema de imagens de receitas

  async uploadReceitaImagem(
    receitaId: string,
    arquivo: File,
    descricao?: string,
    ehPrincipal?: boolean,
    ordemExibicao?: number,
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
  ): Promise<ReceitaImagemResponseDto> {
    console.log('🌐 [API] Fazendo upload de imagem para receita:', receitaId);
    try {
      const formData = new FormData();
      formData.append('arquivo', arquivo);
      if (descricao) formData.append('descricao', descricao);
      if (ehPrincipal !== undefined) formData.append('ehPrincipal', ehPrincipal.toString());
      if (ordemExibicao !== undefined) formData.append('ordemExibicao', ordemExibicao.toString());

      const response: AxiosResponse<ReceitaImagemResponseDto> = await this.api.post(
        `/api/receitas/${receitaId}/imagens`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress,
        }
      );
      console.log('🌐 [API] Upload de imagem concluído:', response.data);
      return response.data;
    } catch (error) {
      console.error('🌐 [API] Erro no upload de imagem:', error);
      throw error;
    }
  }

  async getReceitaImagens(receitaId: string, params?: PageRequest): Promise<PageResponse<ReceitaImagemResponseDto>> {
    console.log('🌐 [API] Buscando imagens da receita:', receitaId);
    try {
      const response: AxiosResponse<PageResponse<ReceitaImagemResponseDto>> = await this.api.get(
        `/api/receitas/${receitaId}/imagens`,
        { params }
      );
      console.log('🌐 [API] Imagens da receita obtidas:', response.data);
      return response.data;
    } catch (error) {
      console.error('🌐 [API] Erro ao buscar imagens da receita:', error);
      throw error;
    }
  }

  async getReceitaImagemById(imagemId: string): Promise<ReceitaImagemResponseDto> {
    console.log('🌐 [API] Buscando imagem por ID:', imagemId);
    try {
      const response: AxiosResponse<ReceitaImagemResponseDto> = await this.api.get(`/api/receitas/imagens/${imagemId}`);
      console.log('🌐 [API] Imagem obtida:', response.data);
      return response.data;
    } catch (error) {
      console.error('🌐 [API] Erro ao buscar imagem:', error);
      throw error;
    }
  }

  async updateReceitaImagem(imagemId: string, updateData: ReceitaImagemUpdateDto): Promise<ReceitaImagemResponseDto> {
    console.log('🌐 [API] Atualizando imagem:', imagemId);
    try {
      const response: AxiosResponse<ReceitaImagemResponseDto> = await this.api.put(
        `/api/receitas/imagens/${imagemId}`,
        updateData
      );
      console.log('🌐 [API] Imagem atualizada:', response.data);
      return response.data;
    } catch (error) {
      console.error('🌐 [API] Erro ao atualizar imagem:', error);
      throw error;
    }
  }

  async deleteReceitaImagem(imagemId: string): Promise<void> {
    console.log('🌐 [API] Excluindo imagem:', imagemId);
    try {
      await this.api.delete(`/api/receitas/imagens/${imagemId}`);
      console.log('🌐 [API] Imagem excluída com sucesso');
    } catch (error) {
      console.error('🌐 [API] Erro ao excluir imagem:', error);
      throw error;
    }
  }

  async reorderReceitaImagens(receitaId: string, imagens: ImagemOrdemDto[]): Promise<void> {
    console.log('🌐 [API] Reordenando imagens da receita:', receitaId);
    try {
      await this.api.put(`/api/receitas/${receitaId}/imagens/reordenar`, { imagens });
      console.log('🌐 [API] Imagens reordenadas com sucesso');
    } catch (error) {
      console.error('🌐 [API] Erro ao reordenar imagens:', error);
      throw error;
    }
  }

  async setImagemPrincipal(receitaId: string, imagemId: string): Promise<void> {
    console.log('🌐 [API] Definindo imagem principal:', { receitaId, imagemId });
    try {
      await this.api.put(`/api/receitas/${receitaId}/imagens/${imagemId}/principal`);
      console.log('🌐 [API] Imagem principal definida com sucesso');
    } catch (error) {
      console.error('🌐 [API] Erro ao definir imagem principal:', error);
      throw error;
    }
  }

  async getImagemPrincipal(receitaId: string): Promise<ReceitaImagemResponseDto | null> {
    console.log('🌐 [API] Buscando imagem principal da receita:', receitaId);
    try {
      const response: AxiosResponse<ReceitaImagemResponseDto> = await this.api.get(
        `/api/receitas/${receitaId}/imagens/principal`
      );
      console.log('🌐 [API] Imagem principal obtida:', response.data);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        console.log('🌐 [API] Nenhuma imagem principal encontrada para a receita:', receitaId);
        return null;
      }
      console.error('🌐 [API] Erro ao buscar imagem principal:', error);
      throw error;
    }
  }

  async getImagemEstatisticas(receitaId: string): Promise<ImagemEstatisticasDto> {
    console.log('🌐 [API] Buscando estatísticas de imagens da receita:', receitaId);
    try {
      const response: AxiosResponse<ImagemEstatisticasDto> = await this.api.get(
        `/api/receitas/${receitaId}/imagens/estatisticas`
      );
      console.log('🌐 [API] Estatísticas de imagens obtidas:', response.data);
      return response.data;
    } catch (error) {
      console.error('🌐 [API] Erro ao buscar estatísticas de imagens:', error);
      throw error;
    }
  }

  async getImageConfig(): Promise<ImageConfigDto> {
    console.log('🌐 [API] Buscando configurações do sistema de imagens');
    try {
      const response: AxiosResponse<ImageConfigDto> = await this.api.get('/api/receitas/imagens/config');
      console.log('🌐 [API] Configurações de imagens obtidas:', response.data);
      return response.data;
    } catch (error) {
      console.error('🌐 [API] Erro ao buscar configurações de imagens:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export default apiService;