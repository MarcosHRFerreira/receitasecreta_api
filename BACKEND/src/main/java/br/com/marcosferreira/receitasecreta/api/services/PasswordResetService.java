package br.com.marcosferreira.receitasecreta.api.services;

import br.com.marcosferreira.receitasecreta.api.models.PasswordResetToken;
import br.com.marcosferreira.receitasecreta.api.models.User;
import br.com.marcosferreira.receitasecreta.api.repositories.PasswordResetTokenRepository;
import br.com.marcosferreira.receitasecreta.api.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PasswordResetService {
    
    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);
    
    @Autowired
    private PasswordResetTokenRepository tokenRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EmailService emailService;
    
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    @Autowired
    private AuditService auditService;
    
    private static final int MAX_ATTEMPTS_PER_HOUR = 3;
    
    @Transactional
    public void requestPasswordReset(String email) {
        // Verificar se o usuário existe
        User user = userRepository.findByEmail(email);
        if (user == null) {
            log.warn("Tentativa de recuperação de senha para email inexistente: {}", email);
            // Por segurança, não revelamos se o usuário existe ou não
            return;
        }
        
        // Verificar rate limiting
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        long recentAttempts = tokenRepository.countByUserLoginAndCreatedAtAfter(user.getLogin(), oneHourAgo);
        
        if (recentAttempts >= MAX_ATTEMPTS_PER_HOUR) {
            log.warn("Muitas tentativas de recuperação de senha para: {}", email);
            throw new RuntimeException("Muitas tentativas de recuperação. Tente novamente em 1 hora.");
        }
        
        // Invalidar tokens anteriores não utilizados
        tokenRepository.deleteByUserLoginAndUsedFalse(user.getLogin());
        
        // Criar novo token
        PasswordResetToken resetToken = new PasswordResetToken(user.getLogin());
        tokenRepository.save(resetToken);
        
        // Enviar email
        emailService.sendPasswordResetEmail(email, resetToken.getToken());
        
        log.info("Token de recuperação criado para usuário: {}", email);
    }
    
    public boolean validateResetToken(String token) {
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByTokenAndUsedFalse(token);
        
        if (tokenOpt.isEmpty()) {
            log.warn("Token de recuperação inválido ou já utilizado: {}", token);
            return false;
        }
        
        PasswordResetToken resetToken = tokenOpt.get();
        if (resetToken.isExpired()) {
            log.warn("Token de recuperação expirado: {}", token);
            return false;
        }
        
        return true;
    }
    
    @Transactional
    public void resetPassword(String token, String newPassword) {
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByTokenAndUsedFalse(token);
        
        if (tokenOpt.isEmpty()) {
            throw new RuntimeException("Token inválido ou já utilizado");
        }
        
        PasswordResetToken resetToken = tokenOpt.get();
        
        if (resetToken.isExpired()) {
            throw new RuntimeException("Token expirado");
        }
        
        // Buscar usuário
        UserDetails userDetails = userRepository.findByLogin(resetToken.getUserLogin());
        if (userDetails == null) {
            throw new RuntimeException("Usuário não encontrado");
        }
        
        User user = (User) userDetails;
        
        // Atualizar senha
        String encryptedPassword = passwordEncoder.encode(newPassword);
        user.setPassword(encryptedPassword);
        
        // Atualizar campos de auditoria de senha
        user.updatePassword(encryptedPassword, "PASSWORD_RESET");
        
        userRepository.save(user);
        
        // Marcar token como usado
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
        
        // Registrar auditoria
        auditService.auditPasswordChange(user.getId(), "RESET", "PASSWORD_RESET");
        
        log.info("Senha redefinida com sucesso para usuário: {}", resetToken.getUserLogin());
    }
    
    @Scheduled(fixedRate = 3600000) // Executa a cada hora
    @Transactional
    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        tokenRepository.deleteByExpiryDateBefore(now);
        log.debug("Limpeza de tokens expirados executada");
    }
}