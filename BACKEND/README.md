# 🍰 Organizador de Receitas - Backend

## 📝 Descrição
Este é o backend da aplicação **Organizador de Receitas**, desenvolvido em Spring Boot. Fornece uma API REST completa para gerenciamento de receitas, produtos, ingredientes e autenticação de usuários.

## 🛠️ Tecnologias Utilizadas
- **Java 21**
- **Spring Boot 3.4.4**
- **Spring Security** (Autenticação JWT)
- **Spring Data JPA** (Persistência)
- **PostgreSQL** (Banco de Dados)
- **Maven** (Gerenciamento de dependências)
- **Swagger/OpenAPI** (Documentação da API)

## 📦 Pré-requisitos
- [Java 21+](https://www.oracle.com/java/)
- [PostgreSQL](https://www.postgresql.org/)
- [Maven](https://maven.apache.org/) (opcional, pode usar o wrapper incluído)

## 🔧 Configuração do Banco de Dados
1. Instale e configure o PostgreSQL
2. Crie um banco de dados chamado `receitasecreta`
3. Configure as credenciais no arquivo `src/main/resources/application.yaml`:
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/receitasecreta
       username: postgres
       password: admin
   ```

## 🚀 Como Executar

### Usando Maven Wrapper (Recomendado)
```bash
# No Windows
.\mvnw.cmd spring-boot:run

# No Linux/Mac
./mvnw spring-boot:run
```

### Usando Maven Instalado
```bash
mvn spring-boot:run
```

## 📡 Endpoints da API
A aplicação será executada em: `http://localhost:8082/receitasecreta/`

### Documentação da API
- **Swagger UI**: `http://localhost:8082/receitasecreta/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8082/receitasecreta/v3/api-docs`

### Principais Endpoints
- **Autenticação**:
  - `POST /auth/login` - Login de usuário
  - `POST /auth/register` - Registro de usuário

- **Produtos**:
  - `GET /produtos` - Listar produtos
  - `POST /produtos` - Criar produto
  - `GET /produtos/{id}` - Buscar produto por ID
  - `PUT /produtos/{id}` - Atualizar produto

- **Receitas**:
  - `GET /receitas` - Listar receitas
  - `POST /receitas` - Criar receita
  - `GET /receitas/{id}` - Buscar receita por ID
  - `PUT /receitas/{id}` - Atualizar receita

- **Ingredientes de Receitas**:
  - `GET /receitasingredientes` - Listar ingredientes
  - `POST /receitasingredientes` - Adicionar ingrediente
  - `PUT /receitasingredientes` - Atualizar ingrediente
  - `DELETE /receitasingredientes` - Remover ingrediente

## 🔐 Autenticação
A API utiliza JWT (JSON Web Tokens) para autenticação. Para acessar endpoints protegidos:

1. Faça login em `/auth/login` com credenciais válidas
2. Use o token retornado no header `Authorization: Bearer {token}`

## 🏗️ Estrutura do Projeto
```
src/
├── main/
│   ├── java/br/com/marcosferreira/receitasecreta/api/
│   │   ├── configs/          # Configurações da aplicação
│   │   ├── controllers/      # Controllers REST
│   │   ├── dtos/            # Data Transfer Objects
│   │   ├── enums/           # Enumerações
│   │   ├── exceptions/      # Tratamento de exceções
│   │   ├── models/          # Entidades JPA
│   │   ├── repositories/    # Repositórios JPA
│   │   ├── security/        # Configurações de segurança
│   │   ├── services/        # Lógica de negócio
│   │   └── validations/     # Validadores customizados
│   └── resources/
│       └── application.yaml # Configurações da aplicação
└── test/                    # Testes unitários
```

## 🔧 Configurações Importantes
- **Porta**: 8082
- **Context Path**: `/receitasecreta/`
- **Perfil de Desenvolvimento**: Logs detalhados habilitados
- **JWT Secret**: Configurável via variável de ambiente `JWT_SECRET`

## 📝 Logs
Os logs da aplicação são configurados para mostrar:
- Queries SQL executadas
- Informações de debug do Spring Web
- Logs customizados da aplicação