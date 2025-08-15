package br.com.marcosferreira.receitasecreta.api.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    
    @Autowired
    private JavaMailSender mailSender;
    
    // Usar diretamente a variável de ambiente
    private final String fromEmail = System.getenv("EMAIL_USERNAME");
    
    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;
    
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        log.info("=== DEBUG EMAIL CONFIG ===");
        log.info("fromEmail configurado: {}", fromEmail);
        log.info("EMAIL_USERNAME env: {}", System.getenv("EMAIL_USERNAME"));
        log.info("spring.mail.username property: {}", System.getProperty("spring.mail.username"));
        log.info("===========================");
        log.debug("Tentando enviar email de: {} para: {}", fromEmail, toEmail);
        
        try {
            if (fromEmail == null || fromEmail.trim().isEmpty()) {
                log.error("EMAIL_USERNAME não está configurado ou está vazio");
                throw new RuntimeException("Configuração de email inválida: EMAIL_USERNAME não definido");
            }
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
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
            log.info("Email de recuperação de senha enviado para: {}", toEmail);
            
        } catch (MessagingException e) {
            log.error("Erro de mensageria ao enviar email para {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Erro ao enviar email de recuperação", e);
        } catch (Exception e) {
            log.error("Erro ao enviar email de recuperação para {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Erro ao enviar email de recuperação", e);
        }
    }
}