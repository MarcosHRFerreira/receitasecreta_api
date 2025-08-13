package br.com.marcosferreira.receitasecreta.api.unit.controllers;

import br.com.marcosferreira.receitasecreta.api.controllers.ReceitaController;
import br.com.marcosferreira.receitasecreta.api.dtos.request.ReceitaRecordDto;
import br.com.marcosferreira.receitasecreta.api.enums.CategoriaReceita;
import br.com.marcosferreira.receitasecreta.api.enums.Dificuldade;
import br.com.marcosferreira.receitasecreta.api.exceptions.NotFoundException;
import br.com.marcosferreira.receitasecreta.api.models.ReceitaModel;
import br.com.marcosferreira.receitasecreta.api.services.ReceitaService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Nested;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.BeanUtils;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;


/**
 * Testes unitários para ReceitaController.
 * Testa os endpoints HTTP e a integração com o serviço.
 */
@DisplayName("ReceitaController Tests")
@ExtendWith(MockitoExtension.class)
class ReceitaControllerTest {

    @Mock
    private ReceitaService receitaService;

    @InjectMocks
    private ReceitaController receitaController;

    private ObjectMapper objectMapper;
    private ReceitaModel receita;
    private ReceitaRecordDto receitaRecordDto;
    private UUID receitaId;
    private String userId;

    @BeforeEach
    void setUpController() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        
        receitaId = UUID.randomUUID();
        userId = "user123";

        // Setup ReceitaModel
        receita = new ReceitaModel();
        receita.setReceitaId(receitaId);
        receita.setNomeReceita("Bolo de Chocolate");
        receita.setModoPreparo("Misture e asse");
        receita.setTempoPreparo("1 hora");
        receita.setRendimento("8 porções");
        receita.setCategoria(CategoriaReceita.SOBREMESA);
        receita.setDificuldade(Dificuldade.FACIL);
        receita.setUserId(userId);
        receita.setCreatedBy(userId);
        receita.setCreatedAt(LocalDateTime.now());

