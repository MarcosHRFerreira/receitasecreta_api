# 📋 Plano para Implementar Recuperação de Senha

Baseado na análise da estrutura atual do projeto, aqui está um plano completo para adicionar funcionalidade de recuperação de senha:

## 🎯 Visão Geral
O sistema atual possui:
- ✅ Autenticação JWT implementada
- ✅ Tela de login funcional
- ✅ Backend Spring Boot com PostgreSQL
- ✅ Frontend React com TypeScript
- ❌ **Falta**: Funcionalidade de recuperação de senha

## 🏗️ Arquitetura da Solução

### 1. **Backend (Spring Boot)**

#### 📦 **Dependências Necessárias**
Adicionar ao `pom.xml`:
```xml
<!-- Email -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>

<!-- Redis para cache de tokens (opcional) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

#### 🗃️ **Modelo de Dados**
Criar entidade `PasswordResetToken`:
```java
@Entity
@Table(name = "password_reset_tokens")
public class PasswordResetToken {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false, unique = true)
    private String token;
    
    @Column(nullable = false)
    private String userLogin;
    
    @Column(nullable = false)
    private LocalDateTime expiryDate;
    
    @Column(nullable = false)
    private boolean used = false;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    // Construtores, getters e setters
}
```

#### 🔧 **Novos Endpoints**
1. `POST /auth/forgot-password` - Solicitar recuperação
2. `POST /auth/reset-password` - Confirmar nova senha
3. `GET /auth/validate-reset-token/{token}` - Validar token

#### 📧 **Serviço de Email**
- Configurar SMTP (Gmail, SendGrid, etc.)
- Template de email para recuperação
- Geração de tokens seguros

### 2. **Frontend (React + TypeScript)**

#### 📱 **Novas Telas**
1. **Tela "Esqueci Minha Senha"** (`/forgot-password`)
   - Input para email/login
   - Validação de formulário
   - Feedback visual

2. **Tela "Redefinir Senha"** (`/reset-password/:token`)
   - Inputs para nova senha e confirmação
   - Validação de força da senha
   - Validação de token via URL

#### 🔗 **Modificações na Tela de Login**
- Link "Esqueci minha senha"
- Integração com as novas telas

## 📝 **Implementação Detalhada**

### **Fase 1: Backend**

#### 1. **Configuração de Email** (`application.yaml`)
```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${EMAIL_USERNAME}
    password: ${EMAIL_PASSWORD}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
```

#### 2. **Entidade PasswordResetToken**
```java
// Localização: src/main/java/br/com/marcosferreira/receitasecreta/api/models/PasswordResetToken.java
```

#### 3. **Repository**
```java
// Localização: src/main/java/br/com/marcosferreira/receitasecreta/api/repositories/PasswordResetTokenRepository.java
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, String> {
    Optional<PasswordResetToken> findByTokenAndUsedFalse(String token);
    void deleteByUserLoginAndUsedFalse(String userLogin);
    void deleteByExpiryDateBefore(LocalDateTime date);
}
```

#### 4. **Service**
```java
// Localização: src/main/java/br/com/marcosferreira/receitasecreta/api/services/PasswordResetService.java
@Service
public class PasswordResetService {
    // Métodos:
    // - requestPasswordReset(String login)
    // - validateResetToken(String token)
    // - resetPassword(String token, String newPassword)
    // - cleanupExpiredTokens()
}
```

#### 5. **Controller**
```java
// Adicionar ao AuthenticationController.java
@PostMapping("/forgot-password")
public ResponseEntity<Object> forgotPassword(@RequestBody ForgotPasswordRequest request)

@PostMapping("/reset-password")
public ResponseEntity<Object> resetPassword(@RequestBody ResetPasswordRequest request)

@GetMapping("/validate-reset-token/{token}")
public ResponseEntity<Object> validateResetToken(@PathVariable String token)
```

#### 6. **DTOs**
```java
// ForgotPasswordRequest.java
public record ForgotPasswordRequest(String login) {}

