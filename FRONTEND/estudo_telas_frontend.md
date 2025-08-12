# Estudo de Telas para o Frontend (React + TypeScript)

Este documento lista as telas necessárias para consumir o backend do projeto `receitasecreta_api`, com base nos controllers e endpoints encontrados.

## 1. Autenticação
- **Tela de Login**
  - Formulário de login (usuário/senha)
  - Consome: `POST /auth/login`
- **Tela de Registro**
  - Formulário de cadastro de usuário
  - Consome: `POST /auth/register`

## 2. Usuários
- **Lista de Usuários**
  - Exibe todos os usuários
  - Consome: `GET /users`

## 3. Produtos
- **Lista de Produtos**
  - Exibe todos os produtos (com paginação)
  - Consome: `GET /produtos`
- **Detalhe do Produto**
  - Exibe detalhes de um produto
  - Consome: `GET /produtos/{produtoId}`
- **Cadastro/Edição de Produto**
  - Formulário para criar ou editar produto
  - Consome: `POST /produtos`, `PUT /produtos/{produtoId}`

## 4. Receitas
- **Lista de Receitas**
  - Exibe todas as receitas (com paginação)
  - Consome: `GET /receitas`
- **Detalhe da Receita**
  - Exibe detalhes de uma receita
  - Consome: `GET /receitas/{receitaId}`
- **Cadastro/Edição de Receita**
  - Formulário para criar ou editar receita
  - Consome: `POST /receitas`, `PUT /receitas/{receitaId}`

## 5. Ingredientes da Receita
- **Lista de Ingredientes de Receita**
  - Exibe todos os ingredientes das receitas (com paginação)
  - Consome: `GET /receitasingredientes`
- **Cadastro/Edição de Ingrediente de Receita**
  - Formulário para adicionar ou editar ingrediente em uma receita
  - Consome: `POST /receitasingredientes`, `PUT /receitasingredientes`
- **Remover Ingrediente de Receita**
  - Ação para remover ingrediente
  - Consome: `DELETE /receitasingredientes`

---

## Sugestão de Tarefas para Desenvolvimento
1. Criar estrutura base do projeto React + TypeScript
2. Implementar autenticação (login e registro)
3. Implementar CRUD de usuários
4. Implementar CRUD de produtos
5. Implementar CRUD de receitas
6. Implementar CRUD de ingredientes de receita
7. Implementar navegação e proteção de rotas
8. Implementar layout responsivo e UX

> **Obs:** Ajustar telas conforme regras de negócio e necessidades do usuário final.
