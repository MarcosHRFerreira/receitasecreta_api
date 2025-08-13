# 📋 Estudo: Implementação de Flyway Migrations

## 🎯 Objetivo
Implementar Flyway para controle de versão do banco de dados, garantindo que futuras alterações não deletem conteúdos existentes e permitam evolução controlada do schema.

## 📊 Análise do Estado Atual

### Configuração Atual
- **DDL Mode**: `spring.jpa.hibernate.ddl-auto: update`
- **Banco**: PostgreSQL
- **Problema**: Alterações no schema podem falhar ou causar inconsistências
- **Risco**: Perda de dados em alterações futuras

### Tabelas Identificadas

#### 1. **users**
```sql
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    login VARCHAR(255),
    password VARCHAR(255),
    email VARCHAR(255),
    role VARCHAR(255) CHECK (role IN ('ADMIN','USER')),
    created_at TIMESTAMP(6) NOT NULL,
    password_changed_at TIMESTAMP(6),
    password_changed_by VARCHAR(255)
);
```

#### 2. **password_reset_tokens**
```sql
CREATE TABLE password_reset_tokens (
    id VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_login VARCHAR(255) NOT NULL,
    expiry_date TIMESTAMP(6) NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP(6) NOT NULL
);
```

#### 3. **tb_produtos**
```sql
CREATE TABLE tb_produtos (
    produto_id UUID PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE,
    unidademedida VARCHAR(255) NOT NULL,
    custounidade DECIMAL,
    categoriaproduto VARCHAR(255),
    fornecedor VARCHAR(255),
    descricao VARCHAR(255),
    codigobarras VARCHAR(255),
    data_criacao TIMESTAMP(6) NOT NULL,
    data_alteracao TIMESTAMP(6) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6),
    updated_by VARCHAR(255)
);
```

#### 4. **tb_receitas**
```sql
CREATE TABLE tb_receitas (
    receita_id UUID PRIMARY KEY,
    categoria VARCHAR(255) NOT NULL CHECK (categoria IN ('BOLO','TORTA','SALGADO','SOBREMESA')),
    dificuldade VARCHAR(255) CHECK (dificuldade IN ('FACIL','COMPLEXA')),
    modopreparo VARCHAR(255) NOT NULL,
    nomereceita VARCHAR(255) NOT NULL,
    notas VARCHAR(255),
    rendimento VARCHAR(255) NOT NULL,
    tags VARCHAR(255),
    tempopreparo VARCHAR(255) NOT NULL,
    data_criacao TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6),
    user_id VARCHAR(255) NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_by VARCHAR(255)
);
```

#### 5. **tb_receita_ingrediente**
```sql
CREATE TABLE tb_receita_ingrediente (
    receita_id UUID NOT NULL,
    produto_id UUID NOT NULL,
    quantidade INTEGER NOT NULL,
    unidademedida VARCHAR(255) NOT NULL,
    PRIMARY KEY (receita_id, produto_id),
    FOREIGN KEY (produto_id) REFERENCES tb_produtos(produto_id)
);
```

## 🚀 Plano de Implementação

### **TASK 1: Configuração Inicial do Flyway**

#### 1.1 Adicionar Dependência
```xml
<!-- Adicionar ao pom.xml -->
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-database-postgresql</artifactId>
</dependency>
```

#### 1.2 Configurar application.yaml
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate  # Mudança crítica: de 'update' para 'validate'
  flyway:
    enabled: true
    baseline-on-migrate: true
    baseline-version: 0
    locations: classpath:db/migration
    sql-migration-prefix: V
    sql-migration-separator: __
    sql-migration-suffixes: .sql
```

#### 1.3 Criar Estrutura de Diretórios
```
src/main/resources/
└── db/
    └── migration/
        ├── V1__Create_initial_schema.sql
        ├── V2__Create_users_table.sql
        ├── V3__Create_password_reset_tokens_table.sql
        ├── V4__Create_produtos_table.sql
        ├── V5__Create_receitas_table.sql
        ├── V6__Create_receita_ingrediente_table.sql
        └── V7__Add_audit_columns.sql
```

### **TASK 2: Criação das Migrations Base**

#### 2.1 V1__Create_initial_schema.sql
```sql
-- Migration inicial para estabelecer baseline
-- Executada apenas se o banco estiver vazio

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Comentário de controle de versão
-- Flyway Baseline Migration
-- Data: 2025-01-13
-- Descrição: Schema inicial do sistema
```

#### 2.2 V2__Create_users_table.sql
```sql
-- Criação da tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    login VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    role VARCHAR(255) CHECK (role IN ('ADMIN','USER')),
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    password_changed_at TIMESTAMP(6),
    password_changed_by VARCHAR(255)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_login ON users(login);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_password_changed_at ON users(password_changed_at);
```

#### 2.3 V3__Create_password_reset_tokens_table.sql
```sql
-- Criação da tabela de tokens de reset de senha
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_login VARCHAR(255) NOT NULL,
    expiry_date TIMESTAMP(6) NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_login ON password_reset_tokens(user_login);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expiry_date ON password_reset_tokens(expiry_date);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_created_at ON password_reset_tokens(created_at);
