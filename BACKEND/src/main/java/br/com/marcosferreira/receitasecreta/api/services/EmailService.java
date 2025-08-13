package br.com.marcosferreira.receitasecreta.api.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;
    
    public void sendPasswordResetEmail(String userLogin, String resetToken) {
        log.debug("Tentando enviar email de: {} para: {}", fromEmail, userLogin);
        
        try {
            if (fromEmail == null || fromEmail.trim().isEmpty()) {
                log.error("EMAIL_USERNAME não está configurado ou está vazio");
                throw new RuntimeException("Configuração de email inválida: EMAIL_USERNAME não definido");
            }
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(userLogin); // Assumindo que o login é o email
            helper.setSubject("Recuperação de Senha - Receita Secreta");
            
            String resetUrl = frontendUrl + "/reset-password/" + resetToken;
            
            String emailBody = String.format(
                "Olá,\n\n" +
                "Você solicitou a recuperação de sua senha no sistema Receita Secreta.\n\n" +
                "Para redefinir sua senha, clique no link abaixo:\n" +
                "%s\n\n" +
                "Este link é válido por 1 hora.\n\n" +
                "Se você não solicitou esta recuperação, ignore este email.\n\n" +
                "Atenciosamente,\n" +
                "Equipe Receita Secreta",
                resetUrl
            );
            
            helper.setText(emailBody, false);
            
            mailSender.send(message);
            log.info("Email de recuperação de senha enviado para: {}", userLogin);
            
        } catch (MessagingException e) {
            log.error("Erro de mensageria ao enviar email para {}: {}", userLogin, e.getMessage());
            throw new RuntimeException("Erro ao enviar email de recuperação", e);
        } catch (Exception e) {
            log.error("Erro ao enviar email de recuperação para {}: {}", userLogin, e.getMessage());
            throw new RuntimeException("Erro ao enviar email de recuperação", e);
        }
    }
}