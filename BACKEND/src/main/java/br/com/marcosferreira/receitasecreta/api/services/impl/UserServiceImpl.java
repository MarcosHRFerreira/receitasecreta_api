package br.com.marcosferreira.receitasecreta.api.services.impl;

import br.com.marcosferreira.receitasecreta.api.exceptions.NotFoundException;
import br.com.marcosferreira.receitasecreta.api.exceptions.UnauthorizedException;
import br.com.marcosferreira.receitasecreta.api.models.User;
import br.com.marcosferreira.receitasecreta.api.repositories.UserRepository;
import br.com.marcosferreira.receitasecreta.api.services.AuditService;
import br.com.marcosferreira.receitasecreta.api.services.UserService;
import br.com.marcosferreira.receitasecreta.api.configs.AuthenticationUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository repository;
    
    @Autowired
    private AuthenticationUtils authUtils;
    
    @Autowired
    private AuditService auditService;

    public UserServiceImpl(UserRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<User> getAllUsers() {
        return repository.findAll();
    }
    
    @Override
    public void delete(String userId) {
        User currentUser = authUtils.getCurrentUser();
        
        // Verificar se o usuário a ser deletado existe
        User userToDelete = repository.findById(userId).orElse(null);
        if (userToDelete == null) {
            throw new NotFoundException("Usuário não encontrado");
        }
        
        // Verificar se o usuário atual é ADMIN
        if (!"ADMIN".equals(currentUser.getRole().name())) {
            auditService.auditUnauthorizedAccess("USER_" + userId, currentUser.getId(), "DELETE");
            throw new UnauthorizedException("Você não tem permissão para deletar usuários");
        }
        
        // Não permitir que o admin delete a si mesmo
        if (currentUser.getId().equals(userId)) {
            throw new UnauthorizedException("Você não pode deletar sua própria conta");
        }
        
        // Deletar o usuário
        repository.deleteById(userId);
        
        // Auditoria
        auditService.auditPasswordChange(userId, "DELETE", currentUser.getId());
    }

}
