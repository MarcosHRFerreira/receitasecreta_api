# Estudo: Controle de Autorização para Receitas e Produtos

## 📋 Situação Atual

### Problemas Identificados

1. **Ausência de Campo de Propriedade**: Os modelos `ReceitaModel` e `ProdutoModel` não possuem campos que identifiquem o usuário criador (como `userId` ou `createdBy`).

2. **Falta de Validação de Autorização**: Os controllers de receitas e produtos não verificam se o usuário logado é o proprietário do registro antes de permitir alterações.

3. **Segurança Vulnerável**: Qualquer usuário autenticado pode modificar receitas e produtos criados por outros usuários.

### Estrutura Atual dos Modelos

#### ReceitaModel

- `receitaId` (UUID)
- `nomeReceita` (String)
- `tags` (String)
- `favorita` (Boolean)
- `dataCriacao` (LocalDateTime)
- **❌ Ausente**: Campo de identificação do usuário criador

#### ProdutoModel

- `produtoId` (UUID)
- `nome` (String)
- `unidademedida` (String)
- `custoporunidade` (BigDecimal)
- `categoriaproduto` (String)
- `fornecedor` (String)
- `descricao` (String)
- `codigobarras` (String)
- **❌ Ausente**: Campo de identificação do usuário criador

### Controllers Atuais

#### ReceitaController

- `POST /receitas` - Criar receita (sem associar ao usuário)
- `GET /receitas/{id}` - Buscar receita (sem verificação de propriedade)
- `PUT /receitas/{id}` - Atualizar receita (sem verificação de propriedade)
- `GET /receitas` - Listar todas as receitas

#### ProdutoController

- `POST /produtos` - Criar produto (sem associar ao usuário)
- `GET /produtos/{id}` - Buscar produto (sem verificação de propriedade)
- `PUT /produtos/{id}` - Atualizar produto (sem verificação de propriedade)
- `GET /produtos` - Listar todos os produtos

## 🎯 Objetivos da Implementação

1. **Associar Registros ao Usuário**: Garantir que receitas e produtos sejam associados ao usuário que os criou.
2. **Controle de Autorização**: Permitir que apenas o usuário criador possa modificar seus próprios registros.
3. **Segurança Aprimorada**: Implementar verificações de segurança nos endpoints de modificação.
4. **Experiência do Usuário**: Manter a funcionalidade atual enquanto adiciona segurança.

## 🛠️ Implementações Necessárias

### 1. Modificação dos Modelos

#### 1.1 ReceitaModel

```java
@Entity
@Table(name = "receitas")
public class ReceitaModel {
    // ... campos existentes ...

    @Column(name = "user_id", nullable = false)
    private String userId; // ID do usuário criador

    @Column(name = "created_by", nullable = false)
    private String createdBy; // Login do usuário criador

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt; // Data e hora de criação

    @Column(name = "updated_at")
    private LocalDateTime updatedAt; // Data e hora da última atualização

    @Column(name = "updated_by")
    private String updatedBy; // Login do usuário que fez a última atualização

    // Getters e Setters
}
```

#### 1.2 ProdutoModel

```java
@Entity
@Table(name = "produtos")
public class ProdutoModel {
    // ... campos existentes ...

    @Column(name = "user_id", nullable = false)
    private String userId; // ID do usuário criador

    @Column(name = "created_by", nullable = false)
    private String createdBy; // Login do usuário criador

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt; // Data e hora de criação

    @Column(name = "updated_at")
    private LocalDateTime updatedAt; // Data e hora da última atualização

    @Column(name = "updated_by")
    private String updatedBy; // Login do usuário que fez a última atualização

    // Getters e Setters
}
```

#### 1.3 User Model (Auditoria de Senha)

```java
@Entity
@Table(name = "users")
public class User implements UserDetails {
    // ... campos existentes ...

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt; // Data e hora de cadastro do usuário

    @Column(name = "password_changed_at")
    private LocalDateTime passwordChangedAt; // Data e hora da última alteração de senha

    @Column(name = "password_changed_by")
    private String passwordChangedBy; // Quem alterou a senha (próprio usuário ou admin)

    // Getters e Setters

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        passwordChangedAt = LocalDateTime.now();
        passwordChangedBy = this.login; // Usuário criou sua própria senha
    }

    public void updatePassword(String newPassword, String changedBy) {
        this.password = newPassword;
        this.passwordChangedAt = LocalDateTime.now();
        this.passwordChangedBy = changedBy;
    }
}
```

