# 📋 Estudo de Testes Unitários e de Integração - Frontend React/TypeScript

## 🎯 Objetivo
Implementar uma estratégia completa de testes unitários e de integração para o frontend da aplicação **Receita Secreta**, garantindo qualidade, confiabilidade e manutenibilidade do código React/TypeScript.

## 📊 Análise da Estrutura Atual

### 🔍 Estrutura do Projeto
```
FRONTEND/src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes de UI base
│   ├── icons/          # Ícones
│   ├── Layout.tsx      # Layout principal
│   ├── Loading.tsx     # Componente de loading
│   ├── Modal.tsx       # Modal reutilizável
│   ├── ProtectedRoute.tsx # Proteção de rotas
│   └── Receita*.tsx    # Componentes específicos de receita
├── pages/              # Páginas da aplicação
│   ├── Login.tsx       # Página de login
│   ├── Register.tsx    # Página de registro
│   ├── Dashboard.tsx   # Dashboard principal
│   ├── *List.tsx       # Páginas de listagem
│   ├── *Form.tsx       # Páginas de formulário
│   └── *Password.tsx   # Páginas de recuperação de senha
├── contexts/           # Contextos React
│   ├── AuthContext.tsx # Contexto de autenticação
│   └── AuthContextDefinition.tsx # Definições do contexto
├── hooks/              # Hooks customizados
│   ├── useAuth.ts      # Hook de autenticação
│   └── useApi.ts       # Hook para API
├── services/           # Serviços
│   └── api.ts          # Cliente da API
├── types/              # Definições de tipos TypeScript
│   └── index.ts        # Tipos principais
├── utils/              # Utilitários
│   └── cn.ts           # Utilitário de classes CSS
└── constants/          # Constantes
    └── queryKeys.ts    # Chaves do React Query
```

### 🛠️ Tecnologias Identificadas
- **React 19.1.1** com TypeScript
- **Vite** como bundler
- **Vitest** para testes (já configurado)
- **React Testing Library** para testes de componentes
- **React Query** para gerenciamento de estado servidor
- **React Hook Form** para formulários
- **React Router DOM** para roteamento
- **Axios** para requisições HTTP
- **Tailwind CSS** para estilização

### 📋 Status Atual dos Testes
- ❌ **Pasta de testes**: Não existe (`src/test/` não encontrada)
- ❌ **Setup de testes**: Arquivo `setup.ts` não existe
- ✅ **Configuração Vitest**: Configurado mas sem setup
- ✅ **Dependências**: Testing Library e Jest DOM instalados

## 📋 TAREFAS DE IMPLEMENTAÇÃO

### 🏗️ **TAREFA 1: Configuração Inicial dos Testes**

#### 1.1 Criar estrutura de pastas de teste
- [ ] Criar `src/test/` como pasta principal de testes
- [ ] Criar `src/test/setup.ts` para configuração global
- [ ] Criar `src/test/utils/` para utilitários de teste
- [ ] Criar `src/test/mocks/` para mocks globais
- [ ] Criar `src/test/__tests__/` para testes organizados por tipo

#### 1.2 Configurar setup de testes
- [ ] Implementar `src/test/setup.ts` com configurações do Testing Library
- [ ] Configurar mocks globais (localStorage, sessionStorage, etc.)
- [ ] Configurar MSW (Mock Service Worker) para mocks de API
- [ ] Configurar matchers customizados do Jest DOM

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll } from 'vitest';
import { server } from './mocks/server';

// Configurar MSW
beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());

// Mock do localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});
```

#### 1.3 Atualizar dependências de teste
- [ ] Adicionar MSW para mock de APIs
- [ ] Adicionar @vitest/coverage-v8 para cobertura
- [ ] Adicionar sinon para mocks avançados
- [ ] Configurar scripts de teste no package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch",
    "test:run": "vitest run"
  },
  "devDependencies": {
    "msw": "^2.0.0",
    "@vitest/coverage-v8": "^3.2.4",
    "sinon": "^17.0.0"
  }
}
```

