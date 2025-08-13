package br.com.marcosferreira.receitasecreta.api.unit.models;

import br.com.marcosferreira.receitasecreta.api.BaseUnitTest;
import br.com.marcosferreira.receitasecreta.api.enums.CategoriaReceita;
import br.com.marcosferreira.receitasecreta.api.enums.Dificuldade;
import br.com.marcosferreira.receitasecreta.api.models.ReceitaModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Nested;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Testes unitários para ReceitaModel.
 * Testa validações, getters/setters e comportamentos do modelo.
 */
@DisplayName("ReceitaModel Tests")
class ReceitaModelTest extends BaseUnitTest {

    private ReceitaModel receita;
    private LocalDateTime fixedDateTime;
    private UUID fixedUUID;

    @BeforeEach
    void setUpReceita() {
        receita = new ReceitaModel();
        fixedDateTime = LocalDateTime.of(2024, 1, 15, 10, 30, 0);
        fixedUUID = UUID.randomUUID();
    }

    @Nested
    @DisplayName("Campos Obrigatórios")
    class CamposObrigatorios {

        @Test
        @DisplayName("Deve definir e recuperar receitaId corretamente")
        void deveDefinirERecuperarReceitaId() {
            // Arrange & Act
            receita.setReceitaId(fixedUUID);

            // Assert
            assertThat(receita.getReceitaId()).isEqualTo(fixedUUID);
        }

        @Test
        @DisplayName("Deve definir e recuperar nomeReceita corretamente")
        void deveDefinirERecuperarNomeReceita() {
            // Arrange
            String nomeReceita = "Bolo de Chocolate";

            // Act
            receita.setNomeReceita(nomeReceita);

            // Assert
            assertThat(receita.getNomeReceita()).isEqualTo(nomeReceita);
        }

        @Test
        @DisplayName("Deve definir e recuperar modoPreparo corretamente")
        void deveDefinirERecuperarModoPreparo() {
            // Arrange
            String modoPreparo = "Misture todos os ingredientes e asse por 40 minutos";

            // Act
            receita.setModoPreparo(modoPreparo);

            // Assert
            assertThat(receita.getModoPreparo()).isEqualTo(modoPreparo);
        }

        @Test
        @DisplayName("Deve definir e recuperar tempoPreparo corretamente")
        void deveDefinirERecuperarTempoPreparo() {
            // Arrange
            String tempoPreparo = "1 hora";

            // Act
            receita.setTempoPreparo(tempoPreparo);

            // Assert
            assertThat(receita.getTempoPreparo()).isEqualTo(tempoPreparo);
        }

        @Test
        @DisplayName("Deve definir e recuperar rendimento corretamente")
        void deveDefinirERecuperarRendimento() {
            // Arrange
            String rendimento = "8 porções";

            // Act
            receita.setRendimento(rendimento);

            // Assert
            assertThat(receita.getRendimento()).isEqualTo(rendimento);
        }

        @Test
        @DisplayName("Deve definir e recuperar categoria corretamente")
        void deveDefinirERecuperarCategoria() {
            // Arrange & Act
            receita.setCategoria(CategoriaReceita.SOBREMESA);

            // Assert
            assertThat(receita.getCategoria()).isEqualTo(CategoriaReceita.SOBREMESA);
        }

        @Test
        @DisplayName("Deve definir e recuperar userId corretamente")
        void deveDefinirERecuperarUserId() {
            // Arrange
            String userId = "user123";

            // Act
            receita.setUserId(userId);

            // Assert
            assertThat(receita.getUserId()).isEqualTo(userId);
        }

        @Test
        @DisplayName("Deve definir e recuperar createdBy corretamente")
        void deveDefinirERecuperarCreatedBy() {
            // Arrange
            String createdBy = "admin";

            // Act
            receita.setCreatedBy(createdBy);

            // Assert
            assertThat(receita.getCreatedBy()).isEqualTo(createdBy);
        }
    }

    @Nested
    @DisplayName("Campos Opcionais")
    class CamposOpcionais {

        @Test
        @DisplayName("Deve definir e recuperar dificuldade corretamente")
        void deveDefinirERecuperarDificuldade() {
            // Arrange & Act
            receita.setDificuldade(Dificuldade.FACIL);

            // Assert
            assertThat(receita.getDificuldade()).isEqualTo(Dificuldade.FACIL);
        }

