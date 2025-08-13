package br.com.marcosferreira.receitasecreta.api.unit.security;

import br.com.marcosferreira.receitasecreta.api.controllers.ReceitaController;
import br.com.marcosferreira.receitasecreta.api.dtos.request.ReceitaRecordDto;
import br.com.marcosferreira.receitasecreta.api.models.ReceitaModel;
import br.com.marcosferreira.receitasecreta.api.enums.CategoriaReceita;
import br.com.marcosferreira.receitasecreta.api.enums.Dificuldade;
import br.com.marcosferreira.receitasecreta.api.services.ReceitaService;
import br.com.marcosferreira.receitasecreta.api.security.SecurityConfigurations;
import br.com.marcosferreira.receitasecreta.api.security.SecurityFilter;
import br.com.marcosferreira.receitasecreta.api.security.TokenService;
import br.com.marcosferreira.receitasecreta.api.repositories.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import java.util.Collections;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testes de segurança para verificar autenticação e autorização.
 * Testa se os endpoints estão protegidos adequadamente.
 */
@DisplayName("Security Tests")
@SpringBootTest
@AutoConfigureMockMvc
class SecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReceitaService receitaService;

    @Autowired
    private ObjectMapper objectMapper;

    private ReceitaRecordDto receitaRecordDto;
    private ReceitaModel mockReceita;
    private UUID receitaId;

    @BeforeEach
    void setUpSecurity() {
        receitaId = UUID.randomUUID();

        // Setup ReceitaRecordDto
        receitaRecordDto = new ReceitaRecordDto(
            "Bolo de Chocolate Security",
            "Misture e asse",
            "1 hora",
            "8 porções",
            CategoriaReceita.SOBREMESA,
            Dificuldade.FACIL,
            "Receita para testes de segurança",
            "chocolate,teste",
            true
        );

        // Setup mock response
        mockReceita = new ReceitaModel();
        mockReceita.setReceitaId(receitaId);
        mockReceita.setNomeReceita("Bolo de Chocolate Security");
        mockReceita.setModoPreparo("Misture e asse");
        mockReceita.setTempoPreparo("1 hora");
        mockReceita.setRendimento("8 porções");
        mockReceita.setCategoria(CategoriaReceita.SOBREMESA);
        mockReceita.setDificuldade(Dificuldade.FACIL);
        mockReceita.setFavorita(true);
        mockReceita.setDataCriacao(LocalDateTime.now());
        mockReceita.setDataAlteracao(LocalDateTime.now());
        mockReceita.setUserId("security-user");
    }

    @Nested
    @DisplayName("Testes de Autenticação")
    class TestesAutenticacao {

        @Test
        @DisplayName("Deve negar acesso a usuário não autenticado - POST /receitas")
        @WithAnonymousUser
        void deveNegarAcessoUsuarioNaoAutenticadoPost() throws Exception {
            mockMvc.perform(post("/receitas")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(receitaRecordDto))
                    .with(csrf()))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Deve permitir acesso público - GET /receitas/{id}")
        @WithAnonymousUser
        void devePermitirAcessoPublicoGet() throws Exception {
            when(receitaService.findByReceitaId(any(UUID.class))).thenReturn(mockReceita);
            
            mockMvc.perform(get("/receitas/{id}", receitaId))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Deve negar acesso a usuário não autenticado - PUT /receitas/{id}")
        @WithAnonymousUser
        void deveNegarAcessoUsuarioNaoAutenticadoPut() throws Exception {
            mockMvc.perform(put("/receitas/{id}", receitaId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(receitaRecordDto))
                    .with(csrf()))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Deve negar acesso a usuário não autenticado - DELETE /receitas/{id}")
        @WithAnonymousUser
        void deveNegarAcessoUsuarioNaoAutenticadoDelete() throws Exception {
            mockMvc.perform(delete("/receitas/{id}", receitaId)
                    .with(csrf()))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Deve permitir acesso público - GET /receitas")
        @WithAnonymousUser
        void devePermitirAcessoPublicoList() throws Exception {
            // Act & Assert - Verifica apenas se o endpoint é acessível publicamente
            // O teste não deve depender do comportamento do serviço
            mockMvc.perform(get("/receitas"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Testes de Autorização")
    class TestesAutorizacao {

        @Test
        @DisplayName("Deve permitir acesso a usuário autenticado - POST /receitas")
        @WithMockUser(username = "authorized-user", roles = "USER")
        void devePermitirAcessoUsuarioAutenticadoPost() throws Exception {
            // Arrange
            when(receitaService.save(any(ReceitaRecordDto.class))).thenReturn(mockReceita);

            // Act & Assert
            mockMvc.perform(post("/receitas")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(receitaRecordDto))
                    .with(csrf()))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.nomeReceita").value("Bolo de Chocolate Security"));
        }

        @Test
        @DisplayName("Deve permitir acesso a usuário autenticado - GET /receitas/{id}")
        @WithMockUser(username = "authorized-user", roles = "USER")
        void devePermitirAcessoUsuarioAutenticadoGet() throws Exception {
            // Arrange
            when(receitaService.findByReceitaId(eq(receitaId))).thenReturn(mockReceita);

            // Act & Assert
            mockMvc.perform(get("/receitas/{id}", receitaId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.receitaId").value(receitaId.toString()));
        }

        @Test
        @DisplayName("Deve permitir acesso a usuário autenticado - PUT /receitas/{id}")
        @WithMockUser(username = "authorized-user", roles = "USER")
        void devePermitirAcessoUsuarioAutenticadoPut() throws Exception {
            // Arrange
            when(receitaService.update(any(ReceitaRecordDto.class), eq(receitaId))).thenReturn(mockReceita);

            // Act & Assert
            mockMvc.perform(put("/receitas/{id}", receitaId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(receitaRecordDto))
                    .with(csrf()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.receitaId").value(receitaId.toString()));
        }

        @Test
        @DisplayName("Deve permitir acesso a usuário autenticado - DELETE /receitas/{id}")
        @WithMockUser(username = "authorized-user", roles = "USER")
        void devePermitirAcessoUsuarioAutenticadoDelete() throws Exception {
            // Act & Assert
            mockMvc.perform(delete("/receitas/{id}", receitaId)
                    .with(csrf()))
                    .andExpect(status().isNoContent());
        }
    }

    @Nested
    @DisplayName("Testes de CSRF")
    class TestesCsrf {

        @Test
        @DisplayName("Deve permitir POST com usuário autenticado (CSRF desabilitado)")
        @WithMockUser(username = "csrf-user", roles = "USER")
        void devePermitirPostComUsuarioAutenticado() throws Exception {
            // Arrange
            when(receitaService.save(any(ReceitaRecordDto.class))).thenReturn(mockReceita);
            
            // Act & Assert - Sem token CSRF
            mockMvc.perform(post("/receitas")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(receitaRecordDto)))
                    .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("Deve permitir PUT com usuário autenticado (CSRF desabilitado)")
        @WithMockUser(username = "csrf-user", roles = "USER")
        void devePermitirPutComUsuarioAutenticado() throws Exception {
            // Arrange
            when(receitaService.update(any(ReceitaRecordDto.class), eq(receitaId))).thenReturn(mockReceita);
            
            // Act & Assert - Sem token CSRF
            mockMvc.perform(put("/receitas/{id}", receitaId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(receitaRecordDto)))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Deve permitir DELETE com usuário autenticado (CSRF desabilitado)")
        @WithMockUser(username = "csrf-user", roles = "USER")
        void devePermitirDeleteComUsuarioAutenticado() throws Exception {
            // Act & Assert - Sem token CSRF
            mockMvc.perform(delete("/receitas/{id}", receitaId))
                    .andExpect(status().isNoContent());
        }

        @Test
        @DisplayName("Deve aceitar requisição GET sem token CSRF")
        @WithMockUser(username = "csrf-user", roles = "USER")
        void deveAceitarRequisicaoGetSemTokenCsrf() throws Exception {
            // Arrange
            when(receitaService.findByReceitaId(eq(receitaId))).thenReturn(mockReceita);

            // Act & Assert - GET não precisa de CSRF
            mockMvc.perform(get("/receitas/{id}", receitaId))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Testes de Roles e Permissões")
    class TestesRolesPermissoes {

        @Test
        @DisplayName("Deve permitir acesso com role USER")
        @WithMockUser(username = "user-role", roles = "USER")
        void devePermitirAcessoComRoleUser() throws Exception {
            // Arrange
            when(receitaService.save(any(ReceitaRecordDto.class))).thenReturn(mockReceita);

            // Act & Assert
            mockMvc.perform(post("/receitas")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(receitaRecordDto))
                    .with(csrf()))
                    .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("Deve permitir acesso com role ADMIN")
        @WithMockUser(username = "admin-role", roles = "ADMIN")
        void devePermitirAcessoComRoleAdmin() throws Exception {
            // Arrange
            when(receitaService.save(any(ReceitaRecordDto.class))).thenReturn(mockReceita);

            // Act & Assert
            mockMvc.perform(post("/receitas")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(receitaRecordDto))
                    .with(csrf()))
                    .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("Deve permitir acesso com múltiplas roles")
        @WithMockUser(username = "multi-role", roles = {"USER", "ADMIN"})
        void devePermitirAcessoComMultiplasRoles() throws Exception {
            // Arrange
            when(receitaService.save(any(ReceitaRecordDto.class))).thenReturn(mockReceita);

            // Act & Assert
            mockMvc.perform(post("/receitas")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(receitaRecordDto))
                    .with(csrf()))
                    .andExpect(status().isCreated());
        }
    }

    @Nested
    @DisplayName("Testes de Headers de Segurança")
    class TestesHeadersSeguranca {

        @Test
        @DisplayName("Deve incluir headers de segurança na resposta")
        @WithMockUser(username = "security-headers", roles = "USER")
        void deveIncluirHeadersSegurancaNaResposta() throws Exception {
            // Arrange
            when(receitaService.findByReceitaId(eq(receitaId))).thenReturn(mockReceita);

            // Act & Assert
            mockMvc.perform(get("/receitas/{id}", receitaId))
                    .andExpect(status().isOk())
                    .andExpect(header().exists("X-Content-Type-Options"))
                    .andExpect(header().exists("X-Frame-Options"))
                    .andExpect(header().exists("X-XSS-Protection"));
        }

        @Test
        @DisplayName("Deve definir Content-Type correto")
        @WithMockUser(username = "content-type", roles = "USER")
        void deveDefinirContentTypeCorreto() throws Exception {
            // Arrange
            when(receitaService.findByReceitaId(eq(receitaId))).thenReturn(mockReceita);

            // Act & Assert
            mockMvc.perform(get("/receitas/{id}", receitaId))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON));
        }
    }

    @Nested
    @DisplayName("Testes de Segurança de Input")
    class TestesSegurancaInput {

        @Test
        @DisplayName("Deve permitir usuário autenticado criar receita")
        @WithMockUser(username = "authenticated-user", roles = "USER")
        void devePermitirUsuarioAutenticadoCriarReceita() throws Exception {
            // Arrange
            when(receitaService.save(any(ReceitaRecordDto.class))).thenReturn(mockReceita);

            // Act & Assert
            mockMvc.perform(post("/receitas")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(receitaRecordDto))
                    .with(csrf()))
                    .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("Deve negar acesso a usuário não autenticado para criar receita")
        @WithAnonymousUser
        void deveNegarAcessoUsuarioNaoAutenticadoParaCriarReceita() throws Exception {
            // Act & Assert
            mockMvc.perform(post("/receitas")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(receitaRecordDto))
                    .with(csrf()))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("Testes de Rate Limiting (Simulação)")
    class TestesRateLimiting {

        @Test
        @DisplayName("Deve simular comportamento de rate limiting")
        @WithMockUser(username = "rate-limit", roles = "USER")
        void deveSimularComportamentoRateLimiting() throws Exception {
            // Arrange
            when(receitaService.findByReceitaId(eq(receitaId))).thenReturn(mockReceita);

            // Act & Assert - Simular múltiplas requisições
            for (int i = 0; i < 5; i++) {
                mockMvc.perform(get("/receitas/{id}", receitaId))
                        .andExpect(status().isOk());
            }

            // Em um cenário real, após muitas requisições, deveria retornar 429 Too Many Requests
            // Aqui apenas verificamos que as requisições normais funcionam
        }
    }
}