### 2. Utilitário para Obter Usuário Logado

#### 2.1 AuthenticationUtils

```java
@Component
public class AuthenticationUtils {

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return (User) authentication.getPrincipal();
        }
        throw new RuntimeException("Usuário não autenticado");
    }

    public String getCurrentUserId() {
        return getCurrentUser().getId();
    }

    public String getCurrentUserLogin() {
        return getCurrentUser().getLogin();
    }
}
```

### 3. Modificação dos Services

#### 3.1 ReceitaService

```java
@Service
public class ReceitaServiceImpl implements ReceitaService {

    private final AuthenticationUtils authUtils;

    @Override
    public ReceitaModel save(ReceitaRecordDto receitaDto) {
        User currentUser = authUtils.getCurrentUser();

        ReceitaModel receita = new ReceitaModel();
        // ... mapear campos do DTO ...
        receita.setUserId(currentUser.getId());
        receita.setCreatedBy(currentUser.getLogin());
        receita.setCreatedAt(LocalDateTime.now());
        receita.setDataCriacao(LocalDateTime.now()); // Campo existente

        return receitaRepository.save(receita);
    }

    @Override
    public ReceitaModel update(ReceitaRecordDto receitaDto, UUID receitaId) {
        ReceitaModel receita = findByReceitaId(receitaId);
        User currentUser = authUtils.getCurrentUser();

        // Verificar se o usuário é o proprietário
        if (!receita.getUserId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Você não tem permissão para alterar esta receita");
        }

        // ... atualizar campos ...
        receita.setUpdatedAt(LocalDateTime.now());
        receita.setUpdatedBy(currentUser.getLogin());

        return receitaRepository.save(receita);
    }
}
```

#### 3.2 ProdutoService

```java
@Service
public class ProdutoServiceImpl implements ProdutoService {

    private final AuthenticationUtils authUtils;

    @Override
    public ProdutoModel save(ProdutoRecordDto produtoDto) {
        User currentUser = authUtils.getCurrentUser();

        ProdutoModel produto = new ProdutoModel();
        // ... mapear campos do DTO ...
        produto.setUserId(currentUser.getId());
        produto.setCreatedBy(currentUser.getLogin());
        produto.setCreatedAt(LocalDateTime.now());

        return produtoRepository.save(produto);
    }

    @Override
    public ProdutoModel update(ProdutoRecordDto produtoDto, UUID produtoId) {
        ProdutoModel produto = findByProdutoId(produtoId);
        User currentUser = authUtils.getCurrentUser();

        // Verificar se o usuário é o proprietário
        if (!produto.getUserId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Você não tem permissão para alterar este produto");
        }

        // ... atualizar campos ...
        produto.setUpdatedAt(LocalDateTime.now());
        produto.setUpdatedBy(currentUser.getLogin());

        return produtoRepository.save(produto);
    }
}
```

### 4. Exception Customizada

#### 4.1 UnauthorizedException

```java
@ResponseStatus(HttpStatus.FORBIDDEN)
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
```

### 5. Modificação dos Controllers

#### 5.1 ReceitaController

```java
@RestController
@RequestMapping("/receitas")
public class ReceitaController {

    @PutMapping("/{receitaId}")
    public ResponseEntity<Object> update(
            @PathVariable(value = "receitaId") UUID receitaId,
            @RequestBody ReceitaRecordDto receitaRecordDto) {

        try {
            ReceitaModel receita = receitaService.update(receitaRecordDto, receitaId);
            return ResponseEntity.ok(receita);
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Erro ao atualizar receita"));
        }
    }
}
```

#### 5.2 ProdutoController

