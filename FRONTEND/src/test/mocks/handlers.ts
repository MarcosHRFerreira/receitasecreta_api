import { http, HttpResponse } from 'msw';
import type {
  User,
  Produto,
  Receita,
  ReceitaIngrediente,
  AuthResponse,
  PageResponse,
  UserAuthRequest,
  UserRequest,
  ProdutoRequest,
  ReceitaRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  TokenValidationResponse,
  UnidadeMedida
} from '../../types';

// Additional types for handlers
interface ReceitaIngredienteItem {
  produtoId: string;
  quantidade: number;
  unidadeMedida: UnidadeMedida;
  observacao?: string;
}

interface ReceitaIngredienteRequestHandler {
  receitaId: string;
  ingredientes: ReceitaIngredienteItem[];
}

interface ReceitaIngredienteDeleteRequestHandler {
  receitaId: string;
  ingredientes: {
    produtoId: string;
  }[];
}

const BASE_URL = 'http://localhost:8082/receitasecreta';

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    username: 'Test User',
    email: 'test@test.com',
    role: 'USER',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    username: 'Admin User',
    email: 'admin@test.com',
    role: 'ADMIN',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  },
  {
    id: '3',
    username: 'User Two',
    email: 'user2@test.com',
    role: 'USER',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z'
  }
];

const mockProdutos: Produto[] = [
  {
    id: '1',
    nome: 'Farinha de Trigo',
    unidademedida: 'KILO',
    custoporunidade: 5.50,
    categoria: 'INGREDIENTE_SECO',
    categoriaproduto: 'INGREDIENTE_SECO',
    fornecedor: 'Fornecedor A',
    descricao: 'Farinha de trigo especial para bolos',
    codigobarras: '1234567890123',
    observacao: 'Produto de alta qualidade',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    userId: '1'
  },
  {
    id: '2',
    nome: 'Açúcar Cristal',
    unidademedida: 'KILO',
    custoporunidade: 4.20,
    categoria: 'INGREDIENTE_SECO',
    categoriaproduto: 'INGREDIENTE_SECO',
    fornecedor: 'Fornecedor B',
    descricao: 'Açúcar cristal refinado',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    userId: '2'
  },
  {
    id: '3',
    nome: 'Leite Integral',
    unidademedida: 'LITRO',
    custoporunidade: 6.90,
    categoria: 'LATICINIO',
    categoriaproduto: 'LATICINIO',
    fornecedor: 'Fornecedor C',
    descricao: 'Leite integral fresco',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
    userId: '1'
  }
];

const mockReceitas: Receita[] = [
  {
    receitaId: '1',
    nomeReceita: 'Bolo de Chocolate',
    categoria: 'BOLO',
    dificuldade: 'FACIL',
    tempoPreparo: '30 min',
    rendimento: '8 porções',
    modoPreparo: 'Misture todos os ingredientes e asse por 30 minutos',
    notas: 'Delicioso bolo de chocolate',
    tags: 'chocolate,bolo,sobremesa',
    favorita: true,
    dataCriacao: '2024-01-01T00:00:00Z',
    dataAlteracao: '2024-01-01T00:00:00Z',
    userId: '1'
  },
  {
    receitaId: '2',
    nomeReceita: 'Lasanha Bolonhesa',
    categoria: 'SALGADO',
    dificuldade: 'COMPLEXA',
    tempoPreparo: '60 min',
    rendimento: '6 porções',
    modoPreparo: 'Monte as camadas e asse por 45 minutos',
    notas: 'Lasanha tradicional italiana',
    tags: 'lasanha,massa,italiana',
    favorita: false,
    dataCriacao: '2024-01-02T00:00:00Z',
    dataAlteracao: '2024-01-02T00:00:00Z',
    userId: '2'
  },
  {
    receitaId: '3',
    nomeReceita: 'Salada Caesar',
    categoria: 'SALGADO',
    dificuldade: 'FACIL',
    tempoPreparo: '15 min',
    rendimento: '4 porções',
    modoPreparo: 'Misture os ingredientes e sirva',
    notas: 'Salada fresca e saborosa',
    tags: 'salada,fresco,rapido',
    favorita: true,
    dataCriacao: '2024-01-03T00:00:00Z',
    dataAlteracao: '2024-01-03T00:00:00Z',
    userId: '1'
  }
];

