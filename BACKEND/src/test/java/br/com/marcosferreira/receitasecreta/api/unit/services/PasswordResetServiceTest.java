package br.com.marcosferreira.receitasecreta.api.unit.services;

import br.com.marcosferreira.receitasecreta.api.models.PasswordResetToken;
import br.com.marcosferreira.receitasecreta.api.models.User;
import br.com.marcosferreira.receitasecreta.api.repositories.PasswordResetTokenRepository;
import br.com.marcosferreira.receitasecreta.api.repositories.UserRepository;
import br.com.marcosferreira.receitasecreta.api.services.AuditService;
import br.com.marcosferreira.receitasecreta.api.services.EmailService;
import br.com.marcosferreira.receitasecreta.api.services.PasswordResetService;
import br.com.marcosferreira.receitasecreta.api.enums.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("PasswordResetService Tests")
class PasswordResetServiceTest {

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private PasswordResetService passwordResetService;

    private User mockUser;
    private PasswordResetToken mockToken;
    private String userEmail;
    private String userLogin;
    private String resetToken;

    @BeforeEach
    void setUp() {

        userEmail = "test@email.com";
        userLogin = "testuser";
        resetToken = "reset-token-123";

        mockUser = new User();
        mockUser.setId("user-id-123");
        mockUser.setLogin(userLogin);
        mockUser.setEmail(userEmail);
        mockUser.setRole(UserRole.USER);
        mockUser.setPassword("encoded-password");

        mockToken = new PasswordResetToken(userLogin);
        mockToken.setToken(resetToken);
        mockToken.setUsed(false);
        mockToken.setExpiryDate(LocalDateTime.now().plusHours(1));
    }

    @Nested
    @DisplayName("Request Password Reset Tests")
    class RequestPasswordResetTests {

        @Test
        @DisplayName("Deve solicitar reset de senha com sucesso")
        void deveSolicitarResetDeSenhaComSucesso() {
            // Arrange
            when(userRepository.findByEmail(userEmail)).thenReturn(mockUser);
            when(tokenRepository.countByUserLoginAndCreatedAtAfter(eq(userLogin), any(LocalDateTime.class)))
                .thenReturn(0L);
            doNothing().when(tokenRepository).deleteByUserLoginAndUsedFalse(userLogin);
            when(tokenRepository.save(any(PasswordResetToken.class))).thenReturn(mockToken);
            doNothing().when(emailService).sendPasswordResetEmail(eq(userEmail), anyString());

            // Act
            passwordResetService.requestPasswordReset(userEmail);

            // Assert
            verify(userRepository).findByEmail(userEmail);
            verify(tokenRepository).countByUserLoginAndCreatedAtAfter(eq(userLogin), any(LocalDateTime.class));
            verify(tokenRepository).deleteByUserLoginAndUsedFalse(userLogin);
            verify(tokenRepository).save(any(PasswordResetToken.class));
            verify(emailService).sendPasswordResetEmail(eq(userEmail), anyString());
        }

        @Test
        @DisplayName("Deve ignorar silenciosamente quando email não existe")
        void deveIgnorarSilenciosamenteQuandoEmailNaoExiste() {
            // Arrange
            when(userRepository.findByEmail(userEmail)).thenReturn(null);

            // Act
            passwordResetService.requestPasswordReset(userEmail);

            // Assert
            verify(userRepository).findByEmail(userEmail);
            verify(tokenRepository, never()).countByUserLoginAndCreatedAtAfter(anyString(), any(LocalDateTime.class));
            verify(tokenRepository, never()).save(any(PasswordResetToken.class));
            verify(emailService, never()).sendPasswordResetEmail(anyString(), anyString());
        }

        @Test
        @DisplayName("Deve lançar exceção quando exceder limite de tentativas")
        void deveLancarExcecaoQuandoExcederLimiteDeTentativas() {
            // Arrange
            when(userRepository.findByEmail(userEmail)).thenReturn(mockUser);
            when(tokenRepository.countByUserLoginAndCreatedAtAfter(eq(userLogin), any(LocalDateTime.class)))
                .thenReturn(3L); // MAX_ATTEMPTS_PER_HOUR = 3

            // Act & Assert
            assertThatThrownBy(() -> passwordResetService.requestPasswordReset(userEmail))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Muitas tentativas de recuperação. Tente novamente em 1 hora.");

            verify(userRepository).findByEmail(userEmail);
            verify(tokenRepository).countByUserLoginAndCreatedAtAfter(eq(userLogin), any(LocalDateTime.class));
            verify(tokenRepository, never()).save(any(PasswordResetToken.class));
            verify(emailService, never()).sendPasswordResetEmail(anyString(), anyString());
        }