```

#### 2.4 V4__Create_produtos_table.sql
```sql
-- Criação da tabela de produtos
CREATE TABLE IF NOT EXISTS tb_produtos (
    produto_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL UNIQUE,
    unidademedida VARCHAR(255) NOT NULL,
    custounidade DECIMAL,
    categoriaproduto VARCHAR(255),
    fornecedor VARCHAR(255),
    descricao VARCHAR(255),
    codigobarras VARCHAR(255),
    data_criacao TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_alteracao TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(255) NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6),
    updated_by VARCHAR(255)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_produtos_nome ON tb_produtos(nome);
CREATE INDEX IF NOT EXISTS idx_produtos_user_id ON tb_produtos(user_id);
CREATE INDEX IF NOT EXISTS idx_produtos_created_at ON tb_produtos(created_at);
CREATE INDEX IF NOT EXISTS idx_produtos_updated_at ON tb_produtos(updated_at);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON tb_produtos(categoriaproduto);
```

#### 2.5 V5__Create_receitas_table.sql
```sql
-- Criação da tabela de receitas
CREATE TABLE IF NOT EXISTS tb_receitas (
    receita_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    categoria VARCHAR(255) NOT NULL CHECK (categoria IN ('BOLO','TORTA','SALGADO','SOBREMESA')),
    dificuldade VARCHAR(255) CHECK (dificuldade IN ('FACIL','COMPLEXA')),
    modopreparo TEXT NOT NULL,
    nomereceita VARCHAR(255) NOT NULL,
    notas TEXT,
    rendimento VARCHAR(255) NOT NULL,
    tags VARCHAR(255),
    tempopreparo VARCHAR(255) NOT NULL,
    data_criacao TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6),
    user_id VARCHAR(255) NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_receitas_nome ON tb_receitas(nomereceita);
CREATE INDEX IF NOT EXISTS idx_receitas_categoria ON tb_receitas(categoria);
CREATE INDEX IF NOT EXISTS idx_receitas_dificuldade ON tb_receitas(dificuldade);
CREATE INDEX IF NOT EXISTS idx_receitas_user_id ON tb_receitas(user_id);
CREATE INDEX IF NOT EXISTS idx_receitas_created_at ON tb_receitas(created_at);
CREATE INDEX IF NOT EXISTS idx_receitas_updated_at ON tb_receitas(updated_at);
```

#### 2.6 V6__Create_receita_ingrediente_table.sql
```sql
-- Criação da tabela de relacionamento receita-ingrediente
CREATE TABLE IF NOT EXISTS tb_receita_ingrediente (
    receita_id UUID NOT NULL,
    produto_id UUID NOT NULL,
    quantidade INTEGER NOT NULL,
    unidademedida VARCHAR(255) NOT NULL,
    PRIMARY KEY (receita_id, produto_id)
);

-- Foreign Keys
ALTER TABLE tb_receita_ingrediente 
ADD CONSTRAINT IF NOT EXISTS fk_receita_ingrediente_produto 
FOREIGN KEY (produto_id) REFERENCES tb_produtos(produto_id) ON DELETE CASCADE;

ALTER TABLE tb_receita_ingrediente 
ADD CONSTRAINT IF NOT EXISTS fk_receita_ingrediente_receita 
FOREIGN KEY (receita_id) REFERENCES tb_receitas(receita_id) ON DELETE CASCADE;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_receita_ingrediente_receita_id ON tb_receita_ingrediente(receita_id);
CREATE INDEX IF NOT EXISTS idx_receita_ingrediente_produto_id ON tb_receita_ingrediente(produto_id);
```

### **TASK 3: Estratégia de Migração Segura**

#### 3.1 Backup Obrigatório
```bash
# Antes de qualquer migração
pg_dump -h localhost -U postgres -d receitasecreta > backup_pre_flyway_$(date +%Y%m%d_%H%M%S).sql
```

#### 3.2 Processo de Migração
1. **Parar aplicação**
2. **Fazer backup completo**
3. **Alterar configuração para validate**
4. **Executar flyway baseline**
5. **Iniciar aplicação**
6. **Validar funcionamento**

#### 3.3 Script de Migração
```bash
#!/bin/bash
# migrate_to_flyway.sh

echo "🔄 Iniciando migração para Flyway..."

# 1. Backup
echo "📦 Criando backup..."
pg_dump -h localhost -U postgres -d receitasecreta > "backup_$(date +%Y%m%d_%H%M%S).sql"

# 2. Parar aplicação
echo "⏹️ Parando aplicação..."
# pkill -f "spring-boot:run" || true

# 3. Executar baseline
echo "🚀 Executando Flyway baseline..."
mvn flyway:baseline -Dflyway.baselineVersion=1

# 4. Validar migrations
echo "✅ Validando migrations..."
mvn flyway:validate

