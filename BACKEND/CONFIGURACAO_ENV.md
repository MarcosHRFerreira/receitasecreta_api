# 📧 Configuração do Arquivo .env

## ⚠️ IMPORTANTE
O arquivo `.env` não é versionado no Git por questões de segurança. Após fazer um `git pull` ou `git clone`, você precisa recriar este arquivo.

## 🔧 Como Configurar

### 1. Copie o arquivo de exemplo
```bash
cp .env.example .env
```

### 2. Configure as variáveis de ambiente
Edite o arquivo `.env` com suas configurações:

```env
# Configurações do Frontend
FRONTEND_URL=http://localhost:5173

# Configurações de Email SMTP
# IMPORTANTE: Configure com suas credenciais reais
EMAIL_USERNAME=seu_email@gmail.com
EMAIL_PASSWORD=sua_senha_de_app_gmail

# Configurações JWT
JWT_SECRET=batman batman batman

# Configurações de Recuperação de Senha (opcional)
TOKEN_EXPIRY_HOURS=1
MAX_ATTEMPTS_PER_HOUR=3
CLEANUP_INTERVAL_HOURS=24
```

## 📧 Configuração do Gmail

Para usar o Gmail como provedor de email:

1. **Ative a verificação em duas etapas** na sua conta Google
2. **Gere uma senha de app específica**:
   - Acesse: https://myaccount.google.com/apppasswords
   - Selecione "Mail" como aplicativo
   - Copie a senha gerada (16 caracteres)
3. **Configure no .env**:
   - `EMAIL_USERNAME`: Seu email Gmail completo
   - `EMAIL_PASSWORD`: A senha de app gerada (não sua senha normal)

## 🔒 Segurança

- ❌ **NUNCA** commite o arquivo `.env` no Git
- ❌ **NUNCA** compartilhe suas credenciais de email
- ✅ Use senhas de app específicas para aplicações
- ✅ Mantenha o `.env` no `.gitignore`

## 🚀 Após Configurar

Reinicie o backend para aplicar as configurações:
```bash
./mvnw spring-boot:run
```

## 🆘 Problemas Comuns

### Erro: "Authentication failed"
- Verifique se a verificação em duas etapas está ativa
- Confirme se está usando uma senha de app (não a senha normal)
- Verifique se o email está correto

### Erro: "Could not find a declaration file"
- Certifique-se de que todas as variáveis estão definidas no `.env`
- Reinicie o backend após modificar o arquivo