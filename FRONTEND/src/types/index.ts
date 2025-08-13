// Tipos de categoria de produto
export const CategoriaProduto = {
  INGREDIENTE_SECO: 'INGREDIENTE_SECO',
  BEBIDA_LACTEA: 'BEBIDA_LACTEA',
  LATICINIO: 'LATICINIO'
} as const;

export type CategoriaProduto = typeof CategoriaProduto[keyof typeof CategoriaProduto];

export const CategoriaReceita = {
  BOLO: 'BOLO',
  TORTA: 'TORTA',
  DOCE_FINO: 'DOCE_FINO',
  BISCOITO: 'BISCOITO',
  SOBREMESA: 'SOBREMESA',
  SALGADO: 'SALGADO',
  OUTROS: 'OUTROS'
} as const;

export type CategoriaReceita = typeof CategoriaReceita[keyof typeof CategoriaReceita];

export const Dificuldade = {
  FACIL: 'FACIL',
  COMPLEXA: 'COMPLEXA'
} as const;

export type Dificuldade = typeof Dificuldade[keyof typeof Dificuldade];

export const UnidadeMedida = {
  KILO: 'KILO',
  UNIDADE: 'UNIDADE',
  LITRO: 'LITRO',
  GRAMA: 'GRAMA',
  COLHER: 'COLHER',
  XICARA: 'XICARA'
} as const;

export type UnidadeMedida = typeof UnidadeMedida[keyof typeof UnidadeMedida];

export const UserRole = {
  ADMIN: 'ADMIN',
  USER: 'USER'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

// Interfaces principais
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Produto {
  produtoId: string;
  nomeProduto: string;
  categoriaproduto: CategoriaProduto;
  unidademedida: UnidadeMedida;
  custoporunidade: number;
  fornecedor: string;
  descricao: string;
  codigobarras?: string;
  observacao?: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

export interface Receita {
  receitaId: string;
  nomeReceita: string;
  categoria: CategoriaReceita;
  dificuldade: Dificuldade;
  tempoPreparo: string;
  rendimento: string;
  modoPreparo: string;
  notas?: string;
  tags?: string;
  favorita: boolean;
  dataCriacao: string;
  dataAlteracao: string;
  userId?: string;
  createdBy?: string;
  ingredientes?: ReceitaIngrediente[];
}

export interface ReceitaIngrediente {
  receitaId: string;
  produtoId: string;
  quantidade: number;
  unidadeMedida: UnidadeMedida;
  observacao?: string;
  produto?: Produto;
  receita?: Receita;
}

// DTOs para requests

export interface UserRequest {
  login: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface ProdutoRequest {
  nome: string;
  unidademedida: UnidadeMedida;
  custoporunidade: number;
  categoriaproduto: CategoriaProduto;
  fornecedor: string;
  descricao: string;
  codigobarras?: string;
  observacao?: string;
}

export interface ReceitaRequest {
  nomeReceita: string;
  categoria: CategoriaReceita;
  dificuldade: Dificuldade;
  tempoPreparo: string;
  rendimento: string;
  modoPreparo: string;
  notas?: string;
  tags?: string;
  favorita?: boolean;
}

export interface ReceitaIngredienteRequest {
  receitaId: string;
  ingredientes: {
    produtoId: string;
    quantidade: number;
    unidadeMedida: UnidadeMedida;
  }[];
}

export interface ReceitaIngredienteDeleteRequest {
  receitaId: string;
  ingredientes: {
    produtoId: string;
  }[];
}

// DTOs para responses
export interface UserResponse {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface ReceitaIngredienteResponse {
  receitaId: string;
  produtoId: string;
  quantidade: number;
  unidadeMedida: UnidadeMedida;
  observacao?: string;
  produto: Produto;
}

// Tipos para autenticação
export interface AuthResponse {
  token: string;
  user: UserResponse;
}

// Tipos para paginação
export interface PageRequest {
  page?: number;
  size?: number;
  sort?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Tipos para formulários
export interface LoginRequest {
  login: string;
  password: string;
}

export interface LoginFormData {
  login: string;
  password: string;
}

// Interface para compatibilidade
export interface UserAuthRequest {
  login: string;
  password: string;
}



export interface RegisterFormData {
  login: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ProdutoFormData {
  nome: string;
  categoriaproduto: CategoriaProduto;
  unidademedida: UnidadeMedida;
  custoporunidade: number;
  fornecedor: string;
  descricao: string;
  codigobarras?: string;
  observacao?: string;
}

export interface ReceitaFormData {
  nomeReceita: string;
  categoria: CategoriaReceita;
  dificuldade: Dificuldade;
  tempoPreparo: number;
  rendimento: number;
  modoPreparo: string;
  notas?: string;
  tags?: string;
  favorita?: boolean;
}

export interface ReceitaIngredienteFormData {
  produtoId: string;
  quantidade: number;
  unidadeMedida: UnidadeMedida;
  observacao?: string;
}

// Tipos para erros
export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
  path: string;
}

export interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
  message?: string;
}

// Tipos para recuperação de senha
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface TokenValidationResponse {
  valid: boolean;
  message: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}