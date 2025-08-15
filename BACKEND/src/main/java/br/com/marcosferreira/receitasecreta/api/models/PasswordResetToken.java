package br.com.marcosferreira.receitasecreta.api.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "password_reset_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false, unique = true)
    private String token;
    
    @Column(nullable = false)
    private String userLogin;
    
    @Column(nullable = false)
    private LocalDateTime expiryDate;
    
    @Column(nullable = false)
    private boolean used = false;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    public PasswordResetToken(String userLogin) {
        this.token = UUID.randomUUID().toString();
        this.userLogin = userLogin;
        this.createdAt = LocalDateTime.now();
        this.expiryDate = LocalDateTime.now().plusHours(1); // Expira em 1 hora
        this.used = false;
    }
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiryDate);
    }
    
    public boolean isValid() {
        return !this.used && !this.isExpired();
    }
    
    // Métodos explícitos para resolver problemas de compilação
    public void setUsed(boolean used) {
        this.used = used;
    }
    
    public String getUserLogin() {
        return this.userLogin;
    }
    
    public String getToken() {
        return this.token;
    }
}