// ResetPasswordRequest.java
public record ResetPasswordRequest(String token, String newPassword) {}

// TokenValidationResponse.java
public record TokenValidationResponse(boolean valid, String message) {}
```

#### 7. **Email Service**
```java
@Service
public class EmailService {
    public void sendPasswordResetEmail(String userLogin, String resetToken);
}
```

### **Fase 2: Frontend**

#### 1. **Tipos TypeScript**
```typescript
// FRONTEND/src/types/index.ts
export interface ForgotPasswordRequest {
  login: string;
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
```

#### 2. **Serviços de API**
```typescript
// FRONTEND/src/services/api.ts
export const forgotPassword = async (data: ForgotPasswordRequest): Promise<void> => {
  // Implementação
};

export const resetPassword = async (data: ResetPasswordRequest): Promise<void> => {
  // Implementação
};

export const validateResetToken = async (token: string): Promise<TokenValidationResponse> => {
  // Implementação
};
```

#### 3. **Componente ForgotPassword**
```typescript
// FRONTEND/src/pages/ForgotPassword.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

interface ForgotPasswordFormData {
  login: string;
}

const ForgotPassword: React.FC = () => {
  // Implementação do formulário
  // Validações
  // Feedback visual
  // Loading states
};

export default ForgotPassword;
```

#### 4. **Componente ResetPassword**
```typescript
// FRONTEND/src/pages/ResetPassword.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  // Validação de token
  // Formulário de nova senha
  // Validação de força da senha
  // Redirecionamento após sucesso
};

export default ResetPassword;
```

#### 5. **Rotas**
```typescript
// FRONTEND/src/App.tsx
// Adicionar rotas:
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password/:token" element={<ResetPassword />} />
```

#### 6. **Modificar Login.tsx**
```typescript
// Adicionar após o botão de login:
<div className="text-center">
  <Link 
    to="/forgot-password" 
    className="text-sm text-blue-600 hover:text-blue-500"
  >
    Esqueci minha senha
  </Link>