```java
@RestController
@RequestMapping("/produtos")
public class ProdutoController {

    @PutMapping("/{produtoId}")
    public ResponseEntity<Object> update(
            @PathVariable(value = "produtoId") UUID produtoId,
            @RequestBody ProdutoRecordDto produtoRecordDto) {

        try {
            ProdutoModel produto = produtoService.update(produtoRecordDto, produtoId);
            return ResponseEntity.ok(produto);
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Erro ao atualizar produto"));
        }
    }
}
```

### 6. Modificações no Banco de Dados

#### 6.1 Migration para Receitas

```sql
ALTER TABLE receitas
ADD COLUMN user_id VARCHAR(255) NOT NULL DEFAULT 'system',
ADD COLUMN created_by VARCHAR(255) NOT NULL DEFAULT 'system',
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP NULL,
ADD COLUMN updated_by VARCHAR(255) NULL;

-- Criar índices para melhor performance
CREATE INDEX idx_receitas_user_id ON receitas(user_id);
CREATE INDEX idx_receitas_created_at ON receitas(created_at);
CREATE INDEX idx_receitas_updated_at ON receitas(updated_at);
```

#### 6.2 Migration para Produtos

```sql
ALTER TABLE produtos
ADD COLUMN user_id VARCHAR(255) NOT NULL DEFAULT 'system',
ADD COLUMN created_by VARCHAR(255) NOT NULL DEFAULT 'system',
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP NULL,
ADD COLUMN updated_by VARCHAR(255) NULL;

-- Criar índices para melhor performance
CREATE INDEX idx_produtos_user_id ON produtos(user_id);
CREATE INDEX idx_produtos_created_at ON produtos(created_at);
CREATE INDEX idx_produtos_updated_at ON produtos(updated_at);
```

#### 6.3 Migration para Users (Auditoria de Senha)

```sql
ALTER TABLE users
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN password_changed_at TIMESTAMP NULL,
ADD COLUMN password_changed_by VARCHAR(255) NULL;

-- Atualizar registros existentes
UPDATE users
SET password_changed_at = created_at,
    password_changed_by = login
WHERE password_changed_at IS NULL;

-- Criar índices para auditoria
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_password_changed_at ON users(password_changed_at);
```

### 7. Considerações para Listagem

#### 7.1 Opção 1: Mostrar Apenas Registros do Usuário

```java
@Override
public Page<ReceitaModel> findAll(Pageable pageable) {
    String currentUserId = authUtils.getCurrentUserId();
    return receitaRepository.findByUserId(currentUserId, pageable);
}
```

#### 7.2 Opção 2: Mostrar Todos com Indicação de Propriedade

```java
@Override
public Page<ReceitaResponse> findAll(Pageable pageable) {
    String currentUserId = authUtils.getCurrentUserId();
    Page<ReceitaModel> receitas = receitaRepository.findAll(pageable);

    return receitas.map(receita -> {
        ReceitaResponse response = new ReceitaResponse(receita);
        response.setIsOwner(receita.getUserId().equals(currentUserId));
        response.setCanEdit(receita.getUserId().equals(currentUserId));
        return response;
    });
}
```

## 🔄 Plano de Implementação

### Fase 1: Preparação

1. ✅ Criar o utilitário `AuthenticationUtils`
2. ✅ Criar a exception `UnauthorizedException`
3. ✅ Executar migrations no banco de dados

### Fase 2: Modelos

1. ✅ Adicionar campos `userId` e `createdBy` aos modelos
2. ✅ Atualizar construtores e métodos
3. ✅ Testar persistência

### Fase 3: Services

1. ✅ Modificar métodos `save()` para associar ao usuário
2. ✅ Modificar métodos `update()` para verificar propriedade
3. ✅ Atualizar métodos de listagem conforme necessário

### Fase 4: Controllers

1. ✅ Adicionar tratamento de exceções nos endpoints de update
2. ✅ Testar responses de erro
3. ✅ Validar comportamento dos endpoints

### Fase 5: Frontend (Opcional)

1. ✅ Atualizar interfaces para mostrar indicação de propriedade
2. ✅ Desabilitar botões de edição para registros não próprios
3. ✅ Tratar erros 403 (Forbidden) adequadamente

### Fase 6: Testes

1. ✅ Testes unitários para services
2. ✅ Testes de integração para controllers
3. ✅ Testes de segurança

## 📊 Auditoria e Rastreabilidade

