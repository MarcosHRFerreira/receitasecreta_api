package br.com.marcosferreira.receitasecreta.api.unit.services;

import br.com.marcosferreira.receitasecreta.api.BaseUnitTest;
import br.com.marcosferreira.receitasecreta.api.dtos.request.ReceitaRecordDto;
import br.com.marcosferreira.receitasecreta.api.enums.CategoriaReceita;
import br.com.marcosferreira.receitasecreta.api.enums.Dificuldade;
import br.com.marcosferreira.receitasecreta.api.models.ReceitaModel;
import br.com.marcosferreira.receitasecreta.api.models.User;
import br.com.marcosferreira.receitasecreta.api.repositories.ReceitaRepository;
import br.com.marcosferreira.receitasecreta.api.configs.AuthenticationUtils;
import br.com.marcosferreira.receitasecreta.api.services.AuditService;
import br.com.marcosferreira.receitasecreta.api.services.impl.ReceitaServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Nested;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;


import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Testes unitários para ReceitaServiceImpl.
 * Testa a lógica de negócio do serviço de receitas.
 */
@DisplayName("ReceitaServiceImpl Tests")
class ReceitaServiceImplTest extends BaseUnitTest {

    @Mock
    private ReceitaRepository receitaRepository;

    @Mock
    private AuthenticationUtils authenticationUtils;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private ReceitaServiceImpl receitaService;

    private ReceitaModel receita;
    private UUID receitaId;
    private String userId;
    private User currentUser;
    private LocalDateTime fixedDateTime;
    private ReceitaRecordDto receitaRecordDto;

    @BeforeEach
    void setUpService() {
        receitaId = UUID.randomUUID();
        userId = "user123";
        fixedDateTime = LocalDateTime.of(2024, 1, 15, 10, 30, 0);
        
        // Setup User mock
        currentUser = new User();
        currentUser.setId(userId);
        currentUser.setLogin("usuario@teste.com");

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
        receita.setCreatedAt(fixedDateTime);
        receita.setDataCriacao(fixedDateTime);
        receita.setDataAlteracao(fixedDateTime);

        // Setup ReceitaRecordDto
        receitaRecordDto = new ReceitaRecordDto(
            "Bolo de Chocolate",
            "Misture todos os ingredientes e asse por 40 minutos",
            "1 hora",
            "8 porções",
            CategoriaReceita.SOBREMESA,
            Dificuldade.FACIL,
            "Receita da vovó",
            "chocolate,bolo,doce",
            true
        );
    }

    @Nested
    @DisplayName("Salvar Receita")
    class SalvarReceita {

        @Test
        @DisplayName("Deve salvar receita com sucesso")
        void deveSalvarReceitaComSucesso() {
            // Arrange
            when(authenticationUtils.getCurrentUser()).thenReturn(currentUser);
            when(receitaRepository.save(any(ReceitaModel.class))).thenReturn(receita);
            doNothing().when(auditService).auditReceitaChange(any(String.class), eq("CREATE"), eq(userId));

            // Act
            ReceitaModel resultado = receitaService.save(receitaRecordDto);

            // Assert
            assertThat(resultado).isNotNull();
            assertThat(resultado.getReceitaId()).isEqualTo(receitaId);
            assertThat(resultado.getUserId()).isEqualTo(userId);
            assertThat(resultado.getCreatedBy()).isEqualTo("user123");

            verify(authenticationUtils).getCurrentUser();
            verify(receitaRepository).save(any(ReceitaModel.class));
            verify(auditService, times(1)).auditReceitaChange(any(String.class), eq("CREATE"), eq(userId));
        }

