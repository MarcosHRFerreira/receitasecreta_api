package br.com.marcosferreira.receitasecreta.api.unit.models;

import br.com.marcosferreira.receitasecreta.api.BaseUnitTest;
import br.com.marcosferreira.receitasecreta.api.models.ProdutoModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import br.com.marcosferreira.receitasecreta.api.enums.UnidadeMedida;
import br.com.marcosferreira.receitasecreta.api.enums.CategoriaProduto;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("ProdutoModel Unit Tests")
class ProdutoModelTest extends BaseUnitTest {

    private ProdutoModel produtoModel;
    private UUID produtoId;
    private String userId;
    private LocalDateTime now;

    @BeforeEach
    void setUp() {
        produtoId = UUID.randomUUID();
        userId = "test-user-id";
        now = LocalDateTime.now();
        
        produtoModel = new ProdutoModel();
    }

    @Test
    @DisplayName("Should create ProdutoModel with default constructor")
    void shouldCreateProdutoModelWithDefaultConstructor() {
        // When
        ProdutoModel produto = new ProdutoModel();

        // Then
        assertThat(produto).isNotNull();
        assertThat(produto.getProdutoId()).isNull();
        assertThat(produto.getNome()).isNull();
        assertThat(produto.getUnidademedida()).isNull();
        assertThat(produto.getCustoporunidade()).isNull();
        assertThat(produto.getCategoriaproduto()).isNull();
        assertThat(produto.getFornecedor()).isNull();
        assertThat(produto.getDescricao()).isNull();
        assertThat(produto.getCodigobarras()).isNull();
        assertThat(produto.getDataCriacao()).isNull();
        assertThat(produto.getDataAlteracao()).isNull();
        assertThat(produto.getUserId()).isNull();
        assertThat(produto.getCreatedBy()).isNull();
        assertThat(produto.getCreatedAt()).isNull();
        assertThat(produto.getUpdatedBy()).isNull();
        assertThat(produto.getUpdatedAt()).isNull();
    }

    @Test
    @DisplayName("Should set and get produtoId correctly")
    void shouldSetAndGetProdutoIdCorrectly() {
        // When
        produtoModel.setProdutoId(produtoId);

        // Then
        assertThat(produtoModel.getProdutoId()).isEqualTo(produtoId);
    }

    @Test
    @DisplayName("Should set and get nome correctly")
    void shouldSetAndGetNomeCorrectly() {
        // Given
        String nome = "Produto Teste";

        // When
        produtoModel.setNome(nome);

        // Then
        assertThat(produtoModel.getNome()).isEqualTo(nome);
    }

    @Test
    @DisplayName("Should set and get unidademedida correctly")
    void shouldSetAndGetUnidademedidaCorrectly() {
        // Given
        UnidadeMedida unidademedida = UnidadeMedida.KILO;

        // When
        produtoModel.setUnidademedida(unidademedida);

        // Then
        assertThat(produtoModel.getUnidademedida()).isEqualTo(unidademedida);
    }

    @Test
    @DisplayName("Should set and get custoporunidade correctly")
    void shouldSetAndGetCustoporunidadeCorrectly() {
        // Given
        BigDecimal custo = new BigDecimal("10.50");

        // When
        produtoModel.setCustoporunidade(custo);

        // Then
        assertThat(produtoModel.getCustoporunidade()).isEqualTo(custo);
    }

    @Test
    @DisplayName("Should set and get categoriaproduto correctly")
    void shouldSetAndGetCategoriaprodutoCorrectly() {
        // Given
        CategoriaProduto categoria = CategoriaProduto.INGREDIENTE_SECO;

        // When
        produtoModel.setCategoriaproduto(categoria);

        // Then
        assertThat(produtoModel.getCategoriaproduto()).isEqualTo(categoria);
    }

    @Test
    @DisplayName("Should set and get fornecedor correctly")
    void shouldSetAndGetFornecedorCorrectly() {
        // Given
        String fornecedor = "Fornecedor Teste";

        // When
        produtoModel.setFornecedor(fornecedor);

        // Then
        assertThat(produtoModel.getFornecedor()).isEqualTo(fornecedor);
    }

