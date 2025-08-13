package br.com.marcosferreira.receitasecreta.api.configs;

import br.com.marcosferreira.receitasecreta.api.models.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

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