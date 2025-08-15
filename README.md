# 🍰 Organizador de Receitas

## 📝 Descrição

O **Organizador de Receitas** é um sistema completo desenvolvido para facilitar a gestão e organização de receitas culinárias. Ideal para confeiteiros, cozinheiros e amantes da gastronomia, permite cadastrar, classificar, buscar e compartilhar receitas com segurança e eficiência.

## 🚀 Funcionalidades Implementadas

### 🔐 Sistema de Autenticação e Autorização

- **Registro de usuários** com validação de dados
- **Login seguro** com JWT (JSON Web Tokens)
- **Recuperação de senha** via e-mail SMTP
- **Controle de acesso** baseado em roles (USER, ADMIN)
- **Middleware de autenticação** para proteção de rotas

### 📧 Sistema de E-mail

- **Configuração SMTP** integrada com Hostinger
- **Envio de e-mails** para recuperação de senha
- **Templates HTML** personalizados para e-mails
- **Configuração automática** via scripts de ambiente

### 🗄️ Sistema de Banco de Dados

- **PostgreSQL** como banco principal (migrado do H2)
- **Flyway** para controle de versões e migrações
- **DataLoader** automático com dados de exemplo
- **Relacionamentos** otimizados entre entidades
- **Backup automático** antes de migrações críticas

### 📌 Cadastro de Receitas

- Nome da receita com validação
- Ingredientes com medidas precisas (ex.: 500g de farinha, 200ml de leite)
- Modo de preparo dividido em etapas detalhadas
- Tempo de preparo e rendimento (quantidade de porções)
- **Upload de imagens** para as receitas com CORS otimizado
- **Relacionamento automático** com produtos do estoque
- **Dados de exemplo** pré-carregados (bolo de chocolate, torta de maçã, etc.)

### 📂 Classificação e Organização

- **Categorias**: Bolos, tortas, doces finos, salgados, bebidas
- **Filtros avançados**: Tempo de preparo, nível de dificuldade, tipo de ingrediente
- **Sistema de favoritos**: Marcar receitas mais utilizadas
- **Tags personalizadas** para melhor organização

### 📦 Gerenciamento de Estoque Integrado

- Relacionamento entre ingredientes e controle de estoque
- Alertas automáticos para ingredientes em falta
- **Histórico de uso** de ingredientes
- **Cálculo automático** de custos por receita

### 📝 Anotações e Personalizações

- Adição de dicas e ajustes nas receitas
- **Histórico de modificações** nas receitas
- **Avaliações e comentários** dos usuários

### 🔎 Busca Avançada

- Pesquisa por nome, ingrediente, categoria ou tags
- **Filtros combinados** para busca precisa
- **Busca por similaridade** de ingredientes

### 📺 Interface e Experiência do Usuário

- **Design responsivo** com Tailwind CSS
- **Modo tela cheia** para visualização durante o preparo
- **Impressão otimizada** para consulta offline
- **Interface intuitiva** com componentes Shadcn UI

### 🌐 API REST Completa

- **Endpoints documentados** para todas as funcionalidades
- **Validação de dados** em todas as requisições
- **Tratamento de erros** padronizado
- **Logs detalhados** para monitoramento

## 🛠️ Tecnologias Utilizadas

### Backend

- **Java 17+** (Linguagem principal)
- **Spring Boot 3.x** (Framework principal)
- **Spring Security** (Autenticação e autorização)
- **Spring Data JPA** (Persistência de dados)
- **Spring Mail** (Envio de e-mails)
- **JWT** (JSON Web Tokens para autenticação)
- **PostgreSQL** (Banco de dados principal)
- **Flyway** (Controle de versão do banco de dados)
- **Maven** (Gerenciamento de dependências)
- **Lombok** (Redução de código boilerplate)

### Frontend

- **React 18+** (Biblioteca principal)
- **TypeScript** (Tipagem estática)
- **Vite** (Build tool e dev server)
- **Tailwind CSS** (Framework de estilos)
- **Shadcn UI** (Componentes de interface)
- **React Query** (Gerenciamento de estado servidor)
- **React Hook Form** (Gerenciamento de formulários)
- **Axios** (Cliente HTTP)
- **React Router** (Roteamento)

### Ferramentas de Desenvolvimento

- **Vitest** (Testes unitários frontend)
- **Jest** (Testes unitários backend)
- **ESLint** (Linting JavaScript/TypeScript)
- **Prettier** (Formatação de código)
- **Yarn** (Gerenciador de pacotes)

### Infraestrutura e Deploy

- **Git** (Controle de versão)
- **GitHub** (Repositório remoto)
- **Hostinger SMTP** (Serviço de e-mail)
- **Environment Variables** (Configuração segura)

## 📁 Estrutura do Projeto

```
receitasecreta_api/
├── BACKEND/                    # API REST Spring Boot
│   ├── src/main/java/         # Código fonte principal
│   │   ├── controllers/       # Controladores REST
│   │   ├── services/          # Lógica de negócio
│   │   ├── repositories/      # Acesso a dados
│   │   ├── entities/          # Entidades JPA
│   │   ├── config/            # Configurações
│   │   └── security/          # Configurações de segurança
│   ├── src/main/resources/    # Recursos e configurações
│   │   ├── db/migration/      # Scripts Flyway
│   │   └── application.yaml   # Configurações da aplicação
│   ├── src/test/              # Testes unitários e integração
│   ├── .env.example           # Exemplo de variáveis de ambiente
│   ├── CONFIGURACAO_ENV.md    # Documentação de configuração
│   ├── setup-env.bat          # Script de configuração Windows
│   └── setup-env.sh           # Script de configuração Linux/Mac
├── FRONTEND/                   # Aplicação React
│   ├── src/                   # Código fonte
│   │   ├── components/        # Componentes React
│   │   ├── pages/             # Páginas da aplicação
│   │   ├── services/          # Serviços de API
│   │   ├── contexts/          # Contextos React
│   │   ├── hooks/             # Hooks customizados
│   │   ├── types/             # Definições TypeScript
│   │   └── utils/             # Utilitários
│   ├── test/                  # Testes do frontend
│   ├── public/                # Arquivos públicos
│   ├── package.json           # Dependências Node.js
│   ├── vite.config.ts         # Configuração Vite
│   ├── vitest.config.ts       # Configuração de testes
│   └── tailwind.config.js     # Configuração Tailwind
└── README.md                   # Documentação principal
```

