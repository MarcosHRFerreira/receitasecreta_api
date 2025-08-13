package br.com.marcosferreira.receitasecreta.api.repositories;


import br.com.marcosferreira.receitasecreta.api.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;

public interface UserRepository extends JpaRepository<User, String> {
    UserDetails findByLogin(String login);
    User findByEmail(String email);
}
