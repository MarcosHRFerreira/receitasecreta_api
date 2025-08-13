package br.com.marcosferreira.receitasecreta.api.integration;

import br.com.marcosferreira.receitasecreta.api.BaseIntegrationTest;
import br.com.marcosferreira.receitasecreta.api.dtos.request.ReceitaRecordDto;
import br.com.marcosferreira.receitasecreta.api.enums.CategoriaReceita;
import br.com.marcosferreira.receitasecreta.api.enums.Dificuldade;
import br.com.marcosferreira.receitasecreta.api.models.ReceitaModel;
import br.com.marcosferreira.receitasecreta.api.repositories.ReceitaRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Nested;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testes de integração para ReceitaController.
 * Testa o fluxo completo da API com banco de dados real.
 */
@DisplayName("ReceitaController Integration Tests")
@AutoConfigureWebMvc
@Transactional
class ReceitaControllerIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ReceitaRepository receitaRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private ReceitaRecordDto receitaRecordDto;
    private ReceitaModel receitaExistente;
    private String userId;

    @BeforeEach
    void setUpIntegrationTest() {
        // Limpar dados antes de cada teste
        receitaRepository.deleteAll();
        
        userId = "integration-user";

        // Setup ReceitaRecordDto
        receitaRecordDto = new ReceitaRecordDto(
            "Bolo de Chocolate Integração",
            "Misture todos os ingredientes e asse por 40 minutos a 180°C",
            "1 hora e 30 minutos",
            "10 porções",
            CategoriaReceita.SOBREMESA,
            Dificuldade.FACIL,
            "Receita testada em ambiente de integração",
            "chocolate,festa,aniversário",
            true
        );

        // Setup ReceitaModel existente
        receitaExistente = new ReceitaModel();
        receitaExistente.setNomeReceita("Torta de Limão Existente");
        receitaExistente.setModoPreparo("Prepare a massa, o recheio e a cobertura");
        receitaExistente.setTempoPreparo("2 horas");
        receitaExistente.setRendimento("8 porções");
        receitaExistente.setCategoria(CategoriaReceita.SOBREMESA);
        receitaExistente.setDificuldade(Dificuldade.COMPLEXA);
        receitaExistente.setFavorita(false);
        receitaExistente.setDataCriacao(LocalDateTime.now());
        receitaExistente.setDataAlteracao(LocalDateTime.now());
        receitaExistente.setUserId(userId);
        receitaExistente.setCreatedBy(userId);
        receitaExistente.setCreatedAt(LocalDateTime.now());
    }

    @Nested
    @DisplayName("POST /receitas - Criar Receita (Integração)")
    class CriarReceitaIntegracao {

        @Test
        @DisplayName("Deve criar receita completa no banco de dados")
        @WithMockUser(username = "integration-user")
        void deveCriarReceitaCompletaNoBancoDeDados() throws Exception {
            // Arrange
            long countAntes = receitaRepository.count();

            // Act
            mockMvc.perform(post("/receitas")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(receitaRecordDto)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.nomeReceita").value("Bolo de Chocolate Integração"))
                    .andExpect(jsonPath("$.categoria").value("SOBREMESA"))
                    .andExpect(jsonPath("$.dificuldade").value("FACIL"))
                    .andExpect(jsonPath("$.favorita").value(true))
                    .andExpect(jsonPath("$.userId").value(userId))
                    .andExpect(jsonPath("$.receitaId").exists())
                    .andExpect(jsonPath("$.dataCriacao").exists())
                    .andExpect(jsonPath("$.dataAlteracao").exists());

            // Assert
            long countDepois = receitaRepository.count();
            assertThat(countDepois).isEqualTo(countAntes + 1);

            // Verificar se foi salva no banco
            ReceitaModel receitaSalva = receitaRepository.findAll().get(0);
            assertThat(receitaSalva.getNomeReceita()).isEqualTo("Bolo de Chocolate Integração");
            assertThat(receitaSalva.getCategoria()).isEqualTo(CategoriaReceita.SOBREMESA);
            assertThat(receitaSalva.getDificuldade()).isEqualTo(Dificuldade.FACIL);
            assertThat(receitaSalva.getFavorita()).isTrue();
            assertThat(receitaSalva.getUserId()).isEqualTo(userId);
            assertThat(receitaSalva.getCreatedBy()).isEqualTo(userId);
            assertThat(receitaSalva.getDataCriacao()).isNotNull();
            assertThat(receitaSalva.getDataAlteracao()).isNotNull();
        }

        @Test
        @DisplayName("Deve validar campos obrigatórios")
        @WithMockUser(username = "integration-user")
        void deveValidarCamposObrigatorios() throws Exception {
            // Arrange
            ReceitaRecordDto requestInvalido = new ReceitaRecordDto(
                null, null, null, null, null, null, null, null, null
            );
            // Não define campos obrigatórios

            // Act & Assert
            mockMvc.perform(post("/receitas")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(requestInvalido)))
                    .andExpect(status().isBadRequest());

            // Verificar que nada foi salvo
            assertThat(receitaRepository.count()).isZero();
        }

        @Test
        @DisplayName("Deve gerar ID automaticamente")
        @WithMockUser(username = "integration-user")
        void deveGerarIdAutomaticamente() throws Exception {
            // Act
            mockMvc.perform(post("/receitas")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(receitaRecordDto)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.receitaId").exists())
                    .andExpect(jsonPath("$.receitaId").isNotEmpty());

            // Assert
            ReceitaModel receitaSalva = receitaRepository.findAll().get(0);
            assertThat(receitaSalva.getReceitaId()).isNotNull();
        }
    }

    @Nested
    @DisplayName("GET /receitas/{id} - Buscar Receita por ID (Integração)")
    class BuscarReceitaPorIdIntegracao {

        @Test
        @DisplayName("Deve buscar receita existente no banco")
        @WithMockUser(username = "integration-user")
        void deveBuscarReceitaExistenteNoBanco() throws Exception {
            // Arrange
            ReceitaModel receitaSalva = receitaRepository.save(receitaExistente);
            UUID receitaId = receitaSalva.getReceitaId();

            // Act & Assert
            mockMvc.perform(get("/receitas/{id}", receitaId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.receitaId").value(receitaId.toString()))
                    .andExpect(jsonPath("$.nomeReceita").value("Torta de Limão Existente"))
                    .andExpect(jsonPath("$.categoria").value("SOBREMESA"))
                    .andExpect(jsonPath("$.dificuldade").value("COMPLEXA"))
                    .andExpect(jsonPath("$.userId").value(userId));
        }

        @Test
        @DisplayName("Deve retornar 404 para receita inexistente")
        @WithMockUser(username = "integration-user")
        void deveRetornar404ParaReceitaInexistente() throws Exception {
            // Arrange
            UUID receitaIdInexistente = UUID.randomUUID();

            // Act & Assert
            mockMvc.perform(get("/receitas/{id}", receitaIdInexistente))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("PUT /receitas/{id} - Atualizar Receita (Integração)")
    class AtualizarReceitaIntegracao {

        @Test
        @DisplayName("Deve atualizar receita existente no banco")
        @WithMockUser(username = "integration-user")
        void deveAtualizarReceitaExistenteNoBanco() throws Exception {
            // Arrange
            ReceitaModel receitaSalva = receitaRepository.save(receitaExistente);
            UUID receitaId = receitaSalva.getReceitaId();

            ReceitaRecordDto requestAtualizado = new ReceitaRecordDto(
                "Torta de Limão Atualizada",
                "Novo modo de preparo atualizado",
                "3 horas",
                "12 porções",
                CategoriaReceita.SOBREMESA,
                Dificuldade.FACIL,
                null,
                null,
                true
            );

            // Act
            mockMvc.perform(put("/receitas/{id}", receitaId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(requestAtualizado)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.receitaId").value(receitaId.toString()))
                    .andExpect(jsonPath("$.nomeReceita").value("Torta de Limão Atualizada"))
                    .andExpect(jsonPath("$.modoPreparo").value("Novo modo de preparo atualizado"))
                    .andExpect(jsonPath("$.tempoPreparo").value("3 horas"))
                    .andExpect(jsonPath("$.rendimento").value("12 porções"))
                    .andExpect(jsonPath("$.dificuldade").value("FACIL"))
                    .andExpect(jsonPath("$.favorita").value(true));

            // Assert - Verificar no banco
            ReceitaModel receitaAtualizada = receitaRepository.findById(receitaId).orElse(null);
            assertThat(receitaAtualizada).isNotNull();
            assertThat(receitaAtualizada.getNomeReceita()).isEqualTo("Torta de Limão Atualizada");
            assertThat(receitaAtualizada.getModoPreparo()).isEqualTo("Novo modo de preparo atualizado");
            assertThat(receitaAtualizada.getTempoPreparo()).isEqualTo("3 horas");
            assertThat(receitaAtualizada.getRendimento()).isEqualTo("12 porções");
            assertThat(receitaAtualizada.getDificuldade()).isEqualTo(Dificuldade.FACIL);
            assertThat(receitaAtualizada.getFavorita()).isTrue();
            assertThat(receitaAtualizada.getDataAlteracao()).isAfter(receitaSalva.getDataAlteracao());
        }

        @Test
        @DisplayName("Deve retornar 404 ao tentar atualizar receita inexistente")
        @WithMockUser(username = "integration-user")
        void deveRetornar404AoTentarAtualizarReceitaInexistente() throws Exception {
            // Arrange
            UUID receitaIdInexistente = UUID.randomUUID();

            // Act & Assert
            mockMvc.perform(put("/receitas/{id}", receitaIdInexistente)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(receitaRecordDto)))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("DELETE /receitas/{id} - Deletar Receita (Integração)")
    class DeletarReceitaIntegracao {

        @Test
        @DisplayName("Deve deletar receita existente do banco")
        @WithMockUser(username = "integration-user")
        void deveDeletarReceitaExistenteDoBanco() throws Exception {
            // Arrange
            ReceitaModel receitaSalva = receitaRepository.save(receitaExistente);
            UUID receitaId = receitaSalva.getReceitaId();
            long countAntes = receitaRepository.count();

            // Act
            mockMvc.perform(delete("/receitas/{id}", receitaId))
                    .andExpect(status().isNoContent());

            // Assert
            long countDepois = receitaRepository.count();
            assertThat(countDepois).isEqualTo(countAntes - 1);
            assertThat(receitaRepository.findById(receitaId)).isEmpty();
        }

        @Test
        @DisplayName("Deve retornar 404 ao tentar deletar receita inexistente")
        @WithMockUser(username = "integration-user")
        void deveRetornar404AoTentarDeletarReceitaInexistente() throws Exception {
            // Arrange
            UUID receitaIdInexistente = UUID.randomUUID();

            // Act & Assert
            mockMvc.perform(delete("/receitas/{id}", receitaIdInexistente))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /receitas - Listar Receitas (Integração)")
    class ListarReceitasIntegracao {

        @Test
        @DisplayName("Deve listar receitas com paginação")
        @WithMockUser(username = "integration-user")
        void deveListarReceitasComPaginacao() throws Exception {
            // Arrange
            ReceitaModel receita1 = criarReceita("Receita 1", CategoriaReceita.SOBREMESA);
            ReceitaModel receita2 = criarReceita("Receita 2", CategoriaReceita.SALGADO);
            ReceitaModel receita3 = criarReceita("Receita 3", CategoriaReceita.SOBREMESA);

            receitaRepository.saveAll(java.util.Arrays.asList(receita1, receita2, receita3));

            // Act & Assert
            mockMvc.perform(get("/receitas")
                    .param("page", "0")
                    .param("size", "2"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.content.length()").value(2))
                    .andExpect(jsonPath("$.totalElements").value(3))
                    .andExpect(jsonPath("$.totalPages").value(2))
                    .andExpect(jsonPath("$.size").value(2))
                    .andExpect(jsonPath("$.number").value(0));
        }

        @Test
        @DisplayName("Deve filtrar receitas por categoria")
        @WithMockUser(username = "integration-user")
        void deveFiltrarReceitasPorCategoria() throws Exception {
            // Arrange
            ReceitaModel receitaDoce = criarReceita("Bolo", CategoriaReceita.SOBREMESA);
            ReceitaModel receitaSalgada = criarReceita("Pizza", CategoriaReceita.SALGADO);

            receitaRepository.saveAll(java.util.Arrays.asList(receitaDoce, receitaSalgada));

            // Act & Assert
            mockMvc.perform(get("/receitas")
                    .param("categoria", "SOBREMESA"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content.length()").value(1))
                    .andExpect(jsonPath("$.content[0].nomeReceita").value("Bolo"))
                    .andExpect(jsonPath("$.content[0].categoria").value("SOBREMESA"));
        }

        @Test
        @DisplayName("Deve retornar lista vazia quando não há receitas")
        @WithMockUser(username = "integration-user")
        void deveRetornarListaVaziaQuandoNaoHaReceitas() throws Exception {
            // Act & Assert
            mockMvc.perform(get("/receitas"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.content.length()").value(0))
                    .andExpect(jsonPath("$.totalElements").value(0));
        }
    }

    @Nested
    @DisplayName("Testes de Transação")
    class TestesTransacao {

        @Test
        @DisplayName("Deve fazer rollback em caso de erro")
        @WithMockUser(username = "integration-user")
        void deveFazerRollbackEmCasoDeErro() throws Exception {
            // Arrange
            long countAntes = receitaRepository.count();
            
            // Criar um request que vai causar erro (nome muito longo, por exemplo)
            ReceitaRecordDto requestInvalido = new ReceitaRecordDto(
                "A".repeat(1000), // Nome muito longo
                "Modo",
                "1h",
                "1",
                CategoriaReceita.SOBREMESA,
                null,
                null,
                null,
                null
            );

            // Act
            try {
                mockMvc.perform(post("/receitas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestInvalido)));
            } catch (Exception e) {
                // Esperado falhar
            }

            // Assert
            long countDepois = receitaRepository.count();
            assertThat(countDepois).isEqualTo(countAntes); // Não deve ter salvado nada
        }
    }

    private ReceitaModel criarReceita(String nome, CategoriaReceita categoria) {
        ReceitaModel receita = new ReceitaModel();
        receita.setNomeReceita(nome);
        receita.setModoPreparo("Modo de preparo para " + nome);
        receita.setTempoPreparo("1 hora");
        receita.setRendimento("4 porções");
        receita.setCategoria(categoria);
        receita.setDificuldade(Dificuldade.FACIL);
        receita.setFavorita(false);
        receita.setDataCriacao(LocalDateTime.now());
        receita.setDataAlteracao(LocalDateTime.now());
        receita.setUserId(userId);
        receita.setCreatedBy(userId);
        receita.setCreatedAt(LocalDateTime.now());
        return receita;
    }
}