### 🧪 **TAREFA 2: Testes Unitários - Utilitários e Helpers**

#### 2.1 Testes para utils/cn.ts
- [ ] Testar combinação de classes CSS
- [ ] Testar condicionais de classes
- [ ] Testar casos edge (undefined, null, empty)

```typescript
// src/test/__tests__/utils/cn.test.ts
import { describe, it, expect } from 'vitest';
import { cn } from '../../../utils/cn';

describe('cn utility', () => {
  it('deve combinar classes CSS corretamente', () => {
    const result = cn('base-class', 'additional-class');
    expect(result).toBe('base-class additional-class');
  });

  it('deve lidar com condicionais', () => {
    const result = cn('base', true && 'conditional', false && 'hidden');
    expect(result).toBe('base conditional');
  });
});
```

#### 2.2 Testes para constants/queryKeys.ts
- [ ] Testar estrutura das chaves
- [ ] Testar unicidade das chaves
- [ ] Testar tipagem das chaves

### 🔧 **TAREFA 3: Testes Unitários - Hooks Customizados**

#### 3.1 Testes para hooks/useAuth.ts
- [ ] **Cenário: Hook usado dentro do AuthProvider**
  - Verificar se retorna o contexto corretamente
  - Testar todas as propriedades do contexto

- [ ] **Cenário: Hook usado fora do AuthProvider**
  - Verificar se lança erro apropriado
  - Testar mensagem de erro específica

```typescript
// src/test/__tests__/hooks/useAuth.test.tsx
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth } from '../../../hooks/useAuth';
import { AuthProvider } from '../../../contexts/AuthContext';

describe('useAuth hook', () => {
  it('deve retornar contexto quando usado dentro do AuthProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('login');
    expect(result.current).toHaveProperty('logout');
  });

  it('deve lançar erro quando usado fora do AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });
});
```

#### 3.2 Testes para hooks/useApi.ts
- [ ] Testar integração com React Query
- [ ] Testar estados de loading, error e success
- [ ] Testar cache e invalidação

### 🌐 **TAREFA 4: Testes Unitários - Serviços**

#### 4.1 Testes para services/api.ts
- [ ] **Configuração da instância Axios**
  - Testar baseURL correta
  - Testar headers padrão
  - Testar timeout

- [ ] **Interceptors de requisição**
  - Testar adição automática do token
  - Testar requisições sem token
  - Testar logging de requisições

- [ ] **Interceptors de resposta**
  - Testar tratamento de erros 401
  - Testar logout automático
  - Testar logging de respostas

- [ ] **Métodos de autenticação**
  - Testar login com credenciais válidas
  - Testar login com credenciais inválidas
  - Testar registro de usuário
  - Testar recuperação de senha
  - Testar reset de senha

- [ ] **Métodos CRUD para entidades**
  - Testar operações de usuários
  - Testar operações de produtos
  - Testar operações de receitas
  - Testar operações de ingredientes

```typescript
// src/test/__tests__/services/api.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { apiService } from '../../../services/api';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('ApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Configuração', () => {
    it('deve configurar baseURL corretamente', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:8082/receitasecreta',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('Autenticação', () => {
    it('deve fazer login com credenciais válidas', async () => {
      const mockResponse = {
        data: {
          token: 'mock-token',
          user: { id: '1', username: 'test', email: 'test@test.com' }
        }
      };
      
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await apiService.login({
        login: 'test@test.com',
        password: 'password123'
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/login', {
        login: 'test@test.com',
        password: 'password123'
      });
    });
  });
});
```

### 🎨 **TAREFA 5: Testes Unitários - Componentes Base**

#### 5.1 Testes para components/ui/Button.tsx
- [ ] **Renderização básica**
  - Testar texto do botão
  - Testar classes CSS aplicadas
  - Testar variantes (primary, secondary, etc.)

- [ ] **Interações**
  - Testar evento de click
  - Testar estado disabled
  - Testar estado loading