### Campos de Auditoria Implementados

#### Para Usuários (User)

- **created_at**: Data e hora de cadastro do usuário no sistema
- **password_changed_at**: Data e hora da última alteração de senha
- **password_changed_by**: Identificação de quem alterou a senha (próprio usuário ou administrador)

#### Para Receitas (ReceitaModel)

- **created_at**: Data e hora de criação da receita
- **created_by**: Login do usuário que criou a receita
- **updated_at**: Data e hora da última modificação
- **updated_by**: Login do usuário que fez a última modificação
- **user_id**: ID do usuário proprietário da receita

#### Para Produtos (ProdutoModel)

- **created_at**: Data e hora de criação do produto
- **created_by**: Login do usuário que criou o produto
- **updated_at**: Data e hora da última modificação
- **updated_by**: Login do usuário que fez a última modificação
- **user_id**: ID do usuário proprietário do produto

### Benefícios da Auditoria

1. **Rastreabilidade Completa**: Saber quando e por quem cada ação foi realizada
2. **Compliance**: Atendimento a requisitos de auditoria e regulamentações
3. **Segurança**: Identificação de atividades suspeitas ou não autorizadas
4. **Debugging**: Facilita a investigação de problemas e inconsistências
5. **Histórico**: Manutenção de histórico completo de alterações

### Implementação de Auditoria Automática

#### Service de Auditoria

```java
@Service
public class AuditService {

    public void auditPasswordChange(String userId, String changedBy, String reason) {
        // Log da alteração de senha
        log.info("Password changed for user: {} by: {} reason: {}", userId, changedBy, reason);

        // Salvar em tabela de auditoria se necessário
        // auditRepository.save(new AuditLog("PASSWORD_CHANGE", userId, changedBy, reason));
    }

    public void auditReceitaChange(String receitaId, String action, String userId) {
        log.info("Receita {} action: {} by user: {}", receitaId, action, userId);
    }

    public void auditProdutoChange(String produtoId, String action, String userId) {
        log.info("Produto {} action: {} by user: {}", produtoId, action, userId);
    }
}
```

#### Interceptor de Auditoria

```java
@Component
public class AuditInterceptor {

    @EventListener
    public void handlePasswordReset(PasswordResetEvent event) {
        User user = event.getUser();
        user.updatePassword(event.getNewPassword(), "PASSWORD_RESET");
        userRepository.save(user);

        auditService.auditPasswordChange(user.getId(), "SYSTEM", "Password reset via email");
    }
}
```

### Relatórios de Auditoria

#### Consultas Úteis

```sql
-- Usuários cadastrados nos últimos 30 dias
SELECT login, created_at
FROM users
WHERE created_at >= NOW() - INTERVAL 30 DAY
ORDER BY created_at DESC;

-- Alterações de senha nos últimos 7 dias
SELECT login, password_changed_at, password_changed_by
FROM users
WHERE password_changed_at >= NOW() - INTERVAL 7 DAY
ORDER BY password_changed_at DESC;

-- Receitas mais modificadas
SELECT nome_receita, created_by, updated_by, updated_at
FROM receitas
WHERE updated_at IS NOT NULL
ORDER BY updated_at DESC;

-- Produtos criados por usuário
SELECT u.login, COUNT(p.produto_id) as total_produtos
FROM users u
LEFT JOIN produtos p ON u.id = p.user_id
GROUP BY u.id, u.login
ORDER BY total_produtos DESC;
```

## 🚨 Considerações Importantes

### Segurança

- **Validação no Backend**: Nunca confiar apenas no frontend para controle de acesso
- **Logs de Auditoria**: Registrar tentativas de acesso não autorizado
- **Rate Limiting**: Considerar implementar para prevenir ataques

### Performance

- **Índices**: Criar índices nos campos `user_id` para melhor performance
- **Paginação**: Manter paginação eficiente mesmo com filtros por usuário
- **Cache**: Considerar cache para dados frequentemente acessados

### Experiência do Usuário

- **Mensagens Claras**: Fornecer mensagens de erro compreensíveis
- **Indicadores Visuais**: Mostrar claramente quais registros o usuário pode editar
- **Feedback**: Confirmar ações de criação e edição

