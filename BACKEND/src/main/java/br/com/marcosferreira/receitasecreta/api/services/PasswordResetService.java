package br.com.marcosferreira.receitasecreta.api.services;

import br.com.marcosferreira.receitasecreta.api.models.PasswordResetToken;
import br.com.marcosferreira.receitasecreta.api.models.User;
import br.com.marcosferreira.receitasecreta.api.repositories.PasswordResetTokenRepository;
import br.com.marcosferreira.receitasecreta.api.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {
    
    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
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
        userRepository.save(user);
        
        // Marcar token como usado
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
        
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