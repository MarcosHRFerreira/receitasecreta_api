# 🍰 Organizador de Receitas

## 📝 Descrição
O **Organizador de Receitas** é um sistema desenvolvido para facilitar a gestão e organização de receitas culinárias. Ideal para confeiteiros, cozinheiros e amantes da gastronomia, permite cadastrar, classificar, buscar e compartilhar receitas.

## 🚀 Funcionalidades

### 📌 Cadastro de Receitas
- Nome da receita.
- Ingredientes com medidas (ex.: 500g de farinha, 200g de açúcar).
- Modo de preparo, dividido em etapas.
- Tempo de preparo e rendimento (quantidade de porções).

### 📂 Classificação e Organização
- **Categorias**: Bolos, tortas, doces finos, etc.
- **Filtros**: Tempo de preparo, nível de dificuldade, tipo de ingrediente.
- **Favoritos**: Marcar receitas mais usadas.

### 📦 Gerenciamento de Estoque Integrado
- Relacionamento entre ingredientes e controle de estoque.
- Alertas para ingredientes em falta.

### 📝 Anotações Personalizadas
- Adição de dicas e ajustes nas receitas (ex.: “Adicionar mais canela”).

### 🔎 Busca Avançada
- Pesquisa por nome, ingrediente ou categoria.

### 📺 Modo de Exibição
- **Modo tela cheia**: Facilitar a visualização durante o preparo.
- **Impressão**: Gerar versões impressas para consulta offline.

### 🌐 Versão para Clientes (Opcional)
- Galeria de receitas públicas com descrições, fotos e opções de encomenda.

## 🛠️ Tecnologias Utilizadas
- **Java** (Back-end)
- **Spring Boot** (Framework)
- **PostgreSQL** (Banco de Dados)
- **React.js ou Angular** (Front-end)

## 📁 Estrutura do Projeto
O projeto está organizado em duas pastas principais:
- **BACKEND/**: Contém toda a API REST desenvolvida em Spring Boot
- **FRONTEND/**: Contém os arquivos e documentação relacionados ao front-end

## 📦 Como Executar o Projeto

### 📌 Pré-requisitos
- [Java 17+](https://www.oracle.com/java/)
- [Spring Boot](https://spring.io/projects/spring-boot)
- [PostgreSQL](https://www.postgresql.org/)
- [Node.js](https://nodejs.org/) (caso tenha um front-end integrado)

### 🔧 Instruções para Rodar

#### Backend
1. Clone o repositório:
   ```sh
   git clone https://github.com/seu-usuario/organizador-receitas.git
   ```

2. Navegue até a pasta do backend:
   ```sh
   cd receitasecreta_api/BACKEND
   ```

3. Execute o projeto:
   ```sh
   ./mvnw spring-boot:run
   ```

#### Frontend
1. Navegue até a pasta do frontend:
   ```sh
   cd receitasecreta_api/FRONTEND