## 📦 Como Executar o Projeto

### 📌 Pré-requisitos

- [Java 17+](https://www.oracle.com/java/)
- [PostgreSQL 12+](https://www.postgresql.org/)
- [Node.js 18+](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/) (recomendado)
- [Git](https://git-scm.com/)

### 🔧 Configuração Inicial

#### 1. Clone o repositório

```bash
git clone https://github.com/MarcosHRFerreira/receitasecreta_api.git
cd receitasecreta_api
```

#### 2. Configuração do Banco de Dados

1. Crie um banco PostgreSQL:

   ```sql
   CREATE DATABASE receitas_db;
   ```

2. Configure as variáveis de ambiente do backend:
   ```bash
   cd BACKEND
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

#### 3. Executando o Backend

```bash
cd BACKEND

# Windows
.\setup-env.bat
.\mvnw spring-boot:run

# Linux/Mac
./setup-env.sh
./mvnw spring-boot:run
```

O backend estará disponível em: `http://localhost:8082`

#### 4. Executando o Frontend

```bash
cd FRONTEND

# Instalar dependências
yarn install

# Executar em modo desenvolvimento
yarn dev
```

O frontend estará disponível em: `http://localhost:5173`

### 🧪 Executando Testes

#### Testes Backend

```bash
cd BACKEND
./mvnw test
```

#### Testes Frontend

```bash
cd FRONTEND
yarn test
```

### 📧 Configuração de E-mail

Para habilitar o sistema de recuperação de senha:

1. Configure as variáveis SMTP no arquivo `.env`:

   ```env
   SMTP_HOST=smtp.hostinger.com
   SMTP_PORT=587
   SMTP_USERNAME=seu-email@dominio.com
   SMTP_PASSWORD=sua-senha
   SMTP_FROM=seu-email@dominio.com
   ```

2. Execute o script de configuração automática:

   ```bash
   # Windows
   .\setup-env.bat

   # Linux/Mac
   ./setup-env.sh
   ```

## 🆕 Inovações Recentes

### 📅 Atualizações de Hoje

#### 🗄️ Migração para PostgreSQL
- **Migração completa** do banco H2 para PostgreSQL
- **Configuração otimizada** no `application.yaml`
- **Dependências atualizadas** no `pom.xml`
- **Scripts Flyway** adaptados para PostgreSQL
- **Backup automático** realizado antes da migração

#### 🔧 Correções de CORS
- **Resolução de conflitos** de configuração CORS
- **Remoção de anotações** `@CrossOrigin` conflitantes
- **Configuração unificada** em `SecurityConfigurations.java` e `ResolverConfig.java`
- **Upload de imagens** funcionando corretamente
- **Origens específicas** configuradas para desenvolvimento

#### 📦 Sistema de Dados de Exemplo
- **DataLoader expandido** com produtos realistas (farinha, açúcar, ovos, leite, etc.)
- **Receitas de exemplo** implementadas (bolo de chocolate, torta de maçã, etc.)
- **Ingredientes automáticos** criados para cada receita
- **Relacionamentos** entre produtos, receitas e ingredientes
- **Dados consistentes** para testes e demonstrações

#### 🛠️ Melhorias Técnicas
- **Logs detalhados** para debugging
- **Configuração de ambiente** otimizada
- **Tratamento de erros** aprimorado
- **Performance** melhorada nas consultas
- **Documentação** atualizada

## 🚀 Status do Projeto

### ✅ Implementado

- [x] Sistema de autenticação completo (JWT)
- [x] Recuperação de senha via e-mail
- [x] CRUD de receitas
- [x] Sistema de categorias
- [x] Upload de imagens com correções de CORS
- [x] Busca avançada
- [x] Interface responsiva
- [x] Testes unitários
- [x] Migrações de banco de dados
- [x] Configuração de ambiente automatizada
- [x] Documentação completa
- [x] Migração completa para PostgreSQL
- [x] DataLoader com dados de exemplo (produtos e receitas)
- [x] Sistema de ingredientes integrado
- [x] Correções de configuração CORS para upload de arquivos

### 🔄 Em Desenvolvimento

- [ ] Sistema de favoritos
- [ ] Gerenciamento de estoque
- [ ] Modo offline
- [ ] Compartilhamento de receitas
- [ ] Sistema de avaliações

### 📋 Roadmap

- [ ] Aplicativo mobile
- [ ] Integração com redes sociais
- [ ] Sistema de recomendações
- [ ] Analytics e relatórios
- [ ] API pública

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Contato

- **Desenvolvedor**: Marcos Henrique
- **GitHub**: [@MarcosHRFerreira](https://github.com/MarcosHRFerreira)
- **E-mail**: marcoshrferreira@gmail.com

---

⭐ **Se este projeto foi útil para você, considere dar uma estrela no repositório!**
