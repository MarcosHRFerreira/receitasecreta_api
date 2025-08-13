package br.com.marcosferreira.receitasecreta.api.services.impl;

import br.com.marcosferreira.receitasecreta.api.dtos.request.UserAuthRequest;
import br.com.marcosferreira.receitasecreta.api.dtos.request.UserRequest;
import br.com.marcosferreira.receitasecreta.api.dtos.response.UserResponse;
import br.com.marcosferreira.receitasecreta.api.enums.UserRole;
import br.com.marcosferreira.receitasecreta.api.models.User;
import br.com.marcosferreira.receitasecreta.api.repositories.UserRepository;
import br.com.marcosferreira.receitasecreta.api.security.TokenService;
import br.com.marcosferreira.receitasecreta.api.services.AuditService;
import br.com.marcosferreira.receitasecreta.api.services.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationServiceImpl implements AuthenticationService {


    private final AuthenticationManager authenticationManager;
    private final UserRepository repository;
    private final TokenService tokenService;
    
    @Autowired
    private AuditService auditService;

    public AuthenticationServiceImpl(AuthenticationManager authenticationManager, UserRepository repository, TokenService tokenService) {
        this.authenticationManager = authenticationManager;
        this.repository = repository;
        this.tokenService = tokenService;
    }

    @Override
    public UserResponse login(UserAuthRequest data) {
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.login(), data.password());
        var auth = authenticationManager.authenticate(usernamePassword);
        var user = (User) auth.getPrincipal();
        var token = tokenService.generateToken(user);
        
        var userData = new UserResponse.UserData(
                user.getId(),
                user.getLogin(),
                user.getEmail(),
                user.getRole()
        );
        
        return new UserResponse(token, userData);
    }

    @Override
    public void register(UserRequest data) {
        if (repository.findByLogin(data.login()) != null) {
            throw new RuntimeException("Usuário já existe!");
        }
        String encryptedPassword = new BCryptPasswordEncoder().encode(data.password());
        // Sempre define o role como USER no cadastro
        User newUser = new User(data.login(), encryptedPassword, data.email(), UserRole.USER);
        User savedUser = repository.save(newUser);
        
        // Auditoria do registro de novo usuário
        auditService.auditPasswordChange(savedUser.getId(), "REGISTER", savedUser.getId());
    }

}