        @Test
        @DisplayName("Deve definir userId automaticamente ao salvar")
        void deveDefinirUserIdAutomaticamenteAoSalvar() {
            // Arrange
            ReceitaModel receitaSemUserId = new ReceitaModel();
            receitaSemUserId.setNomeReceita("Receita Teste");
            
            when(authenticationUtils.getCurrentUser()).thenReturn(currentUser);
            when(receitaRepository.save(any(ReceitaModel.class))).thenAnswer(invocation -> {
                ReceitaModel savedReceita = invocation.getArgument(0);
                savedReceita.setReceitaId(receitaId);
                return savedReceita;
            });
            doNothing().when(auditService).auditReceitaChange(any(String.class), eq("CREATE"), eq(userId));

            // Act
            ReceitaModel resultado = receitaService.save(receitaRecordDto);

            // Assert
            assertThat(resultado.getUserId()).isEqualTo(userId);
            verify(authenticationUtils).getCurrentUser();
        }

        @Test
        @DisplayName("Deve chamar auditService ao salvar")
        void deveChamarAuditServiceAoSalvar() {
            // Arrange
            when(authenticationUtils.getCurrentUser()).thenReturn(currentUser);
            when(receitaRepository.save(any(ReceitaModel.class))).thenReturn(receita);
            doNothing().when(auditService).auditReceitaChange(any(String.class), eq("CREATE"), eq(userId));

            // Act
            receitaService.save(receitaRecordDto);

            // Assert
            verify(auditService, times(1)).auditReceitaChange(any(String.class), eq("CREATE"), eq(userId));
        }
    }

    @Nested
    @DisplayName("Buscar Receita por ID")
    class BuscarReceitaPorId {

        @Test
        @DisplayName("Deve retornar receita quando encontrada")
        void deveRetornarReceitaQuandoEncontrada() {
            // Arrange
            when(receitaRepository.findByReceitaId(receitaId)).thenReturn(receita);

            // Act
            ReceitaModel resultado = receitaService.findByReceitaId(receitaId);

            // Assert
            assertThat(resultado).isNotNull();
            assertThat(resultado.getReceitaId()).isEqualTo(receitaId);
            assertThat(resultado.getNomeReceita()).isEqualTo("Bolo de Chocolate");

            verify(receitaRepository).findByReceitaId(receitaId);
        }

        @Test
        @DisplayName("Deve lançar exceção quando receita não encontrada")
        void deveLancarExcecaoQuandoReceitaNaoEncontrada() {
            // Arrange
            UUID receitaIdInexistente = UUID.randomUUID();
            when(receitaRepository.findByReceitaId(receitaIdInexistente)).thenReturn(null);

            // Act & Assert
            assertThatThrownBy(() -> receitaService.findByReceitaId(receitaIdInexistente))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("não encontrada");

            verify(receitaRepository).findByReceitaId(receitaIdInexistente);
        }
    }

    @Nested
    @DisplayName("Atualizar Receita")
    class AtualizarReceita {

        @Test
        @DisplayName("Deve atualizar receita com sucesso")
        void deveAtualizarReceitaComSucesso() {
            // Arrange
            ReceitaModel receitaAtualizada = new ReceitaModel();
            receitaAtualizada.setReceitaId(receitaId);
            receitaAtualizada.setNomeReceita("Bolo de Chocolate Atualizado");
            receitaAtualizada.setModoPreparo("Novo modo de preparo");
            receitaAtualizada.setUserId(userId);

            when(receitaRepository.findByReceitaId(receitaId)).thenReturn(receita);
            when(authenticationUtils.getCurrentUser()).thenReturn(currentUser);
            when(receitaRepository.save(any(ReceitaModel.class))).thenReturn(receitaAtualizada);
            doNothing().when(auditService).auditReceitaChange(any(String.class), eq("UPDATE"), eq(userId));

            // Act
            ReceitaModel resultado = receitaService.update(receitaRecordDto, receitaId);

            // Assert
            assertThat(resultado).isNotNull();
            assertThat(resultado.getReceitaId()).isEqualTo(receitaId);
            assertThat(resultado.getNomeReceita()).isEqualTo("Bolo de Chocolate Atualizado");

            verify(receitaRepository).findByReceitaId(receitaId);
            verify(authenticationUtils).getCurrentUser();
            verify(receitaRepository).save(any(ReceitaModel.class));
            verify(auditService, times(1)).auditReceitaChange(eq(receitaId.toString()), eq("UPDATE"), eq(userId));
        }

