# Logs de Autenticação - Guia de Análise

Este documento explica os logs implementados para análise de problemas de autenticação na aplicação.

## 📋 Logs Implementados

### 🔐 AuthContext (Contexto de Autenticação)

#### Inicialização
- `🔐 [AUTH] Inicializando autenticação...` - Início do processo de inicialização
- `🔐 [AUTH] Dados do localStorage:` - Mostra se há token e dados de usuário salvos
- `🔐 [AUTH] Tentando recuperar usuário do localStorage...` - Tentativa de recuperar dados
- `🔐 [AUTH] Usuário recuperado:` - Dados do usuário recuperados com sucesso
- `🔐 [AUTH] Autenticação restaurada com sucesso.` - Autenticação restaurada
- `🔐 [AUTH] Nenhum dado de autenticação encontrado no localStorage.` - Usuário não logado
- `🔐 [AUTH] Inicialização da autenticação concluída.` - Fim da inicialização

#### Login
- `🔐 [AUTH] Iniciando processo de login:` - Início do login com username
- `🔐 [AUTH] Enviando requisição de login para API...` - Requisição sendo enviada
- `🔐 [AUTH] Resposta da API recebida:` - Dados da resposta (token, usuário)
- `🔐 [AUTH] Login realizado com sucesso. Dados salvos no localStorage.` - Login bem-sucedido
- `🔐 [AUTH] Erro durante o login:` - Detalhes do erro ocorrido
- `🔐 [AUTH] Processo de login finalizado.` - Fim do processo

### 🌐 API Service (Serviço de API)

#### Interceptors
- `🌐 [API] Interceptor de requisição:` - Detalhes da requisição (URL, método, token)
- `🌐 [API] Token adicionado ao cabeçalho da requisição.` - Token incluído
- `🌐 [API] Nenhum token encontrado para adicionar à requisição.` - Sem token
- `🌐 [API] Resposta recebida:` - Detalhes da resposta (status, dados)
- `🌐 [API] Erro na resposta:` - Detalhes do erro HTTP
- `🌐 [API] Token expirado ou inválido (401). Limpando localStorage...` - Token inválido

#### Métodos de Autenticação
- `🌐 [API] Executando login:` - Início da chamada de login
- `🌐 [API] Login bem-sucedido:` - Login realizado com sucesso
- `🌐 [API] Erro no login:` - Erro na chamada de login
- `🌐 [API] Executando registro:` - Início da chamada de registro
- `🌐 [API] Registro bem-sucedido:` - Registro realizado com sucesso
- `🌐 [API] Erro no registro:` - Erro na chamada de registro

### 🔑 Login Component (Componente de Login)

- `🔑 [LOGIN] Iniciando processo de login no componente:` - Início do submit
- `🔑 [LOGIN] Chamando função login do AuthContext...` - Chamada para o contexto
- `🔑 [LOGIN] Login concluído com sucesso no componente.` - Login bem-sucedido
- `🔑 [LOGIN] Erro capturado no componente:` - Erro capturado
- `🔑 [LOGIN] Mensagem de erro definida:` - Mensagem de erro para o usuário
- `🔑 [LOGIN] Processo de login finalizado no componente.` - Fim do processo

#### Redirecionamento
- `🔑 [LOGIN] useEffect de redirecionamento:` - Estado atual para redirecionamento
- `🔑 [LOGIN] Condições atendidas para redirecionamento. Navegando para:` - Redirecionamento será executado
- `🔑 [LOGIN] Executando navegação para:` - Navegação sendo executada
- `🔑 [LOGIN] Limpando timer de redirecionamento.` - Limpeza do timer

## 🔍 Como Usar os Logs para Análise

### 1. Abrir o Console do Navegador
- Pressione `F12` ou `Ctrl+Shift+I`
- Vá para a aba "Console"

### 2. Filtrar Logs de Autenticação
Use os filtros do console para mostrar apenas logs relevantes:
- `🔐` - Logs do AuthContext
- `🌐` - Logs da API
- `🔑` - Logs do componente Login

### 3. Cenários Comuns de Análise

#### Problema: Login não funciona
1. Verifique se aparece `🔑 [LOGIN] Iniciando processo de login no componente`
2. Verifique se aparece `🌐 [API] Executando login`
3. Procure por erros em `🌐 [API] Erro no login` ou `🔐 [AUTH] Erro durante o login`

#### Problema: Usuário não permanece logado
1. Verifique `🔐 [AUTH] Dados do localStorage` na inicialização
2. Procure por `🔐 [AUTH] Dados corrompidos removidos do localStorage`
3. Verifique se há logs de token expirado (401)

#### Problema: Redirecionamento não funciona
1. Verifique `🔑 [LOGIN] useEffect de redirecionamento`
2. Confirme se `isAuthenticated` está `true`
3. Verifique se não há erros impedindo o redirecionamento

#### Problema: Token não é enviado nas requisições
1. Procure por `🌐 [API] Nenhum token encontrado para adicionar à requisição`
2. Verifique se o token está sendo salvo corretamente no localStorage

## 🚨 Logs de Erro Importantes

- **401 Unauthorized**: Token expirado ou inválido
- **403 Forbidden**: Usuário sem permissão
- **500 Internal Server Error**: Erro no servidor
- **Network Error**: Problema de conectividade

## 💡 Dicas

1. **Limpe o console** antes de testar para ver apenas logs relevantes
2. **Teste em modo incógnito** para simular usuário novo
3. **Verifique o localStorage** manualmente se necessário:
   ```javascript
   console.log('Token:', localStorage.getItem('token'));
   console.log('User:', localStorage.getItem('user'));
   ```
4. **Monitore a aba Network** para ver requisições HTTP
5. **Use breakpoints** no código se precisar de análise mais detalhada

## 🔧 Removendo os Logs

Quando não precisar mais dos logs, procure por:
- `console.log` com emojis 🔐, 🌐, 🔑
- `console.error` com os mesmos emojis
- `console.warn` com os mesmos emojis

E remova ou comente essas linhas para produção.