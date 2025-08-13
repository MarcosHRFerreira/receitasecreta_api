package br.com.marcosferreira.receitasecreta.api.unit.services;

import br.com.marcosferreira.receitasecreta.api.dtos.request.UserAuthRequest;
import br.com.marcosferreira.receitasecreta.api.dtos.request.UserRequest;
import br.com.marcosferreira.receitasecreta.api.dtos.response.UserResponse;
import br.com.marcosferreira.receitasecreta.api.enums.UserRole;
import br.com.marcosferreira.receitasecreta.api.models.User;
import br.com.marcosferreira.receitasecreta.api.repositories.UserRepository;
import br.com.marcosferreira.receitasecreta.api.security.TokenService;
import br.com.marcosferreira.receitasecreta.api.services.AuditService;
import br.com.marcosferreira.receitasecreta.api.services.impl.AuthenticationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

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
@DisplayName("AuthenticationService Tests")
class AuthenticationServiceImplTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TokenService tokenService;

    @Mock
    private AuditService auditService;

    @Mock
    private Authentication authentication;

    private AuthenticationServiceImpl authenticationService;

    @BeforeEach
    void setUpService() {
        authenticationService = new AuthenticationServiceImpl(authenticationManager, userRepository, tokenService);
        // Injetar o AuditService manualmente via reflection
        try {
            java.lang.reflect.Field auditServiceField = AuthenticationServiceImpl.class.getDeclaredField("auditService");
            auditServiceField.setAccessible(true);
            auditServiceField.set(authenticationService, auditService);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao injetar AuditService", e);
        }
    }

    private UserAuthRequest userAuthRequest;
    private UserRequest userRequest;
    private User mockUser;
    private String mockToken;

    @BeforeEach
    void setUp() {
        userAuthRequest = new UserAuthRequest("testuser", "password123");
        userRequest = new UserRequest("testuser", "password123", "test@email.com", UserRole.USER);
        
        mockUser = new User();
        mockUser.setId("user-id-123");
        mockUser.setLogin("testuser");
        mockUser.setEmail("test@email.com");
        mockUser.setRole(UserRole.USER);
        
        mockToken = "jwt-token-123";
    }

    @Nested
    @DisplayName("Login Tests")
    class LoginTests {

        @Test
        @DisplayName("Deve realizar login com credenciais válidas")
        void deveRealizarLoginComCredenciaisValidas() {
            // Arrange
            UsernamePasswordAuthenticationToken authToken = 
                new UsernamePasswordAuthenticationToken(userAuthRequest.login(), userAuthRequest.password());
            
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
            when(authentication.getPrincipal()).thenReturn(mockUser);
            when(tokenService.generateToken(mockUser)).thenReturn(mockToken);

            // Act
            UserResponse result = authenticationService.login(userAuthRequest);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.token()).isEqualTo(mockToken);
            assertThat(result.user()).isNotNull();
            assertThat(result.user().id()).isEqualTo(mockUser.getId());
            assertThat(result.user().username()).isEqualTo(mockUser.getLogin());
            assertThat(result.user().email()).isEqualTo(mockUser.getEmail());
            assertThat(result.user().role()).isEqualTo(mockUser.getRole());

            verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
            verify(tokenService).generateToken(mockUser);
        }

        @Test
        @DisplayName("Deve lançar exceção com credenciais inválidas")
        void deveLancarExcecaoComCredenciaisInvalidas() {
            // Arrange
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Credenciais inválidas"));

            // Act & Assert
            assertThatThrownBy(() -> authenticationService.login(userAuthRequest))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Credenciais inválidas");

            verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
            verify(tokenService, never()).generateToken(any(User.class));
        }
    }

    @Nested
    @DisplayName("Register Tests")
    class RegisterTests {

        @Test
        @DisplayName("Deve registrar novo usuário com sucesso")
        void deveRegistrarNovoUsuarioComSucesso() {
            // Arrange
            when(userRepository.findByLogin(userRequest.login())).thenReturn(null);
            when(userRepository.save(any(User.class))).thenReturn(mockUser);
            doNothing().when(auditService).auditPasswordChange(anyString(), eq("REGISTER"), anyString());

            // Act
            authenticationService.register(userRequest);

            // Assert
            verify(userRepository).findByLogin(userRequest.login());
            verify(userRepository).save(any(User.class));
            verify(auditService).auditPasswordChange(mockUser.getId(), "REGISTER", mockUser.getId());
        }

        @Test
        @DisplayName("Deve verificar se senha é criptografada ao registrar")
        void deveVerificarSeSenhaECriptografadaAoRegistrar() {
            // Arrange
            when(userRepository.findByLogin(userRequest.login())).thenReturn(null);
            when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
                User savedUser = invocation.getArgument(0);
                // Verifica se a senha foi criptografada
                BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
                assertThat(encoder.matches(userRequest.password(), savedUser.getPassword())).isTrue();
                return mockUser;
            });
            doNothing().when(auditService).auditPasswordChange(anyString(), eq("REGISTER"), anyString());

            // Act
            authenticationService.register(userRequest);

            // Assert
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("Deve definir role como USER ao registrar")
        void deveDefinirRoleComoUserAoRegistrar() {
            // Arrange
            UserRequest requestWithAdminRole = new UserRequest(
                "testuser", "password123", "test@email.com", UserRole.ADMIN
            );
            
            when(userRepository.findByLogin(requestWithAdminRole.login())).thenReturn(null);
            when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
                User savedUser = invocation.getArgument(0);
                // Verifica se o role foi forçado para USER
                assertThat(savedUser.getRole()).isEqualTo(UserRole.USER);
                return mockUser;
            });
            doNothing().when(auditService).auditPasswordChange(anyString(), eq("REGISTER"), anyString());

            // Act
            authenticationService.register(requestWithAdminRole);

            // Assert
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("Deve lançar exceção quando usuário já existe")
        void deveLancarExcecaoQuandoUsuarioJaExiste() {
            // Arrange
            when(userRepository.findByLogin(userRequest.login())).thenReturn(mockUser);

            // Act & Assert
            assertThatThrownBy(() -> authenticationService.register(userRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Usuário já existe!");

            verify(userRepository).findByLogin(userRequest.login());
            verify(userRepository, never()).save(any(User.class));
            verify(auditService, never()).auditPasswordChange(anyString(), anyString(), anyString());
        }

        @Test
        @DisplayName("Deve chamar auditService ao registrar usuário")
        void deveChamarAuditServiceAoRegistrarUsuario() {
            // Arrange
            when(userRepository.findByLogin(userRequest.login())).thenReturn(null);
            when(userRepository.save(any(User.class))).thenReturn(mockUser);
            doNothing().when(auditService).auditPasswordChange(anyString(), eq("REGISTER"), anyString());

            // Act
            authenticationService.register(userRequest);

            // Assert
            verify(auditService, times(1)).auditPasswordChange(mockUser.getId(), "REGISTER", mockUser.getId());
        }
    }

    @Nested
    @DisplayName("Cenários de Erro")
    class CenariosDeErro {

        @Test
        @DisplayName("Deve lançar exceção quando authenticationManager falha")
        void deveLancarExcecaoQuandoAuthenticationManagerFalha() {
            // Arrange
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new RuntimeException("Erro interno de autenticação"));

            // Act & Assert
            assertThatThrownBy(() -> authenticationService.login(userAuthRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Erro interno de autenticação");

            verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
            verify(tokenService, never()).generateToken(any(User.class));
        }

        @Test
        @DisplayName("Deve lançar exceção quando tokenService falha")
        void deveLancarExcecaoQuandoTokenServiceFalha() {
            // Arrange
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
            when(authentication.getPrincipal()).thenReturn(mockUser);
            when(tokenService.generateToken(mockUser))
                .thenThrow(new RuntimeException("Erro ao gerar token"));

            // Act & Assert
            assertThatThrownBy(() -> authenticationService.login(userAuthRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Erro ao gerar token");

            verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
            verify(tokenService).generateToken(mockUser);
        }

        @Test
        @DisplayName("Deve lançar exceção quando userRepository falha no registro")
        void deveLancarExcecaoQuandoUserRepositoryFalhaNoRegistro() {
            // Arrange
            when(userRepository.findByLogin(userRequest.login())).thenReturn(null);
            when(userRepository.save(any(User.class)))
                .thenThrow(new RuntimeException("Erro ao salvar usuário"));

            // Act & Assert
            assertThatThrownBy(() -> authenticationService.register(userRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Erro ao salvar usuário");

            verify(userRepository).findByLogin(userRequest.login());
            verify(userRepository).save(any(User.class));
            verify(auditService, never()).auditPasswordChange(anyString(), anyString(), anyString());
        }
    }
}