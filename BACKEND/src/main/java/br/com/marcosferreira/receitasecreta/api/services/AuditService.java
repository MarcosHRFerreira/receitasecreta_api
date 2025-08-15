package br.com.marcosferreira.receitasecreta.api.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class AuditService {
    
    private static final Logger log = LoggerFactory.getLogger(AuditService.class);

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

    public void auditUnauthorizedAccess(String resource, String userId, String action) {
        log.warn("Unauthorized access attempt - Resource: {} User: {} Action: {}", resource, userId, action);
    }
}