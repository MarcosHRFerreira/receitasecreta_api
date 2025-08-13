package br.com.marcosferreira.receitasecreta.api.repositories;

import br.com.marcosferreira.receitasecreta.api.models.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.List;

public interface UserRepository extends JpaRepository<User, String> {
    UserDetails findByLogin(String login);
    User findByEmail(String email);
    
    // Métodos para auditoria
    List<User> findByPasswordChangedAtIsNotNull(Pageable pageable);
    long countByCreatedAtAfter(LocalDateTime date);
    long countByPasswordChangedAtAfter(LocalDateTime date);
}