    @Test
    @DisplayName("Should set and get descricao correctly")
    void shouldSetAndGetDescricaoCorrectly() {
        // Given
        String descricao = "Descrição do produto teste";

        // When
        produtoModel.setDescricao(descricao);

        // Then
        assertThat(produtoModel.getDescricao()).isEqualTo(descricao);
    }

    @Test
    @DisplayName("Should set and get codigobarras correctly")
    void shouldSetAndGetCodigobarrasCorrectly() {
        // Given
        String codigobarras = "1234567890123";

        // When
        produtoModel.setCodigobarras(codigobarras);

        // Then
        assertThat(produtoModel.getCodigobarras()).isEqualTo(codigobarras);
    }

    @Test
    @DisplayName("Should set and get dataCriacao correctly")
    void shouldSetAndGetDataCriacaoCorrectly() {
        // When
        produtoModel.setDataCriacao(now);

        // Then
        assertThat(produtoModel.getDataCriacao()).isEqualTo(now);
    }

    @Test
    @DisplayName("Should set and get dataAlteracao correctly")
    void shouldSetAndGetDataAlteracaoCorrectly() {
        // When
        produtoModel.setDataAlteracao(now);

        // Then
        assertThat(produtoModel.getDataAlteracao()).isEqualTo(now);
    }

    @Test
    @DisplayName("Should set and get userId correctly")
    void shouldSetAndGetUserIdCorrectly() {
        // When
        produtoModel.setUserId(userId);

        // Then
        assertThat(produtoModel.getUserId()).isEqualTo(userId);
    }

    @Test
    @DisplayName("Should set and get createdBy correctly")
    void shouldSetAndGetCreatedByCorrectly() {
        // Given
        String createdBy = "testuser";

        // When
        produtoModel.setCreatedBy(createdBy);

        // Then
        assertThat(produtoModel.getCreatedBy()).isEqualTo(createdBy);
    }

    @Test
    @DisplayName("Should set and get createdAt correctly")
    void shouldSetAndGetCreatedAtCorrectly() {
        // When
        produtoModel.setCreatedAt(now);

        // Then
        assertThat(produtoModel.getCreatedAt()).isEqualTo(now);
    }

    @Test
    @DisplayName("Should set and get updatedBy correctly")
    void shouldSetAndGetUpdatedByCorrectly() {
        // Given
        String updatedBy = "updateuser";

        // When
        produtoModel.setUpdatedBy(updatedBy);

        // Then
        assertThat(produtoModel.getUpdatedBy()).isEqualTo(updatedBy);
    }

    @Test
    @DisplayName("Should set and get updatedAt correctly")
    void shouldSetAndGetUpdatedAtCorrectly() {
        // When
        produtoModel.setUpdatedAt(now);

        // Then
        assertThat(produtoModel.getUpdatedAt()).isEqualTo(now);
    }