        @Test
        @DisplayName("Deve chamar auditService ao atualizar")
        void deveChamarAuditServiceAoAtualizar() {
            // Arrange
            when(receitaRepository.findByReceitaId(receitaId)).thenReturn(receita);
            when(authenticationUtils.getCurrentUser()).thenReturn(currentUser);
            when(receitaRepository.save(any(ReceitaModel.class))).thenReturn(receita);
            doNothing().when(auditService).auditReceitaChange(any(String.class), eq("UPDATE"), eq(userId));

            // Act
            receitaService.update(receitaRecordDto, receitaId);

            // Assert
            verify(auditService).auditReceitaChange(any(String.class), eq("UPDATE"), eq(userId));
        }
    }

    @Nested
    @DisplayName("Listar Receitas")
    class ListarReceitas {

        @Test
        @DisplayName("Deve retornar página de receitas")
        void deveRetornarPaginaDeReceitas() {
            // Arrange
            ReceitaModel receita2 = new ReceitaModel();
            receita2.setReceitaId(UUID.randomUUID());
            receita2.setNomeReceita("Torta de Limão");
            receita2.setUserId(userId);

            List<ReceitaModel> receitas = Arrays.asList(receita, receita2);
            Page<ReceitaModel> page = new PageImpl<>(receitas);
            Pageable pageable = PageRequest.of(0, 10);

            when(receitaRepository.findAll(eq(pageable))).thenReturn(page);

            // Act
            Page<ReceitaModel> resultado = receitaService.findAll(pageable);

            // Assert
            assertThat(resultado).isNotNull();
            assertThat(resultado.getContent()).hasSize(2);
            assertThat(resultado.getContent().get(0).getNomeReceita()).isEqualTo("Bolo de Chocolate");
            assertThat(resultado.getContent().get(1).getNomeReceita()).isEqualTo("Torta de Limão");

            verify(receitaRepository).findAll(eq(pageable));
        }

        @Test
        @DisplayName("Deve retornar página vazia quando não há receitas")
        void deveRetornarPaginaVaziaQuandoNaoHaReceitas() {
            // Arrange
            Page<ReceitaModel> pageVazia = new PageImpl<>(Arrays.asList());
            Pageable pageable = PageRequest.of(0, 10);

            when(receitaRepository.findAll(eq(pageable))).thenReturn(pageVazia);

            // Act
            Page<ReceitaModel> resultado = receitaService.findAll(pageable);

            // Assert
            assertThat(resultado).isNotNull();
            assertThat(resultado.getContent()).isEmpty();
            assertThat(resultado.getTotalElements()).isZero();

            verify(receitaRepository).findAll(eq(pageable));
        }
    }

    @Nested
    @DisplayName("Deletar Receita")
    class DeletarReceita {

        @Test
        @DisplayName("Deve deletar receita com sucesso")
        void deveDeletarReceitaComSucesso() {
            // Arrange
            when(receitaRepository.findByReceitaId(receitaId)).thenReturn(receita);
            when(authenticationUtils.getCurrentUser()).thenReturn(currentUser);
            doNothing().when(receitaRepository).deleteById(receitaId);
            doNothing().when(auditService).auditReceitaChange(any(String.class), eq("DELETE"), eq(userId));

            // Act
            receitaService.delete(receitaId);

            // Assert
            verify(receitaRepository).findByReceitaId(receitaId);
            verify(authenticationUtils).getCurrentUser();
            verify(receitaRepository).deleteById(receitaId);
            verify(auditService).auditReceitaChange(any(String.class), eq("DELETE"), eq(userId));
        }

        @Test
        @DisplayName("Deve chamar auditService ao deletar")
        void deveChamarAuditServiceAoDeletar() {
            // Arrange
            when(receitaRepository.findByReceitaId(receitaId)).thenReturn(receita);
            when(authenticationUtils.getCurrentUser()).thenReturn(currentUser);
            doNothing().when(receitaRepository).deleteById(receitaId);
            doNothing().when(auditService).auditReceitaChange(any(String.class), eq("DELETE"), eq(userId));

            // Act
            receitaService.delete(receitaId);

            // Assert
            verify(auditService).auditReceitaChange(any(String.class), eq("DELETE"), eq(userId));
        }
    }