const mockReceitaIngredientes: ReceitaIngrediente[] = [
  {
    receitaId: '1',
    produtoId: '1',
    quantidade: 2,
    unidadeMedida: 'XICARA',
    observacao: 'Peneirar antes de usar',
    produto: mockProdutos[0],
    receita: mockReceitas[0]
  },
  {
    receitaId: '1',
    produtoId: '2',
    quantidade: 1,
    unidadeMedida: 'XICARA',
    observacao: 'Temperatura ambiente',
    produto: mockProdutos[1],
    receita: mockReceitas[0]
  },
  {
    receitaId: '2',
    produtoId: '3',
    quantidade: 1,
    unidadeMedida: 'LITRO',
    observacao: 'Para o molho bechamel',
    produto: mockProdutos[2],
    receita: mockReceitas[1]
  }
];

// Utility functions
const createPageResponse = <T>(content: T[], page = 0, size = 10): PageResponse<T> => {
  const startIndex = page * size;
  const endIndex = startIndex + size;
  const paginatedContent = content.slice(startIndex, endIndex);
  
  return {
    content: paginatedContent,
    totalElements: content.length,
    totalPages: Math.ceil(content.length / size),
    size,
    number: page,
    first: page === 0,
    last: page >= Math.ceil(content.length / size) - 1
  };
};

const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