    @Test
    @DisplayName("Should create complete ProdutoModel with all fields")
    void shouldCreateCompleteProdutoModelWithAllFields() {
        // Given
        String nome = "Produto Completo";
        UnidadeMedida unidademedida = UnidadeMedida.LITRO;
        BigDecimal custo = new BigDecimal("25.99");
        CategoriaProduto categoria = CategoriaProduto.BEBIDA_LACTEA;
        String fornecedor = "Fornecedor ABC";
        String descricao = "Produto de alta qualidade";
        String codigobarras = "9876543210987";
        String createdBy = "admin";
        String updatedBy = "manager";
        LocalDateTime createdAt = now.minusDays(1);
        LocalDateTime updatedAt = now;
        LocalDateTime dataCriacao = now.minusDays(1);
        LocalDateTime dataAlteracao = now;

        // When
        produtoModel.setProdutoId(produtoId);
        produtoModel.setNome(nome);
        produtoModel.setUnidademedida(unidademedida);
        produtoModel.setCustoporunidade(custo);
        produtoModel.setCategoriaproduto(categoria);
        produtoModel.setFornecedor(fornecedor);
        produtoModel.setDescricao(descricao);
        produtoModel.setCodigobarras(codigobarras);
        produtoModel.setDataCriacao(dataCriacao);
        produtoModel.setDataAlteracao(dataAlteracao);
        produtoModel.setUserId(userId);
        produtoModel.setCreatedBy(createdBy);
        produtoModel.setCreatedAt(createdAt);
        produtoModel.setUpdatedBy(updatedBy);
        produtoModel.setUpdatedAt(updatedAt);

        // Then
        assertThat(produtoModel.getProdutoId()).isEqualTo(produtoId);
        assertThat(produtoModel.getNome()).isEqualTo(nome);
        assertThat(produtoModel.getUnidademedida()).isEqualTo(unidademedida);
        assertThat(produtoModel.getCustoporunidade()).isEqualTo(custo);
        assertThat(produtoModel.getCategoriaproduto()).isEqualTo(categoria);
        assertThat(produtoModel.getFornecedor()).isEqualTo(fornecedor);
        assertThat(produtoModel.getDescricao()).isEqualTo(descricao);
        assertThat(produtoModel.getCodigobarras()).isEqualTo(codigobarras);
        assertThat(produtoModel.getDataCriacao()).isEqualTo(dataCriacao);
        assertThat(produtoModel.getDataAlteracao()).isEqualTo(dataAlteracao);
        assertThat(produtoModel.getUserId()).isEqualTo(userId);
        assertThat(produtoModel.getCreatedBy()).isEqualTo(createdBy);
        assertThat(produtoModel.getCreatedAt()).isEqualTo(createdAt);
        assertThat(produtoModel.getUpdatedBy()).isEqualTo(updatedBy);
        assertThat(produtoModel.getUpdatedAt()).isEqualTo(updatedAt);
    }

    @Test
    @DisplayName("Should handle null values correctly")
    void shouldHandleNullValuesCorrectly() {
        // When
        produtoModel.setProdutoId(null);
        produtoModel.setNome(null);
        produtoModel.setUnidademedida(null);
        produtoModel.setCustoporunidade(null);
        produtoModel.setCategoriaproduto(null);
        produtoModel.setFornecedor(null);
        produtoModel.setDescricao(null);
        produtoModel.setCodigobarras(null);
        produtoModel.setDataCriacao(null);
        produtoModel.setDataAlteracao(null);
        produtoModel.setUserId(null);
        produtoModel.setCreatedBy(null);
        produtoModel.setCreatedAt(null);
        produtoModel.setUpdatedBy(null);
        produtoModel.setUpdatedAt(null);

        // Then
        assertThat(produtoModel.getProdutoId()).isNull();
        assertThat(produtoModel.getNome()).isNull();
        assertThat(produtoModel.getUnidademedida()).isNull();
        assertThat(produtoModel.getCustoporunidade()).isNull();
        assertThat(produtoModel.getCategoriaproduto()).isNull();
        assertThat(produtoModel.getFornecedor()).isNull();
        assertThat(produtoModel.getDescricao()).isNull();
        assertThat(produtoModel.getCodigobarras()).isNull();
        assertThat(produtoModel.getDataCriacao()).isNull();
        assertThat(produtoModel.getDataAlteracao()).isNull();
        assertThat(produtoModel.getUserId()).isNull();
        assertThat(produtoModel.getCreatedBy()).isNull();
        assertThat(produtoModel.getCreatedAt()).isNull();
        assertThat(produtoModel.getUpdatedBy()).isNull();
        assertThat(produtoModel.getUpdatedAt()).isNull();
    }

    @Test
    @DisplayName("Should handle BigDecimal precision correctly")
    void shouldHandleBigDecimalPrecisionCorrectly() {
        // Given
        BigDecimal custo1 = new BigDecimal("10.50");
        BigDecimal custo2 = new BigDecimal("10.500");

        // When
        produtoModel.setCustoporunidade(custo1);

        // Then
        assertThat(produtoModel.getCustoporunidade()).isEqualTo(custo1);
        assertThat(produtoModel.getCustoporunidade().compareTo(custo2)).isEqualTo(0);
    }
}