- [ ] **Acessibilidade**
  - Testar atributos ARIA
  - Testar navegação por teclado
  - Testar screen readers

```typescript
// src/test/__tests__/components/ui/Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../../../../components/ui/Button';

describe('Button Component', () => {
  it('deve renderizar com texto correto', () => {
    render(<Button>Clique aqui</Button>);
    
    expect(screen.getByRole('button', { name: 'Clique aqui' })).toBeInTheDocument();
  });

  it('deve chamar onClick quando clicado', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clique</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('deve estar desabilitado quando disabled=true', () => {
    render(<Button disabled>Botão</Button>);
    
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

#### 5.2 Testes para components/ui/Card.tsx
- [ ] Testar estrutura do card
- [ ] Testar props de conteúdo
- [ ] Testar variantes de estilo

#### 5.3 Testes para components/Loading.tsx
- [ ] Testar renderização do spinner
- [ ] Testar mensagem de loading
- [ ] Testar acessibilidade (aria-label)

#### 5.4 Testes para components/Modal.tsx
- [ ] **Funcionalidade básica**
  - Testar abertura e fechamento
  - Testar renderização condicional
  - Testar conteúdo do modal

- [ ] **Interações**
  - Testar fechamento por ESC
  - Testar fechamento por overlay
  - Testar foco trap

- [ ] **Acessibilidade**
  - Testar atributos ARIA
  - Testar gerenciamento de foco
  - Testar scroll lock

### 🛡️ **TAREFA 6: Testes Unitários - Contextos**

#### 6.1 Testes para contexts/AuthContext.tsx
- [ ] **Estado inicial**
  - Testar valores padrão
  - Testar carregamento inicial
  - Testar recuperação do localStorage

- [ ] **Operações de autenticação**
  - Testar login bem-sucedido
  - Testar login com erro
  - Testar logout
  - Testar registro

- [ ] **Persistência**
  - Testar salvamento no localStorage
  - Testar limpeza no logout
  - Testar recuperação na inicialização

- [ ] **Estados de loading**
  - Testar isLoading durante operações
  - Testar transições de estado

```typescript
// src/test/__tests__/contexts/AuthContext.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider } from '../../../contexts/AuthContext';
import { useAuth } from '../../../hooks/useAuth';

// Componente de teste para acessar o contexto
const TestComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="user">{user?.username || 'No user'}</div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      <button onClick={() => login({ login: 'test', password: 'test' })}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('deve inicializar com estado não autenticado', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('No user');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  });

  it('deve recuperar usuário do localStorage na inicialização', async () => {
    const mockUser = { id: '1', username: 'test', email: 'test@test.com' };
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });
  });
});
```

### 📄 **TAREFA 7: Testes Unitários - Páginas**

#### 7.1 Testes para pages/Login.tsx
- [ ] **Renderização**
  - Testar campos do formulário
  - Testar botões e links
  - Testar mensagens de erro

- [ ] **Validação de formulário**
  - Testar campos obrigatórios
  - Testar formato de email
  - Testar mensagens de validação

- [ ] **Submissão**
  - Testar login bem-sucedido
  - Testar login com erro
  - Testar redirecionamento

- [ ] **Estados**
  - Testar estado de loading
  - Testar estado de erro
  - Testar limpeza de erros

```typescript
// src/test/__tests__/pages/Login.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from '../../../pages/Login';
import { AuthProvider } from '../../../contexts/AuthContext';

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {component}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar formulário de login', () => {
    renderWithProviders(<Login />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('deve mostrar erros de validação para campos vazios', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument();
    });
  });

  it('deve submeter formulário com dados válidos', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    await user.type(screen.getByLabelText(/email/i), 'test@test.com');
    await user.type(screen.getByLabelText(/senha/i), 'password123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    // Verificar se o loading aparece
    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
  });
});
```

#### 7.2 Testes para pages/Register.tsx
- [ ] Implementar testes similares ao Login
- [ ] Testar confirmação de senha
- [ ] Testar validação de email único

#### 7.3 Testes para pages/Dashboard.tsx
- [ ] Testar renderização de dados
- [ ] Testar estados de loading
- [ ] Testar navegação

#### 7.4 Testes para pages/*List.tsx
- [ ] **ReceitasList**
  - Testar listagem de receitas
  - Testar paginação
  - Testar filtros e busca
  - Testar ações (editar, excluir)

- [ ] **ProdutosList**
  - Testar listagem de produtos
  - Testar ordenação
  - Testar estados vazios

- [ ] **UsersList**
  - Testar listagem de usuários (admin)
  - Testar permissões
  - Testar ações administrativas

#### 7.5 Testes para pages/*Form.tsx
- [ ] **ReceitaForm**
  - Testar criação de receita
  - Testar edição de receita
  - Testar validações
  - Testar upload de imagens
  - Testar gerenciamento de ingredientes

- [ ] **ProdutoForm**
  - Testar criação de produto
  - Testar validações de campos
  - Testar seleção de categorias

### 🔒 **TAREFA 8: Testes Unitários - Componentes de Proteção**

#### 8.1 Testes para components/ProtectedRoute.tsx
- [ ] **Usuário autenticado**
  - Testar renderização do componente filho
  - Testar acesso permitido

- [ ] **Usuário não autenticado**
  - Testar redirecionamento para login
  - Testar preservação da rota original

- [ ] **Estados de loading**
  - Testar loading durante verificação
  - Testar transições de estado

```typescript
// src/test/__tests__/components/ProtectedRoute.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '../../../components/ProtectedRoute';
import { AuthProvider } from '../../../contexts/AuthContext';

