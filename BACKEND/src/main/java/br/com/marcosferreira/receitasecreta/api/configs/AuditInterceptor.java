package br.com.marcosferreira.receitasecreta.api.configs;

import br.com.marcosferreira.receitasecreta.api.models.User;
import br.com.marcosferreira.receitasecreta.api.models.ReceitaModel;
import br.com.marcosferreira.receitasecreta.api.models.ProdutoModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Component
public class AuditInterceptor {

    @Autowired
    private AuthenticationUtils authUtils;

    @PrePersist
    public void prePersist(Object entity) {
        try {
            User currentUser = authUtils.getCurrentUser();
            LocalDateTime now = LocalDateTime.now(ZoneId.of("UTC"));

            if (entity instanceof ReceitaModel) {
                ReceitaModel receita = (ReceitaModel) entity;
                if (receita.getCreatedAt() == null) {
                    receita.setCreatedAt(now);
                    receita.setCreatedBy(currentUser.getLogin());
                    receita.setUserId(currentUser.getId());
                }
            } else if (entity instanceof ProdutoModel) {
                ProdutoModel produto = (ProdutoModel) entity;
                if (produto.getCreatedAt() == null) {
                    produto.setCreatedAt(now);
                    produto.setCreatedBy(currentUser.getLogin());
                    produto.setUserId(currentUser.getId());
                }
            } else if (entity instanceof User) {
                User user = (User) entity;
                if (user.getCreatedAt() == null) {
                    user.setCreatedAt(now);
                }
            }
        } catch (Exception e) {
            // Em caso de erro na obtenção do usuário (ex: operação do sistema)
            // não interrompe a operação
        }
    }

    @PreUpdate
    public void preUpdate(Object entity) {
        try {
            User currentUser = authUtils.getCurrentUser();
            LocalDateTime now = LocalDateTime.now(ZoneId.of("UTC"));

            if (entity instanceof ReceitaModel) {
                ReceitaModel receita = (ReceitaModel) entity;
                receita.setUpdatedAt(now);
                receita.setUpdatedBy(currentUser.getLogin());
            } else if (entity instanceof ProdutoModel) {
                ProdutoModel produto = (ProdutoModel) entity;
                produto.setUpdatedAt(now);
                produto.setUpdatedBy(currentUser.getLogin());
            }
        } catch (Exception e) {
            // Em caso de erro na obtenção do usuário (ex: operação do sistema)
            // não interrompe a operação
        }
    }
}