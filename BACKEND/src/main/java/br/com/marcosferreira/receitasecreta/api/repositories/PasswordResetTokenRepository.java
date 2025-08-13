package br.com.marcosferreira.receitasecreta.api.repositories;

import br.com.marcosferreira.receitasecreta.api.models.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, String> {
    
    Optional<PasswordResetToken> findByTokenAndUsedFalse(String token);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM PasswordResetToken p WHERE p.userLogin = :userLogin AND p.used = false")
    void deleteByUserLoginAndUsedFalse(@Param("userLogin") String userLogin);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM PasswordResetToken p WHERE p.expiryDate < :date")
    void deleteByExpiryDateBefore(@Param("date") LocalDateTime date);
    
    @Query("SELECT COUNT(p) FROM PasswordResetToken p WHERE p.userLogin = :userLogin AND p.createdAt > :since")
    long countByUserLoginAndCreatedAtAfter(@Param("userLogin") String userLogin, @Param("since") LocalDateTime since);
}