export const handlers = [
  // Authentication endpoints
  http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
    const credentials = await request.json() as UserAuthRequest;
    
    // Simulate authentication logic
    const user = mockUsers.find(u => 
      u.username === credentials.login || u.email === credentials.login
    );
    
    if (!user || credentials.password !== 'password123') {
      return HttpResponse.json(
        { message: 'Credenciais inválidas' },
        { status: 401 }
      );
    }
    
    const authResponse: AuthResponse = {
      token: 'mock-jwt-token-' + user.id,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    };
    
    return HttpResponse.json(authResponse);
  }),

  http.post(`${BASE_URL}/auth/register`, async ({ request }) => {
    const userData = await request.json() as UserRequest;
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => 
      u.username === userData.login || u.email === userData.email
    );
    
    if (existingUser) {
      return HttpResponse.json(
        { message: 'Usuário já existe' },
        { status: 409 }
      );
    }
    
    const newUser: User = {
      id: generateId(),
      username: userData.login,
      email: userData.email,
      role: userData.role || 'USER',
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };
    
    mockUsers.push(newUser);
    
    const authResponse: AuthResponse = {
      token: 'mock-jwt-token-' + newUser.id,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt
      }
    };
    
    return HttpResponse.json(authResponse, { status: 201 });
  }),

  http.post(`${BASE_URL}/auth/forgot-password`, async ({ request }) => {
    const data = await request.json() as ForgotPasswordRequest;
    
    const user = mockUsers.find(u => u.email === data.email);
    
    if (!user) {
      return HttpResponse.json(
        { message: 'Email não encontrado' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(
      { message: 'Email de recuperação enviado com sucesso' },
      { status: 200 }
    );
  }),

  http.post(`${BASE_URL}/auth/reset-password`, async ({ request }) => {
    const data = await request.json() as ResetPasswordRequest;
    
    // Simulate token validation
    if (!data.token || data.token === 'invalid-token') {
      return HttpResponse.json(
        { message: 'Token inválido ou expirado' },
        { status: 400 }
      );
    }
    
    return HttpResponse.json(
      { message: 'Senha redefinida com sucesso' },
      { status: 200 }
    );
  }),

  http.get(`${BASE_URL}/auth/validate-reset-token/:token`, ({ params }) => {
    const { token } = params;
    
    const isValid = token !== 'invalid-token';
    
    const response: TokenValidationResponse = {
      valid: isValid,
      message: isValid ? 'Token válido' : 'Token inválido ou expirado'
    };
    
    return HttpResponse.json(response, { 
      status: isValid ? 200 : 400 
    });
  }),

  // Users endpoints
  http.get(`${BASE_URL}/users`, () => {
    return HttpResponse.json(mockUsers);
  }),

  http.get(`${BASE_URL}/users/:id`, ({ params }) => {
    const { id } = params;
    const user = mockUsers.find(u => u.id === id);
    
    if (!user) {
      return HttpResponse.json(
        { message: 'Usuário não encontrado' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(user);
  }),

  http.post(`${BASE_URL}/users`, async ({ request }) => {
    const userData = await request.json() as UserRequest;
    
    const newUser: User = {
      id: generateId(),
      username: userData.login,
      email: userData.email,
      role: userData.role || 'USER',
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };
    
    mockUsers.push(newUser);
    
    return HttpResponse.json(newUser, { status: 201 });
  }),

  http.put(`${BASE_URL}/users/:id`, async ({ params, request }) => {
    const { id } = params;
    const userData = await request.json() as Partial<UserRequest>;
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return HttpResponse.json(
        { message: 'Usuário não encontrado' },
        { status: 404 }
      );
    }
    
    const updatedUser = {
      ...mockUsers[userIndex],
      ...userData,
      updatedAt: getCurrentTimestamp()
    };
    
    mockUsers[userIndex] = updatedUser;
    
    return HttpResponse.json(updatedUser);
  }),

  http.delete(`${BASE_URL}/users/:id`, ({ params }) => {
    const { id } = params;
    const userIndex = mockUsers.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return HttpResponse.json(
        { message: 'Usuário não encontrado' },
        { status: 404 }
      );
    }
    
    mockUsers.splice(userIndex, 1);
    
    return HttpResponse.json(null, { status: 204 });
  }),

  // Receitas endpoints
  http.get(`${BASE_URL}/receitas`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '10');
    
    const pageResponse = createPageResponse(mockReceitas, page, size);
    
    return HttpResponse.json(pageResponse);
  }),

  http.get(`${BASE_URL}/receitas/:id`, ({ params }) => {
    const { id } = params;
    const receita = mockReceitas.find(r => r.receitaId === id);
    
    if (!receita) {
      return HttpResponse.json(
        { message: 'Receita não encontrada' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(receita);
  }),

  http.post(`${BASE_URL}/receitas`, async ({ request }) => {
    const receitaData = await request.json() as ReceitaRequest;
    
    const newReceita: Receita = {
      receitaId: generateId(),
      nomeReceita: receitaData.nomeReceita,
      categoria: receitaData.categoria,
      dificuldade: receitaData.dificuldade,
      tempoPreparo: receitaData.tempoPreparo,
      rendimento: receitaData.rendimento,
      modoPreparo: receitaData.modoPreparo,
      notas: receitaData.notas,
      tags: receitaData.tags,
      favorita: receitaData.favorita || false,
      dataCriacao: getCurrentTimestamp(),
      dataAlteracao: getCurrentTimestamp(),
      userId: '1' // Mock current user ID
    };
    
    mockReceitas.push(newReceita);
    
    return HttpResponse.json(newReceita, { status: 201 });
  }),

  http.put(`${BASE_URL}/receitas/:id`, async ({ params, request }) => {
    const { id } = params;
    const receitaData = await request.json() as Partial<ReceitaRequest>;
    
    const receitaIndex = mockReceitas.findIndex(r => r.receitaId === id);
    
    if (receitaIndex === -1) {
      return HttpResponse.json(
        { message: 'Receita não encontrada' },
        { status: 404 }
      );
    }
    
    const updatedReceita = {
      ...mockReceitas[receitaIndex],
      ...receitaData,
      dataAlteracao: getCurrentTimestamp()
    };
    
    mockReceitas[receitaIndex] = updatedReceita;
    
    return HttpResponse.json(updatedReceita);
  }),

  http.delete(`${BASE_URL}/receitas/:id`, ({ params }) => {
    const { id } = params;
    const receitaIndex = mockReceitas.findIndex(r => r.receitaId === id);
    
    if (receitaIndex === -1) {
      return HttpResponse.json(
        { message: 'Receita não encontrada' },
        { status: 404 }
      );
    }
    
    mockReceitas.splice(receitaIndex, 1);
    
    return HttpResponse.json(null, { status: 204 });
  }),

  // Produtos endpoints
  http.get(`${BASE_URL}/produtos`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '10');
    
    const pageResponse = createPageResponse(mockProdutos, page, size);
    
    return HttpResponse.json(pageResponse);
  }),

  http.get(`${BASE_URL}/produtos/:id`, ({ params }) => {
    const { id } = params;
    const produto = mockProdutos.find(p => p.id === id);
    
    if (!produto) {
      return HttpResponse.json(
        { message: 'Produto não encontrado' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(produto);
  }),

  http.post(`${BASE_URL}/produtos`, async ({ request }) => {
    const produtoData = await request.json() as ProdutoRequest;
    
    const newProduto: Produto = {
      id: generateId(),
      nome: produtoData.nome,
      unidademedida: produtoData.unidademedida,
      custoporunidade: produtoData.custoporunidade,
      categoria: produtoData.categoriaproduto,
      categoriaproduto: produtoData.categoriaproduto,
      fornecedor: produtoData.fornecedor,
      descricao: produtoData.descricao,
      codigobarras: produtoData.codigobarras,
      observacao: produtoData.observacao,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
      userId: '1' // Mock current user ID
    };
    
    mockProdutos.push(newProduto);
    
    return HttpResponse.json(newProduto, { status: 201 });
  }),

  http.put(`${BASE_URL}/produtos/:id`, async ({ params, request }) => {
    const { id } = params;
    const produtoData = await request.json() as Partial<ProdutoRequest>;
    
    const produtoIndex = mockProdutos.findIndex(p => p.id === id);
    
    if (produtoIndex === -1) {
      return HttpResponse.json(
        { message: 'Produto não encontrado' },
        { status: 404 }
      );
    }
    
    const updatedProduto: Produto = {
      ...mockProdutos[produtoIndex],
      ...(produtoData.nome && { nome: produtoData.nome }),
      ...(produtoData.unidademedida && { unidademedida: produtoData.unidademedida }),
      ...(produtoData.custoporunidade !== undefined && { custoporunidade: produtoData.custoporunidade }),
      ...(produtoData.categoriaproduto && { categoria: produtoData.categoriaproduto }),
      ...(produtoData.categoriaproduto && { categoriaproduto: produtoData.categoriaproduto }),
      ...(produtoData.fornecedor && { fornecedor: produtoData.fornecedor }),
      ...(produtoData.descricao && { descricao: produtoData.descricao }),
      ...(produtoData.codigobarras !== undefined && { codigobarras: produtoData.codigobarras }),
      ...(produtoData.observacao !== undefined && { observacao: produtoData.observacao }),
      updatedAt: getCurrentTimestamp()
    };
    
    mockProdutos[produtoIndex] = updatedProduto;
    
    return HttpResponse.json(updatedProduto);
  }),

  http.delete(`${BASE_URL}/produtos/:id`, ({ params }) => {
    const { id } = params;
    const produtoIndex = mockProdutos.findIndex(p => p.id === id);
    
    if (produtoIndex === -1) {
      return HttpResponse.json(
        { message: 'Produto não encontrado' },
        { status: 404 }
      );
    }
    
    mockProdutos.splice(produtoIndex, 1);
    
    return HttpResponse.json(null, { status: 204 });
  }),

  // Receita Ingredientes endpoints
  http.get(`${BASE_URL}/receitasingredientes`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '10');
    
    const pageResponse = createPageResponse(mockReceitaIngredientes, page, size);
    
    return HttpResponse.json(pageResponse);
  }),

  http.get(`${BASE_URL}/receitasingredientes/receita/:receitaId`, ({ params }) => {
    const { receitaId } = params;
    const ingredientes = mockReceitaIngredientes.filter(ri => ri.receitaId === receitaId);
    
    return HttpResponse.json(ingredientes);
  }),

  http.post(`${BASE_URL}/receitasingredientes`, async ({ request }) => {
    const ingredienteData = await request.json() as ReceitaIngredienteRequestHandler;
    
    const newIngredientes: ReceitaIngrediente[] = ingredienteData.ingredientes.map(ing => ({
      receitaId: ingredienteData.receitaId,
      produtoId: ing.produtoId,
      quantidade: ing.quantidade,
      unidadeMedida: ing.unidadeMedida,
      observacao: ing.observacao,
      produto: mockProdutos.find(p => p.id === ing.produtoId),
      receita: mockReceitas.find(r => r.receitaId === ingredienteData.receitaId)
    }));
    
    mockReceitaIngredientes.push(...newIngredientes);
    
    return HttpResponse.json(newIngredientes, { status: 201 });
  }),

  http.put(`${BASE_URL}/receitasingredientes`, async ({ request }) => {
    const ingredienteData = await request.json() as ReceitaIngredienteRequestHandler;
    
    // Remove existing ingredients for this recipe
    const filteredIngredientes = mockReceitaIngredientes.filter(
      ri => ri.receitaId !== ingredienteData.receitaId
    );
    
    // Add updated ingredients
    const updatedIngredientes: ReceitaIngrediente[] = ingredienteData.ingredientes.map(ing => ({
      receitaId: ingredienteData.receitaId,
      produtoId: ing.produtoId,
      quantidade: ing.quantidade,
      unidadeMedida: ing.unidadeMedida,
      observacao: ing.observacao,
      produto: mockProdutos.find(p => p.id === ing.produtoId),
      receita: mockReceitas.find(r => r.receitaId === ingredienteData.receitaId)
    }));
    
    mockReceitaIngredientes.length = 0;
    mockReceitaIngredientes.push(...filteredIngredientes, ...updatedIngredientes);
    
    return HttpResponse.json(updatedIngredientes);
  }),

  http.delete(`${BASE_URL}/receitasingredientes`, async ({ request }) => {
    const deleteData = await request.json() as ReceitaIngredienteDeleteRequestHandler;
    
    // Remove specified ingredients
    deleteData.ingredientes.forEach(ing => {
      const index = mockReceitaIngredientes.findIndex(
        ri => ri.receitaId === deleteData.receitaId && ri.produtoId === ing.produtoId
      );
      if (index !== -1) {
        mockReceitaIngredientes.splice(index, 1);
      }
    });
    
    return HttpResponse.json(null, { status: 204 });
  }),

  // Error simulation endpoints for testing
  http.get(`${BASE_URL}/test/error/500`, () => {
    return HttpResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }),

  http.get(`${BASE_URL}/test/error/401`, () => {
    return HttpResponse.json(
      { message: 'Não autorizado' },
      { status: 401 }
    );
  }),

  http.get(`${BASE_URL}/test/error/403`, () => {
    return HttpResponse.json(
      { message: 'Acesso negado' },
      { status: 403 }
    );
  }),

  http.get(`${BASE_URL}/test/timeout`, () => {
    return new Promise(() => {
      // Never resolves - simulates timeout
    });
  }),

  http.get(`${BASE_URL}/test/network-error`, () => {
    return HttpResponse.error();
  }),
];