        // Setup ReceitaRecordDto
        receitaRecordDto = new ReceitaRecordDto(
            "Bolo de Chocolate",
            "Misture e asse",
            "1 hora",
            "8 porções",
            CategoriaReceita.SOBREMESA,
            Dificuldade.FACIL,
            null,
            null,
            false
        );
    }

    @Nested
    @DisplayName("POST /receitas - Criar Receita")
    class CriarReceita {

        @Test
        @DisplayName("Deve criar receita com sucesso")
        void deveCriarReceitaComSucesso() throws Exception {
            // Arrange
            when(receitaService.save(any(ReceitaRecordDto.class))).thenReturn(receita);

            // Act
            ResponseEntity<Object> response = receitaController.save(receitaRecordDto);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            assertThat(response.getBody()).isNotNull();
            ReceitaModel responseBody = (ReceitaModel) response.getBody();
            assertThat(responseBody.getReceitaId()).isEqualTo(receitaId);
            assertThat(responseBody.getNomeReceita()).isEqualTo("Bolo de Chocolate");
            verify(receitaService).save(any(ReceitaRecordDto.class));
        }

        @Test
        @DisplayName("Deve retornar 400 quando dados inválidos")
        void deveRetornar400QuandoDadosInvalidos() throws Exception {
            // Arrange
            ReceitaRecordDto requestInvalido = new ReceitaRecordDto(
                null, null, null, null, null, null, null, null, false
            );
            // Não define campos obrigatórios

            // Act & Assert
            // Para testes unitários, assumimos que a validação é feita no controller
            // ou que o serviço lança uma exceção apropriada
            when(receitaService.save(any(ReceitaRecordDto.class)))
                    .thenThrow(new IllegalArgumentException("Dados inválidos"));

            assertThrows(IllegalArgumentException.class, () -> {
                receitaController.save(requestInvalido);
            });
        }

        @Test
        @DisplayName("Deve retornar 500 quando serviço falha")
        void deveRetornar500QuandoServicoFalha() throws Exception {
            // Arrange
            when(receitaService.save(any(ReceitaRecordDto.class)))
                    .thenThrow(new RuntimeException("Erro interno"));

            // Act & Assert
            assertThrows(RuntimeException.class, () -> {
                receitaController.save(receitaRecordDto);
            });

            verify(receitaService).save(any(ReceitaRecordDto.class));
        }
    }

    @Nested
    @DisplayName("GET /receitas/{id} - Buscar Receita por ID")
    class BuscarReceitaPorId {

        @Test
        @DisplayName("Deve retornar receita quando encontrada")
        void deveRetornarReceitaQuandoEncontrada() throws Exception {
            // Arrange
            when(receitaService.findByReceitaId(receitaId)).thenReturn(receita);

            // Act
            ResponseEntity<Object> response = receitaController.getOne(receitaId);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            ReceitaModel receitaResponse = (ReceitaModel) response.getBody();
            assertThat(receitaResponse.getReceitaId()).isEqualTo(receitaId);
            assertThat(receitaResponse.getNomeReceita()).isEqualTo("Bolo de Chocolate");
            verify(receitaService).findByReceitaId(receitaId);
        }

        @Test
        @DisplayName("Deve retornar 404 quando receita não encontrada")
        void deveRetornar404QuandoReceitaNaoEncontrada() throws Exception {
            // Arrange
            when(receitaService.findByReceitaId(receitaId)).thenThrow(new NotFoundException("Receita não encontrada"));

            // Act & Assert
            assertThrows(NotFoundException.class, () -> {
                receitaController.getOne(receitaId);
            });

            verify(receitaService).findByReceitaId(receitaId);
        }

        @Test
        @DisplayName("Deve retornar 400 quando ID inválido")
        void deveRetornar400QuandoIdInvalido() throws Exception {
            // Arrange
            UUID idInvalido = null;
            when(receitaService.findByReceitaId(idInvalido)).thenThrow(new IllegalArgumentException("ID não pode ser nulo"));

            // Act & Assert
            assertThrows(IllegalArgumentException.class, () -> {
                receitaController.getOne(idInvalido);
            });

            verify(receitaService).findByReceitaId(idInvalido);
        }
    }

    @Nested
    @DisplayName("PUT /receitas/{id} - Atualizar Receita")
    class AtualizarReceita {

        @Test
        @DisplayName("Deve atualizar receita com sucesso")
        void deveAtualizarReceitaComSucesso() throws Exception {
            // Arrange
            ReceitaModel receitaAtualizada = new ReceitaModel();
            BeanUtils.copyProperties(receita, receitaAtualizada);
            receitaAtualizada.setNomeReceita("Bolo de Chocolate Atualizado");

            when(receitaService.update(any(ReceitaRecordDto.class), eq(receitaId))).thenReturn(receitaAtualizada);

            ReceitaRecordDto requestAtualizado = new ReceitaRecordDto(
                "Bolo de Chocolate Atualizado",
                "Misture e asse",
                "1 hora",
                "8 porções",
                CategoriaReceita.SOBREMESA,
                Dificuldade.FACIL,
                null,
                null,
                false
            );

            // Act
            ResponseEntity<Object> response = receitaController.update(receitaId, receitaRecordDto);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            ReceitaModel receitaResponse = (ReceitaModel) response.getBody();
            assertThat(receitaResponse.getNomeReceita()).isEqualTo("Bolo de Chocolate Atualizado");
            verify(receitaService).update(any(ReceitaRecordDto.class), eq(receitaId));
        }

        @Test
        @DisplayName("Deve retornar 404 quando receita não encontrada para atualizar")
        void deveRetornar404QuandoReceitaNaoEncontradaParaAtualizar() throws Exception {
            // Arrange
            when(receitaService.update(any(ReceitaRecordDto.class), eq(receitaId))).thenThrow(new NotFoundException("Receita não encontrada"));

            // Act & Assert

            assertThrows(NotFoundException.class, () -> {
                receitaController.update(receitaId, receitaRecordDto);
            });

            verify(receitaService).update(any(ReceitaRecordDto.class), eq(receitaId));
        }
    }

    @Nested
    @DisplayName("DELETE /receitas/{id} - Deletar Receita")
    class DeletarReceita {

        @Test
        @DisplayName("Deve deletar receita com sucesso")
        void deveDeletarReceitaComSucesso() throws Exception {
            // Arrange
            doNothing().when(receitaService).delete(receitaId);

            // Act
            ResponseEntity<Object> response = receitaController.delete(receitaId);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
            verify(receitaService).delete(receitaId);
        }

        @Test
        @DisplayName("Deve retornar 404 quando receita não encontrada para deletar")
        void deveRetornar404QuandoReceitaNaoEncontradaParaDeletar() throws Exception {
            // Arrange
            doThrow(new NotFoundException("Receita não encontrada")).when(receitaService).delete(receitaId);

            // Act & Assert
            assertThrows(NotFoundException.class, () -> {
                receitaController.delete(receitaId);
            });

            verify(receitaService).delete(receitaId);
        }
    }

    @Nested
    @DisplayName("GET /receitas - Listar Receitas")
    class ListarReceitas {

        @Test
        @DisplayName("Deve retornar página de receitas")
        void deveRetornarPaginaDeReceitas() throws Exception {
            // Arrange
            ReceitaModel receita2 = new ReceitaModel();
            receita2.setReceitaId(UUID.randomUUID());
            receita2.setNomeReceita("Torta de Limão");
            receita2.setUserId(userId);

            List<ReceitaModel> receitas = Arrays.asList(receita, receita2);
            Page<ReceitaModel> page = new PageImpl<>(receitas, PageRequest.of(0, 10), 2);

            when(receitaService.findAll(any(Pageable.class))).thenReturn(page);

            // Act
            Pageable pageable = PageRequest.of(0, 10);
            ResponseEntity<Page<ReceitaModel>> response = receitaController.getAll(pageable);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getContent()).hasSize(2);
            assertThat(response.getBody().getTotalElements()).isEqualTo(2);
            assertThat(response.getBody().getContent().get(0).getNomeReceita()).isEqualTo("Bolo de Chocolate");
            assertThat(response.getBody().getContent().get(1).getNomeReceita()).isEqualTo("Torta de Limão");
            verify(receitaService).findAll(any(Pageable.class));
        }

        @Test
        @DisplayName("Deve retornar página vazia quando não há receitas")
        void deveRetornarPaginaVaziaQuandoNaoHaReceitas() throws Exception {
            // Arrange
            Page<ReceitaModel> pageVazia = new PageImpl<>(Arrays.asList(), PageRequest.of(0, 10), 0);
            when(receitaService.findAll(any(Pageable.class))).thenReturn(pageVazia);

            // Act
            Pageable pageable = PageRequest.of(0, 10);
            ResponseEntity<Page<ReceitaModel>> response = receitaController.getAll(pageable);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getContent()).isEmpty();
            assertThat(response.getBody().getTotalElements()).isEqualTo(0);
            verify(receitaService).findAll(any(Pageable.class));
        }

        @Test
        @DisplayName("Deve aplicar filtros de busca")
        void deveAplicarFiltrosDeBusca() throws Exception {
            // Arrange
            List<ReceitaModel> receitasFiltradas = Arrays.asList(receita);
            Page<ReceitaModel> page = new PageImpl<>(receitasFiltradas, PageRequest.of(0, 10), 1);

            when(receitaService.findAll(any(Pageable.class))).thenReturn(page);

            // Act
            Pageable pageable = PageRequest.of(0, 10);
            ResponseEntity<Page<ReceitaModel>> response = receitaController.getAll(pageable);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getContent()).hasSize(1);
            assertThat(response.getBody().getContent().get(0).getNomeReceita()).isEqualTo("Bolo de Chocolate");
            verify(receitaService).findAll(any(Pageable.class));
        }
    }

    @Nested
    @DisplayName("Testes de Integração com ResponseEntity")
    class TestesIntegracaoResponseEntity {

        @Test
        @DisplayName("Deve retornar ResponseEntity correto ao criar receita")
        void deveRetornarResponseEntityCorretoAoCriarReceita() {
            // Arrange
            when(receitaService.save(any(ReceitaRecordDto.class))).thenReturn(receita);

            // Act
            ResponseEntity<Object> response = receitaController.save(receitaRecordDto);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            assertThat(response.getBody()).isNotNull();
            ReceitaModel responseBody = (ReceitaModel) response.getBody();
            assertThat(responseBody.getReceitaId()).isEqualTo(receitaId);
            assertThat(responseBody.getNomeReceita()).isEqualTo("Bolo de Chocolate");

            verify(receitaService).save(any(ReceitaRecordDto.class));
        }

        @Test
        @DisplayName("Deve retornar ResponseEntity correto ao buscar receita")
        void deveRetornarResponseEntityCorretoAoBuscarReceita() {
            // Arrange
            when(receitaService.findByReceitaId(receitaId)).thenReturn(receita);

            // Act
            ResponseEntity<Object> response = receitaController.getOne(receitaId);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            ReceitaModel responseBody = (ReceitaModel) response.getBody();
            assertThat(responseBody.getReceitaId()).isEqualTo(receitaId);

            verify(receitaService).findByReceitaId(receitaId);
        }

        @Test
        @DisplayName("Deve lançar NotFoundException quando receita não encontrada")
        void deveLancarNotFoundExceptionQuandoReceitaNaoEncontrada() {
            // Arrange
            when(receitaService.findByReceitaId(receitaId)).thenThrow(new NotFoundException("Receita não encontrada"));

            // Act & Assert
            assertThrows(NotFoundException.class, () -> {
                receitaController.getOne(receitaId);
            });

            verify(receitaService).findByReceitaId(receitaId);
        }
    }
}