        @Test
        @DisplayName("Deve permitir dificuldade nula")
        void devePermitirDificuldadeNula() {
            // Arrange & Act
            receita.setDificuldade(null);

            // Assert
            assertThat(receita.getDificuldade()).isNull();
        }

        @Test
        @DisplayName("Deve definir e recuperar notas corretamente")
        void deveDefinirERecuperarNotas() {
            // Arrange
            String notas = "Receita da vovó, muito especial";

            // Act
            receita.setNotas(notas);

            // Assert
            assertThat(receita.getNotas()).isEqualTo(notas);
        }

        @Test
        @DisplayName("Deve definir e recuperar tags corretamente")
        void deveDefinirERecuperarTags() {
            // Arrange
            String tags = "chocolate,festa,aniversário";

            // Act
            receita.setTags(tags);

            // Assert
            assertThat(receita.getTags()).isEqualTo(tags);
        }

        @Test
        @DisplayName("Deve definir e recuperar updatedBy corretamente")
        void deveDefinirERecuperarUpdatedBy() {
            // Arrange
            String updatedBy = "editor";

            // Act
            receita.setUpdatedBy(updatedBy);

            // Assert
            assertThat(receita.getUpdatedBy()).isEqualTo(updatedBy);
        }
    }

    @Nested
    @DisplayName("Campo Favorita")
    class CampoFavorita {

        @Test
        @DisplayName("Deve ter valor padrão false para favorita")
        void deveTerValorPadraoFalseParaFavorita() {
            // Arrange
            ReceitaModel novaReceita = new ReceitaModel();

            // Assert
            assertThat(novaReceita.getFavorita()).isFalse();
        }

        @Test
        @DisplayName("Deve permitir definir favorita como true")
        void devePermitirDefinirFavoritaComoTrue() {
            // Arrange & Act
            receita.setFavorita(true);

            // Assert
            assertThat(receita.getFavorita()).isTrue();
        }

        @Test
        @DisplayName("Deve permitir definir favorita como false")
        void devePermitirDefinirFavoritaComoFalse() {
            // Arrange
            receita.setFavorita(true); // Primeiro define como true

            // Act
            receita.setFavorita(false);

            // Assert
            assertThat(receita.getFavorita()).isFalse();
        }
    }

    @Nested
    @DisplayName("Campos de Data")
    class CamposDeData {

        @Test
        @DisplayName("Deve definir e recuperar dataCriacao corretamente")
        void deveDefinirERecuperarDataCriacao() {
            // Arrange & Act
            receita.setDataCriacao(fixedDateTime);

            // Assert
            assertThat(receita.getDataCriacao()).isEqualTo(fixedDateTime);
        }

        @Test
        @DisplayName("Deve definir e recuperar dataAlteracao corretamente")
        void deveDefinirERecuperarDataAlteracao() {
            // Arrange & Act
            receita.setDataAlteracao(fixedDateTime);

            // Assert
            assertThat(receita.getDataAlteracao()).isEqualTo(fixedDateTime);
        }

        @Test
        @DisplayName("Deve definir e recuperar createdAt corretamente")
        void deveDefinirERecuperarCreatedAt() {
            // Arrange & Act
            receita.setCreatedAt(fixedDateTime);

            // Assert
            assertThat(receita.getCreatedAt()).isEqualTo(fixedDateTime);
        }

        @Test
        @DisplayName("Deve definir e recuperar updatedAt corretamente")
        void deveDefinirERecuperarUpdatedAt() {
            // Arrange & Act
            receita.setUpdatedAt(fixedDateTime);

            // Assert
            assertThat(receita.getUpdatedAt()).isEqualTo(fixedDateTime);
        }
    }

    @Nested
    @DisplayName("Cenários Completos")
    class CenariosCompletos {