</div>
```

## 🔐 **Segurança**

### 1. **Tokens seguros**:
- UUID aleatório de 36 caracteres
- Expiração em 1 hora
- Uso único (marcado como usado após utilização)
- Limpeza automática de tokens expirados

### 2. **Rate limiting**:
- Máximo 3 tentativas por hora por usuário
- Proteção contra spam de emails
- Log de tentativas suspeitas

### 3. **Validações**:
- Email/login deve existir no sistema
- Token deve ser válido e não expirado
- Nova senha deve atender critérios mínimos:
  - Mínimo 8 caracteres
  - Pelo menos 1 letra maiúscula
  - Pelo menos 1 letra minúscula
  - Pelo menos 1 número
  - Pelo menos 1 caractere especial

### 4. **Logs de Auditoria**:
- Registro de todas as tentativas de recuperação
- Logs de tokens gerados e utilizados
- Monitoramento de padrões suspeitos

## 📋 **Checklist de Implementação**

### Backend:
- [ ] Adicionar dependências de email ao pom.xml
- [ ] Criar entidade PasswordResetToken
- [ ] Implementar PasswordResetTokenRepository
- [ ] Criar PasswordResetService
- [ ] Implementar EmailService
- [ ] Adicionar endpoints ao AuthenticationController
- [ ] Criar DTOs (ForgotPasswordRequest, ResetPasswordRequest, etc.)
- [ ] Configurar SMTP no application.yaml
- [ ] Criar templates de email
- [ ] Implementar limpeza automática de tokens expirados
- [ ] Adicionar validações de segurança
- [ ] Implementar rate limiting
- [ ] Criar testes unitários
- [ ] Criar testes de integração

### Frontend:
- [ ] Criar tipos TypeScript
- [ ] Implementar serviços de API
- [ ] Criar página ForgotPassword
- [ ] Criar página ResetPassword
- [ ] Adicionar rotas no App.tsx
- [ ] Modificar tela de login (adicionar link)
- [ ] Implementar validações de formulário
- [ ] Adicionar feedback visual e loading states
- [ ] Implementar validação de força da senha
- [ ] Criar testes de componentes
- [ ] Testar integração com backend
- [ ] Validar responsividade mobile
- [ ] Testar acessibilidade

### Configuração:
- [ ] Configurar conta de email (Gmail/SendGrid)
- [ ] Definir variáveis de ambiente
- [ ] Configurar templates de email
- [ ] Testar envio de emails
- [ ] Configurar monitoramento

## 🚀 **Cronograma de Implementação**

### **Semana 1**
- **Dias 1-2**: Configuração e Backend
  - Configurar dependências
  - Implementar modelo de dados
  - Criar serviços básicos

- **Dias 3-4**: Backend Avançado
  - Implementar endpoints
  - Configurar email
  - Adicionar validações de segurança

- **Dia 5**: Testes Backend
  - Testes unitários
  - Testes de integração
  - Validação de segurança

### **Semana 2**
- **Dias 1-2**: Frontend Básico
  - Criar componentes
  - Implementar formulários
  - Adicionar rotas

- **Dias 3-4**: Frontend Avançado
  - Integração com API
  - Validações e feedback
  - Testes de componentes

- **Dia 5**: Integração e Deploy
  - Testes end-to-end
  - Ajustes finais
  - Deploy e validação

**Tempo estimado total**: 2 semanas

## 💡 **Considerações Adicionais**

### **UX/UI**:
- Mensagens claras e amigáveis
- Feedback visual imediato
- Loading states durante operações
- Confirmações de sucesso
- Tratamento elegante de erros

### **Acessibilidade**:
- Labels apropriados para screen readers
- Navegação por teclado
- Contraste adequado
- Mensagens de erro acessíveis

### **Mobile**:
- Design responsivo
- Touch-friendly
- Teclado apropriado para email
- Validação em tempo real

### **Monitoramento**:
- Logs estruturados
- Métricas de uso
- Alertas para uso excessivo
- Dashboard de monitoramento

### **Manutenção**:
- Documentação completa
- Testes automatizados
- CI/CD pipeline
- Backup de configurações

## 🔧 **Configurações de Ambiente**

### **Desenvolvimento**
```yaml
# application-dev.yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${EMAIL_USERNAME:test@gmail.com}
    password: ${EMAIL_PASSWORD:app-password}
    properties:
      mail.smtp.auth: true
      mail.smtp.starttls.enable: true

app:
  password-reset:
    token-expiry-hours: 1
    max-attempts-per-hour: 3
    cleanup-interval-hours: 24
```

### **Produção**
```yaml
# application-prod.yaml
spring:
  mail:
    host: ${SMTP_HOST}
    port: ${SMTP_PORT:587}
    username: ${EMAIL_USERNAME}
    password: ${EMAIL_PASSWORD}
    properties:
      mail.smtp.auth: true
      mail.smtp.starttls.enable: true
      mail.smtp.ssl.trust: ${SMTP_HOST}

app:
  password-reset:
    token-expiry-hours: ${TOKEN_EXPIRY_HOURS:1}
    max-attempts-per-hour: ${MAX_ATTEMPTS_PER_HOUR:3}
    cleanup-interval-hours: ${CLEANUP_INTERVAL_HOURS:24}
```

## 📚 **Recursos e Referências**

### **Documentação**:
- [Spring Boot Mail](https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.email)
- [React Hook Form](https://react-hook-form.com/)
- [JWT Security Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

### **Bibliotecas Úteis**:
- `react-hook-form` - Gerenciamento de formulários
- `zxcvbn` - Validação de força da senha
- `react-hot-toast` - Notificações
- `lucide-react` - Ícones

### **Ferramentas de Teste**:
- `@testing-library/react` - Testes de componentes
- `msw` - Mock Service Worker para testes
- `jest` - Framework de testes
- `testcontainers` - Testes de integração com banco

Este plano garante uma implementação robusta, segura e user-friendly da funcionalidade de recuperação de senha, seguindo as melhores práticas de desenvolvimento e segurança.