const mockUseAuth = vi.fn();
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

const TestComponent = () => <div>Conteúdo Protegido</div>;

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('ProtectedRoute', () => {
  it('deve renderizar conteúdo para usuário autenticado', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithRouter(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByText('Conteúdo Protegido')).toBeInTheDocument();
  });

  it('deve mostrar loading durante verificação', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    renderWithRouter(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
  });
});
```

### 🧩 **TAREFA 9: Testes de Integração**

#### 9.1 Configurar MSW (Mock Service Worker)
- [ ] Criar handlers para todas as rotas da API
- [ ] Configurar cenários de sucesso e erro
- [ ] Implementar delays realistas

```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8082/receitasecreta';

export const handlers = [
  // Auth endpoints
  http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
    const { login, password } = await request.json();
    
    if (login === 'test@test.com' && password === 'password123') {
      return HttpResponse.json({
        token: 'mock-jwt-token',
        user: {
          id: '1',
          username: 'Test User',
          email: 'test@test.com',
          role: 'USER'
        }
      });
    }
    
    return HttpResponse.json(
      { message: 'Credenciais inválidas' },
      { status: 401 }
    );
  }),

  // Receitas endpoints
  http.get(`${BASE_URL}/receitas`, () => {
    return HttpResponse.json({
      content: [
        {
          receitaId: '1',
          nomeReceita: 'Bolo de Chocolate',
          categoria: 'SOBREMESA',
          dificuldade: 'FACIL'
        }
      ],
      totalElements: 1,
      totalPages: 1
    });
  }),

  // Error scenarios
  http.get(`${BASE_URL}/receitas/error`, () => {
    return HttpResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }),
];
```

#### 9.2 Testes de Fluxo Completo
- [ ] **Fluxo de Autenticação**
  - Login → Dashboard → Logout
  - Registro → Confirmação → Login
  - Recuperação de senha → Reset → Login

- [ ] **Fluxo de Receitas**
  - Listar → Visualizar → Editar → Salvar
  - Criar nova → Adicionar ingredientes → Salvar
  - Buscar → Filtrar → Ordenar

- [ ] **Fluxo de Produtos**
  - Listar → Criar → Editar → Excluir
  - Buscar → Filtrar por categoria

```typescript
// src/test/__tests__/integration/auth-flow.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../../App';