        @Test
        @DisplayName("Deve criar receita completa com todos os campos")
        void deveCriarReceitaCompletaComTodosOsCampos() {
            // Arrange
            String nomeReceita = "Lasanha Bolonhesa";
            String modoPreparo = "Prepare o molho, monte as camadas e asse";
            String tempoPreparo = "2 horas";
            String rendimento = "6 porções";
            String notas = "Receita tradicional italiana";
            String tags = "massa,carne,queijo";
            String userId = "user456";
            String createdBy = "chef";
            String updatedBy = "assistant";

            // Act
            receita.setReceitaId(fixedUUID);
            receita.setNomeReceita(nomeReceita);
            receita.setModoPreparo(modoPreparo);
            receita.setTempoPreparo(tempoPreparo);
            receita.setRendimento(rendimento);
            receita.setCategoria(CategoriaReceita.SALGADO);
            receita.setDificuldade(Dificuldade.COMPLEXA);
            receita.setNotas(notas);
            receita.setTags(tags);
            receita.setFavorita(true);
            receita.setDataCriacao(fixedDateTime);
            receita.setDataAlteracao(fixedDateTime);
            receita.setUserId(userId);
            receita.setCreatedBy(createdBy);
            receita.setCreatedAt(fixedDateTime);
            receita.setUpdatedAt(fixedDateTime);
            receita.setUpdatedBy(updatedBy);

            // Assert
            assertThat(receita.getReceitaId()).isEqualTo(fixedUUID);
            assertThat(receita.getNomeReceita()).isEqualTo(nomeReceita);
            assertThat(receita.getModoPreparo()).isEqualTo(modoPreparo);
            assertThat(receita.getTempoPreparo()).isEqualTo(tempoPreparo);
            assertThat(receita.getRendimento()).isEqualTo(rendimento);
            assertThat(receita.getCategoria()).isEqualTo(CategoriaReceita.SALGADO);
            assertThat(receita.getDificuldade()).isEqualTo(Dificuldade.COMPLEXA);
            assertThat(receita.getNotas()).isEqualTo(notas);
            assertThat(receita.getTags()).isEqualTo(tags);
            assertThat(receita.getFavorita()).isTrue();
            assertThat(receita.getDataCriacao()).isEqualTo(fixedDateTime);
            assertThat(receita.getDataAlteracao()).isEqualTo(fixedDateTime);
            assertThat(receita.getUserId()).isEqualTo(userId);
            assertThat(receita.getCreatedBy()).isEqualTo(createdBy);
            assertThat(receita.getCreatedAt()).isEqualTo(fixedDateTime);
            assertThat(receita.getUpdatedAt()).isEqualTo(fixedDateTime);
            assertThat(receita.getUpdatedBy()).isEqualTo(updatedBy);
        }

        @Test
        @DisplayName("Deve criar receita mínima apenas com campos obrigatórios")
        void deveCriarReceitaMinimaApenasComCamposObrigatorios() {
            // Arrange
            String nomeReceita = "Receita Simples";
            String modoPreparo = "Modo simples";
            String tempoPreparo = "30 min";
            String rendimento = "2 porções";
            String userId = "user789";
            String createdBy = "user";

            // Act
            receita.setNomeReceita(nomeReceita);
            receita.setModoPreparo(modoPreparo);
            receita.setTempoPreparo(tempoPreparo);
            receita.setRendimento(rendimento);
            receita.setCategoria(CategoriaReceita.SOBREMESA);
            receita.setDataCriacao(fixedDateTime);
            receita.setDataAlteracao(fixedDateTime);
            receita.setUserId(userId);
            receita.setCreatedBy(createdBy);
            receita.setCreatedAt(fixedDateTime);

            // Assert - Campos obrigatórios
            assertThat(receita.getNomeReceita()).isEqualTo(nomeReceita);
            assertThat(receita.getModoPreparo()).isEqualTo(modoPreparo);
            assertThat(receita.getTempoPreparo()).isEqualTo(tempoPreparo);
            assertThat(receita.getRendimento()).isEqualTo(rendimento);
            assertThat(receita.getCategoria()).isEqualTo(CategoriaReceita.SOBREMESA);
            assertThat(receita.getFavorita()).isFalse(); // Valor padrão
            assertThat(receita.getDataCriacao()).isEqualTo(fixedDateTime);
            assertThat(receita.getDataAlteracao()).isEqualTo(fixedDateTime);
            assertThat(receita.getUserId()).isEqualTo(userId);
            assertThat(receita.getCreatedBy()).isEqualTo(createdBy);
            assertThat(receita.getCreatedAt()).isEqualTo(fixedDateTime);

            // Assert - Campos opcionais devem ser nulos
            assertThat(receita.getDificuldade()).isNull();
            assertThat(receita.getNotas()).isNull();
            assertThat(receita.getTags()).isNull();
            assertThat(receita.getUpdatedAt()).isNull();
            assertThat(receita.getUpdatedBy()).isNull();
        }
    }
}