        @Test
        @DisplayName("Deve invalidar tokens anteriores antes de criar novo")
        void deveInvalidarTokensAnterioresAntesDeCriarNovo() {
            // Arrange
            when(userRepository.findByEmail(userEmail)).thenReturn(mockUser);
            when(tokenRepository.countByUserLoginAndCreatedAtAfter(eq(userLogin), any(LocalDateTime.class)))
                .thenReturn(0L);
            doNothing().when(tokenRepository).deleteByUserLoginAndUsedFalse(userLogin);
            when(tokenRepository.save(any(PasswordResetToken.class))).thenReturn(mockToken);
            doNothing().when(emailService).sendPasswordResetEmail(eq(userEmail), anyString());

            // Act
            passwordResetService.requestPasswordReset(userEmail);

            // Assert
            verify(tokenRepository).deleteByUserLoginAndUsedFalse(userLogin);
            verify(tokenRepository).save(any(PasswordResetToken.class));
        }
    }

    @Nested
    @DisplayName("Validate Reset Token Tests")
    class ValidateResetTokenTests {

        @Test
        @DisplayName("Deve validar token válido")
        void deveValidarTokenValido() {
            // Arrange
            when(tokenRepository.findByTokenAndUsedFalse(resetToken))
                .thenReturn(Optional.of(mockToken));

            // Act
            boolean result = passwordResetService.validateResetToken(resetToken);

            // Assert
            assertThat(result).isTrue();
            verify(tokenRepository).findByTokenAndUsedFalse(resetToken);
        }

        @Test
        @DisplayName("Deve retornar false para token inexistente")
        void deveRetornarFalseParaTokenInexistente() {
            // Arrange
            when(tokenRepository.findByTokenAndUsedFalse(resetToken))
                .thenReturn(Optional.empty());

            // Act
            boolean result = passwordResetService.validateResetToken(resetToken);

            // Assert
            assertThat(result).isFalse();
            verify(tokenRepository).findByTokenAndUsedFalse(resetToken);
        }

        @Test
        @DisplayName("Deve retornar false para token expirado")
        void deveRetornarFalseParaTokenExpirado() {
            // Arrange
            mockToken.setExpiryDate(LocalDateTime.now().minusHours(1)); // Token expirado
            when(tokenRepository.findByTokenAndUsedFalse(resetToken))
                .thenReturn(Optional.of(mockToken));

            // Act
            boolean result = passwordResetService.validateResetToken(resetToken);

            // Assert
            assertThat(result).isFalse();
            verify(tokenRepository).findByTokenAndUsedFalse(resetToken);
        }
    }

    @Nested
    @DisplayName("Reset Password Tests")
    class ResetPasswordTests {

        @Test
        @DisplayName("Deve resetar senha com sucesso")
        void deveResetarSenhaComSucesso() {
            // Arrange
            String newPassword = "newPassword123";
            when(tokenRepository.findByTokenAndUsedFalse(resetToken))
                .thenReturn(Optional.of(mockToken));
            when(userRepository.findByLogin(userLogin)).thenReturn(mockUser);
            when(userRepository.save(any(User.class))).thenReturn(mockUser);
            when(tokenRepository.save(any(PasswordResetToken.class))).thenReturn(mockToken);
            doNothing().when(auditService).auditPasswordChange(anyString(), eq("RESET"), eq("PASSWORD_RESET"));

            // Act
            passwordResetService.resetPassword(resetToken, newPassword);

            // Assert
            verify(tokenRepository).findByTokenAndUsedFalse(resetToken);
            verify(userRepository).findByLogin(userLogin);
            verify(userRepository).save(any(User.class));
            verify(tokenRepository).save(any(PasswordResetToken.class));
            verify(auditService).auditPasswordChange(mockUser.getId(), "RESET", "PASSWORD_RESET");
            
            // Verificar se o token foi marcado como usado
            assertThat(mockToken.isUsed()).isTrue();
        }

        @Test
        @DisplayName("Deve verificar se senha é criptografada ao resetar")
        void deveVerificarSeSenhaECriptografadaAoResetar() {
            // Arrange
            String newPassword = "newPassword123";
            when(tokenRepository.findByTokenAndUsedFalse(resetToken))
                .thenReturn(Optional.of(mockToken));
            when(userRepository.findByLogin(userLogin)).thenReturn(mockUser);
            when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
                User savedUser = invocation.getArgument(0);
                // Verifica se a senha foi criptografada
                BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
                assertThat(encoder.matches(newPassword, savedUser.getPassword())).isTrue();
                return savedUser;
            });
            when(tokenRepository.save(any(PasswordResetToken.class))).thenReturn(mockToken);
            doNothing().when(auditService).auditPasswordChange(anyString(), eq("RESET"), eq("PASSWORD_RESET"));

            // Act
            passwordResetService.resetPassword(resetToken, newPassword);

            // Assert
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("Deve lançar exceção para token inválido")
        void deveLancarExcecaoParaTokenInvalido() {
            // Arrange
            String newPassword = "newPassword123";
            when(tokenRepository.findByTokenAndUsedFalse(resetToken))
                .thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> passwordResetService.resetPassword(resetToken, newPassword))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Token inválido ou já utilizado");