    @Nested
    @DisplayName("Cenários de Erro")
    class CenariosDeErro {

        @Test
        @DisplayName("Deve lançar exceção quando authenticationUtils falha")
        void deveLancarExcecaoQuandoAuthenticationUtilsFalha() {
            // Arrange
            when(authenticationUtils.getCurrentUser()).thenThrow(new RuntimeException("Erro de autenticação"));

            // Act & Assert
            assertThatThrownBy(() -> receitaService.save(receitaRecordDto))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Erro de autenticação");

            verify(authenticationUtils).getCurrentUser();
            verify(receitaRepository, never()).save(any());
            verify(auditService, never()).auditReceitaChange(any(String.class), any(String.class), any(String.class));
        }

        @Test
        @DisplayName("Deve lançar exceção quando repository falha ao salvar")
        void deveLancarExcecaoQuandoRepositoryFalhaAoSalvar() {
            // Arrange
            when(authenticationUtils.getCurrentUser()).thenReturn(currentUser);
            when(receitaRepository.save(any(ReceitaModel.class)))
                    .thenThrow(new RuntimeException("Erro no banco de dados"));

            // Act & Assert
            assertThatThrownBy(() -> receitaService.save(receitaRecordDto))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Erro no banco de dados");

            verify(authenticationUtils).getCurrentUser();
            verify(receitaRepository).save(any(ReceitaModel.class));
            verify(auditService, never()).auditReceitaChange(any(String.class), any(String.class), any(String.class));
        }
    }

    @Nested
    @DisplayName("Integração com Dependências")
    class IntegracaoComDependencias {

        @Test
        @DisplayName("Deve interagir corretamente com todas as dependências ao salvar")
        void deveInteragirCorretamenteComTodasAsDependenciasAoSalvar() {
            // Arrange
            when(authenticationUtils.getCurrentUser()).thenReturn(currentUser);
            when(receitaRepository.save(any(ReceitaModel.class))).thenReturn(receita);
            doNothing().when(auditService).auditReceitaChange(any(String.class), eq("CREATE"), eq(userId));

            // Act
            ReceitaModel resultado = receitaService.save(receitaRecordDto);

            // Assert
            assertThat(resultado).isNotNull();

            // Verificar ordem de chamadas
            var inOrder = inOrder(authenticationUtils, receitaRepository, auditService);
            inOrder.verify(authenticationUtils).getCurrentUser();
            inOrder.verify(receitaRepository).save(any(ReceitaModel.class));
            inOrder.verify(auditService).auditReceitaChange(any(String.class), eq("CREATE"), eq(userId));
        }

        @Test
        @DisplayName("Deve interagir corretamente com todas as dependências ao atualizar")
        void deveInteragirCorretamenteComTodasAsDependenciasAoAtualizar() {
            // Arrange
            when(authenticationUtils.getCurrentUser()).thenReturn(currentUser);
            when(receitaRepository.findByReceitaId(receitaId)).thenReturn(receita);
            when(receitaRepository.save(any(ReceitaModel.class))).thenReturn(receita);
            doNothing().when(auditService).auditReceitaChange(any(String.class), eq("UPDATE"), eq(userId));

            // Act
            ReceitaModel resultado = receitaService.update(receitaRecordDto, receitaId);

            // Assert
            assertThat(resultado).isNotNull();

            // Verificar ordem de chamadas
            var inOrder = inOrder(authenticationUtils, receitaRepository, auditService);
            inOrder.verify(authenticationUtils).getCurrentUser();
            inOrder.verify(receitaRepository).save(any(ReceitaModel.class));
            inOrder.verify(auditService).auditReceitaChange(any(String.class), eq("UPDATE"), eq(userId));
        }
    }
}