### Migração de Dados Existentes

- **Dados Legados**: Definir estratégia para registros sem proprietário
- **Usuário Sistema**: Criar usuário "system" para registros antigos
- **Backup**: Sempre fazer backup antes de executar migrations

## 📊 Benefícios Esperados

1. **Segurança Aprimorada**: Proteção contra modificações não autorizadas
2. **Isolamento de Dados**: Cada usuário trabalha com seus próprios dados
3. **Auditoria**: Rastreabilidade de quem criou cada registro
4. **Escalabilidade**: Preparação para crescimento da base de usuários
5. **Compliance**: Atendimento a requisitos de segurança e privacidade

## 🔍 Monitoramento e Métricas

### Integração com Módulo de Recuperação de Senha

#### Atualização do PasswordResetService

```java
@Service
public class PasswordResetService {

    private final AuditService auditService;

    @Transactional
    public void resetPassword(String token, String newPassword) {
        // ... validações existentes ...

        User user = (User) userDetails;

        // Usar o novo método de auditoria
        user.updatePassword(encryptedPassword, "PASSWORD_RESET");
        userRepository.save(user);

        // Registrar auditoria
        auditService.auditPasswordChange(user.getId(), "SYSTEM", "Password reset via email token");

        // ... resto do código ...
    }
}
```

#### Atualização do AuthenticationService

```java
@Service
public class AuthenticationServiceImpl implements AuthenticationService {

    private final AuditService auditService;

    @Override
    public void register(UserRequest data) {
        // ... validações existentes ...

        String encryptedPassword = new BCryptPasswordEncoder().encode(data.password());
        User newUser = new User(data.login(), encryptedPassword, data.email(), data.role());

        // O @PrePersist já define created_at e password_changed_at
        User savedUser = repository.save(newUser);

        // Registrar auditoria do cadastro
        auditService.auditPasswordChange(savedUser.getId(), savedUser.getLogin(), "Initial user registration");
    }
}
```

### Logs a Implementar

- Tentativas de acesso não autorizado
- Criação de novos registros com associação de usuário
- Modificações realizadas com sucesso
- Erros de autorização
- Alterações de senha (reset, mudança manual)
- Cadastro de novos usuários

### Dashboard de Auditoria

#### Endpoint para Relatórios de Auditoria

```java
@RestController
@RequestMapping("/api/audit")
public class AuditController {

    private final AuditService auditService;

    @GetMapping("/users/recent")
    public ResponseEntity<List<UserAuditResponse>> getRecentUsers(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(auditService.getRecentUsers(days));
    }

    @GetMapping("/password-changes")
    public ResponseEntity<List<PasswordChangeAuditResponse>> getPasswordChanges(
            @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(auditService.getPasswordChanges(days));
    }

    @GetMapping("/user/{userId}/activity")
    public ResponseEntity<UserActivityResponse> getUserActivity(
            @PathVariable String userId,
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(auditService.getUserActivity(userId, days));
    }
}
```

#### DTOs para Auditoria

```java
public record UserAuditResponse(
    String userId,
    String login,
    String email,
    LocalDateTime createdAt,
    LocalDateTime lastPasswordChange,
    int totalReceitas,
    int totalProdutos
) {}

public record PasswordChangeAuditResponse(
    String userId,
    String login,
    LocalDateTime changedAt,
    String changedBy,
    String reason
) {}

public record UserActivityResponse(
    String userId,
    String login,
    LocalDateTime lastLogin,
    int receitasCreated,
    int receitasUpdated,
    int produtosCreated,
    int produtosUpdated,
    List<ActivityLogResponse> recentActivity
) {}
```

### Métricas a Acompanhar

- Número de tentativas de acesso não autorizado por dia
- Tempo médio de resposta dos endpoints protegidos
- Distribuição de receitas/produtos por usuário
- Taxa de sucesso vs erro nas operações de CRUD
- Frequência de alterações de senha
- Usuários mais ativos (criação/edição de conteúdo)
- Horários de pico de atividade no sistema

---

**Data do Estudo**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Status**: Análise Completa - Pronto para Implementação
**Prioridade**: Alta - Questão de Segurança Crítica