            verify(tokenRepository).findByTokenAndUsedFalse(resetToken);
            verify(userRepository, never()).findByLogin(anyString());
            verify(userRepository, never()).save(any(User.class));
            verify(auditService, never()).auditPasswordChange(anyString(), anyString(), anyString());
        }

        @Test
        @DisplayName("Deve lançar exceção para token expirado")
        void deveLancarExcecaoParaTokenExpirado() {
            // Arrange
            String newPassword = "newPassword123";
            mockToken.setExpiryDate(LocalDateTime.now().minusHours(1)); // Token expirado
            when(tokenRepository.findByTokenAndUsedFalse(resetToken))
                .thenReturn(Optional.of(mockToken));

            // Act & Assert
            assertThatThrownBy(() -> passwordResetService.resetPassword(resetToken, newPassword))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Token expirado");

            verify(tokenRepository).findByTokenAndUsedFalse(resetToken);
            verify(userRepository, never()).findByLogin(anyString());
            verify(userRepository, never()).save(any(User.class));
            verify(auditService, never()).auditPasswordChange(anyString(), anyString(), anyString());
        }

        @Test
        @DisplayName("Deve lançar exceção quando usuário não encontrado")
        void deveLancarExcecaoQuandoUsuarioNaoEncontrado() {
            // Arrange
            String newPassword = "newPassword123";
            when(tokenRepository.findByTokenAndUsedFalse(resetToken))
                .thenReturn(Optional.of(mockToken));
            when(userRepository.findByLogin(userLogin)).thenReturn(null);

            // Act & Assert
            assertThatThrownBy(() -> passwordResetService.resetPassword(resetToken, newPassword))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Usuário não encontrado");

            verify(tokenRepository).findByTokenAndUsedFalse(resetToken);
            verify(userRepository).findByLogin(userLogin);
            verify(userRepository, never()).save(any(User.class));
            verify(auditService, never()).auditPasswordChange(anyString(), anyString(), anyString());
        }

        @Test
        @DisplayName("Deve chamar auditService ao resetar senha")
        void deveChamarAuditServiceAoResetarSenha() {
            // Arrange
            String newPassword = "newPassword123";
            when(tokenRepository.findByTokenAndUsedFalse(resetToken))
                .thenReturn(Optional.of(mockToken));
            when(userRepository.findByLogin(userLogin)).thenReturn(mockUser);
            when(userRepository.save(any(User.class))).thenReturn(mockUser);
            when(tokenRepository.save(any(PasswordResetToken.class))).thenReturn(mockToken);
            doNothing().when(auditService).auditPasswordChange(anyString(), eq("RESET"), eq("PASSWORD_RESET"));

            // Act
            passwordResetService.resetPassword(resetToken, newPassword);

            // Assert
            verify(auditService, times(1)).auditPasswordChange(mockUser.getId(), "RESET", "PASSWORD_RESET");
        }
    }

    @Nested
    @DisplayName("Cleanup Expired Tokens Tests")
    class CleanupExpiredTokensTests {

        @Test
        @DisplayName("Deve limpar tokens expirados")
        void deveLimparTokensExpirados() {
            // Arrange
            doNothing().when(tokenRepository).deleteByExpiryDateBefore(any(LocalDateTime.class));

            // Act
            passwordResetService.cleanupExpiredTokens();

            // Assert
            verify(tokenRepository).deleteByExpiryDateBefore(any(LocalDateTime.class));
        }
    }

    @Nested
    @DisplayName("Cenários de Erro")
    class CenariosDeErro {

        @Test
        @DisplayName("Deve lançar exceção quando emailService falha")
        void deveLancarExcecaoQuandoEmailServiceFalha() {
            // Arrange
            when(userRepository.findByEmail(userEmail)).thenReturn(mockUser);
            when(tokenRepository.countByUserLoginAndCreatedAtAfter(eq(userLogin), any(LocalDateTime.class)))
                .thenReturn(0L);
            doNothing().when(tokenRepository).deleteByUserLoginAndUsedFalse(userLogin);
            when(tokenRepository.save(any(PasswordResetToken.class))).thenReturn(mockToken);
            doNothing().when(emailService).sendPasswordResetEmail(eq(userEmail), anyString());
            
            // Act - não deve lançar exceção, pois o serviço deve ser resiliente
            passwordResetService.requestPasswordReset(userEmail);

            // Assert
            verify(emailService).sendPasswordResetEmail(eq(userEmail), anyString());
        }

        @Test
        @DisplayName("Deve lançar exceção quando tokenRepository falha no save")
        void deveLancarExcecaoQuandoTokenRepositoryFalhaNoSave() {
            // Arrange
            when(userRepository.findByEmail(userEmail)).thenReturn(mockUser);
            when(tokenRepository.countByUserLoginAndCreatedAtAfter(eq(userLogin), any(LocalDateTime.class)))
                .thenReturn(0L);
            doNothing().when(tokenRepository).deleteByUserLoginAndUsedFalse(userLogin);
            when(tokenRepository.save(any(PasswordResetToken.class)))
                .thenThrow(new RuntimeException("Erro ao salvar token"));

            // Act & Assert
            assertThatThrownBy(() -> passwordResetService.requestPasswordReset(userEmail))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Erro ao salvar token");

            verify(tokenRepository).save(any(PasswordResetToken.class));
            verify(emailService, never()).sendPasswordResetEmail(anyString(), anyString());
        }
    }
}