describe('Fluxo de Autenticação', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deve completar fluxo de login com sucesso', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Deve estar na página de login
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();

    // Fazer login
    await user.type(screen.getByLabelText(/email/i), 'test@test.com');
    await user.type(screen.getByLabelText(/senha/i), 'password123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    // Deve redirecionar para dashboard
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });

    // Fazer logout
    await user.click(screen.getByRole('button', { name: /sair/i }));

    // Deve voltar para login
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    });
  });
});
```

#### 9.3 Testes de Erro e Edge Cases
- [ ] **Cenários de erro de rede**
  - Timeout de requisições
  - Erro 500 do servidor
  - Perda de conexão

- [ ] **Cenários de erro de autenticação**
  - Token expirado
  - Token inválido
  - Logout forçado

- [ ] **Cenários de validação**
  - Dados inválidos
  - Campos obrigatórios
  - Limites de caracteres

### 🎯 **TAREFA 10: Testes de Acessibilidade**

#### 10.1 Configurar testes de acessibilidade
- [ ] Adicionar jest-axe para testes automatizados
- [ ] Configurar regras de acessibilidade
- [ ] Criar utilitários para testes de a11y

```typescript
// src/test/utils/accessibility.ts
import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';

expect.extend(toHaveNoViolations);

export const testAccessibility = async (component: React.ReactElement) => {
  const { container } = render(component);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};