echo "✨ Migração concluída!"
```

### **TASK 4: Migrations Futuras - Exemplos**

#### 4.1 V8__Add_produto_status_column.sql
```sql
-- Exemplo de adição de coluna
ALTER TABLE tb_produtos 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ATIVO' 
CHECK (status IN ('ATIVO', 'INATIVO', 'DESCONTINUADO'));

-- Atualizar registros existentes
UPDATE tb_produtos SET status = 'ATIVO' WHERE status IS NULL;

-- Tornar coluna obrigatória
ALTER TABLE tb_produtos ALTER COLUMN status SET NOT NULL;

-- Adicionar índice
CREATE INDEX IF NOT EXISTS idx_produtos_status ON tb_produtos(status);
```

#### 4.2 V9__Create_categorias_table.sql
```sql
-- Exemplo de nova tabela
CREATE TABLE IF NOT EXISTS tb_categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    cor VARCHAR(7), -- Hex color
    icone VARCHAR(50),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6)
);

-- Inserir categorias padrão
INSERT INTO tb_categorias (nome, descricao, cor) VALUES 
('Bolos', 'Receitas de bolos diversos', '#FF6B6B'),
('Tortas', 'Tortas doces e salgadas', '#4ECDC4'),
('Salgados', 'Petiscos e salgados', '#45B7D1'),
('Sobremesas', 'Doces e sobremesas', '#96CEB4')
ON CONFLICT (nome) DO NOTHING;
```

### **TASK 5: Configurações de Produção**

#### 5.1 application-prod.yaml
```yaml
spring:
  flyway:
    enabled: true
    baseline-on-migrate: false  # Não fazer baseline em produção
    validate-on-migrate: true
    clean-disabled: true        # CRÍTICO: Nunca permitir clean em produção
    out-of-order: false
    locations: classpath:db/migration
```

#### 5.2 Validações de Segurança
```java
@Component
@Profile("prod")
public class FlywayProductionValidator {
    
    @EventListener
    public void validateFlywayConfig(ApplicationReadyEvent event) {
        // Validar que clean está desabilitado
        // Validar que baseline-on-migrate está false
        // Log de configurações críticas
    }
}
```

### **TASK 6: Monitoramento e Rollback**

#### 6.1 Logs de Migration
```sql
-- Consultar histórico de migrations
SELECT * FROM flyway_schema_history ORDER BY installed_on DESC;

-- Verificar status
SELECT 
    version,
    description,
    type,
    script,
    installed_on,
    execution_time,
    success
FROM flyway_schema_history;
```

#### 6.2 Estratégia de Rollback
```sql
-- Exemplo de migration de rollback
-- V10__Rollback_produto_status.sql
-- ATENÇÃO: Rollbacks devem ser cuidadosamente planejados

-- Remover coluna (CUIDADO: perda de dados)
-- ALTER TABLE tb_produtos DROP COLUMN IF EXISTS status;

-- Ou marcar como deprecated
COMMENT ON COLUMN tb_produtos.status IS 'DEPRECATED: Será removido na versão 2.0';
```

## 🔒 Benefícios da Implementação

1. **Controle de Versão**: Histórico completo de mudanças
2. **Segurança**: Validação antes da aplicação
3. **Consistência**: Mesmo schema em todos os ambientes
4. **Auditoria**: Rastreabilidade de alterações
5. **Rollback Controlado**: Possibilidade de reverter mudanças
6. **Automação**: Integração com CI/CD

## ⚠️ Riscos e Mitigações

| Risco | Mitigação |
|-------|----------|
| Perda de dados | Backup obrigatório antes de migrations |
| Migration falha | Validação em ambiente de teste primeiro |
| Inconsistência | Usar transações e validações |
| Rollback complexo | Planejar rollbacks junto com migrations |
| Performance | Executar migrations em janela de manutenção |

## 📋 Checklist de Implementação

- [ ] **TASK 1**: Adicionar dependências Flyway
- [ ] **TASK 2**: Configurar application.yaml
- [ ] **TASK 3**: Criar estrutura de diretórios
- [ ] **TASK 4**: Criar migrations base (V1-V6)
- [ ] **TASK 5**: Fazer backup do banco atual
- [ ] **TASK 6**: Alterar DDL para 'validate'
- [ ] **TASK 7**: Executar flyway baseline
- [ ] **TASK 8**: Testar aplicação
- [ ] **TASK 9**: Criar migrations de exemplo
- [ ] **TASK 10**: Documentar processo para equipe
- [ ] **TASK 11**: Configurar ambiente de produção
- [ ] **TASK 12**: Implementar monitoramento

## 🎯 Próximos Passos

1. **Implementar TASK 1-3** (Configuração básica)
2. **Testar em ambiente local**
3. **Validar com dados de teste**
4. **Aplicar em desenvolvimento**
5. **Documentar processo**
6. **Treinar equipe**
7. **Aplicar em produção**

---

**Data de Criação**: 13/01/2025  
**Versão**: 1.0  
**Status**: Pronto para implementação  
**Prioridade**: Alta  
**Estimativa**: 2-3 dias de desenvolvimento + 1 dia de testes