```

#### 10.2 Testes específicos de acessibilidade
- [ ] **Navegação por teclado**
  - Tab order correto
  - Escape para fechar modais
  - Enter/Space para ativar botões

- [ ] **Screen readers**
  - Labels apropriados
  - Descrições ARIA
  - Live regions para feedback

- [ ] **Contraste e visibilidade**
  - Cores com contraste adequado
  - Foco visível
  - Texto legível

### 📊 **TAREFA 11: Configuração de Cobertura**

#### 11.1 Configurar relatórios de cobertura
- [ ] Configurar thresholds mínimos
- [ ] Excluir arquivos desnecessários
- [ ] Configurar relatórios HTML

```typescript
// vitest.config.ts - adicionar configuração de coverage
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/vite-env.d.ts'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});
```

### 🚀 **TAREFA 12: Automação e Scripts**

#### 12.1 Scripts de desenvolvimento
- [ ] Script para executar testes em watch mode
- [ ] Script para executar testes com cobertura
- [ ] Script para executar apenas testes unitários
- [ ] Script para executar apenas testes de integração

#### 12.2 Pre-commit hooks
- [ ] Configurar Husky para hooks de git
- [ ] Executar testes antes do commit
- [ ] Verificar cobertura mínima
- [ ] Executar linting

```json
// package.json
{
  "scripts": {
    "test:unit": "vitest run src/test/__tests__/components src/test/__tests__/hooks src/test/__tests__/utils",
    "test:integration": "vitest run src/test/__tests__/integration",
    "test:a11y": "vitest run src/test/__tests__/accessibility",
    "test:coverage:unit": "vitest run --coverage src/test/__tests__/components src/test/__tests__/hooks",
    "test:ci": "vitest run --coverage --reporter=verbose"
  },
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:unit && npm run lint"
    }
  }
}
```

## 🎯 Metas de Qualidade

### 📊 Cobertura de Código
- **Meta Mínima**: 80% de cobertura de linha
- **Meta Ideal**: 90% de cobertura de linha
- **Cobertura de Branch**: Mínimo 75%
- **Cobertura de Funções**: Mínimo 85%

### ⚡ Performance dos Testes
- **Testes Unitários**: < 10 segundos para toda a suíte
- **Testes de Integração**: < 30 segundos para toda a suíte
- **Testes Completos**: < 1 minuto

### 🔍 Qualidade dos Testes
- **Nomenclatura**: Nomes descritivos em português
- **Organização**: Agrupamento por funcionalidade
- **Padrão AAA**: Arrange, Act, Assert
- **Independência**: Testes isolados e determinísticos

## 📅 Cronograma de Implementação

### **Semana 1: Fundação**
- Tarefas 1 e 2 (Configuração + Utilitários)
- Setup completo do ambiente de testes

### **Semana 2: Componentes Base**
- Tarefas 3, 4 e 5 (Hooks + Serviços + Componentes UI)
- Testes unitários fundamentais

### **Semana 3: Contextos e Páginas**
- Tarefas 6 e 7 (Contextos + Páginas)
- Testes de funcionalidades principais

### **Semana 4: Proteção e Integração**
- Tarefas 8 e 9 (ProtectedRoute + Integração)
- Fluxos completos e cenários reais

### **Semana 5: Qualidade e Automação**
- Tarefas 10, 11 e 12 (Acessibilidade + Cobertura + Automação)
- Finalização e otimização

## 🛠️ Ferramentas e Tecnologias

### 🧪 Testes
- **Vitest**: Framework de testes principal
- **React Testing Library**: Testes de componentes
- **Jest DOM**: Matchers para DOM
- **MSW**: Mock Service Worker para APIs
- **Sinon**: Mocks e spies avançados
- **User Event**: Simulação de interações

### 📊 Qualidade
- **@vitest/coverage-v8**: Cobertura de código
- **jest-axe**: Testes de acessibilidade
- **ESLint**: Análise estática
- **TypeScript**: Verificação de tipos

### 🚀 Automação
- **Husky**: Git hooks
- **GitHub Actions**: CI/CD
- **Vite**: Build e desenvolvimento

## 💡 Benefícios Esperados

### 🔒 Qualidade
- **Redução de bugs**: Detecção precoce de problemas
- **Refatoração segura**: Confiança para modificar código
- **Documentação viva**: Testes como especificação

### 🚀 Produtividade
- **Desenvolvimento mais rápido**: Feedback imediato
- **Debugging facilitado**: Isolamento de problemas
- **Onboarding**: Novos desenvolvedores entendem o código

### 🛡️ Confiabilidade
- **Estabilidade**: Interface mais robusta
- **Regressões**: Prevenção de quebras
- **Acessibilidade**: Aplicação inclusiva

---

## 📋 Checklist de Conclusão

### **Configuração Inicial**
- [ ] Estrutura de pastas criada
- [ ] Setup de testes configurado
- [ ] MSW configurado
- [ ] Dependências instaladas

### **Testes Unitários**
- [ ] Utilitários testados (100%)
- [ ] Hooks testados (100%)
- [ ] Serviços testados (90%)
- [ ] Componentes UI testados (95%)
- [ ] Contextos testados (100%)
- [ ] Páginas testadas (85%)
- [ ] Componentes de proteção testados (100%)

### **Testes de Integração**
- [ ] Fluxos principais testados
- [ ] Cenários de erro testados
- [ ] APIs mockadas completamente

### **Qualidade**
- [ ] Cobertura acima de 80%
- [ ] Testes de acessibilidade implementados
- [ ] Performance dos testes otimizada

### **Automação**
- [ ] Scripts de teste configurados
- [ ] Pre-commit hooks configurados
- [ ] CI/CD configurado
- [ ] Relatórios de cobertura automatizados

**🎉 Projeto de Testes Frontend Concluído com Sucesso!**

---

## 📝 Notas Importantes

### 🎯 Prioridades
1. **Alta**: Configuração inicial, hooks, contextos, componentes de proteção
2. **Média**: Componentes UI, páginas principais, serviços
3. **Baixa**: Testes de acessibilidade, otimizações de performance

### 🚨 Pontos de Atenção
- **React Query**: Requer setup especial para testes
- **React Router**: Necessita wrapper para testes
- **LocalStorage**: Deve ser mockado globalmente
- **Axios**: Interceptors precisam ser testados separadamente

### 💡 Dicas de Implementação
- Começar pelos testes mais simples (utilitários)
- Criar helpers reutilizáveis para setup
- Manter testes independentes e determinísticos
- Usar data-testid apenas quando necessário
- Priorizar testes que simulam comportamento do usuário