package br.com.marcosferreira.receitasecreta.api.unit.controllers;

import br.com.marcosferreira.receitasecreta.api.BaseUnitTest;
import br.com.marcosferreira.receitasecreta.api.controllers.ProdutoController;
import br.com.marcosferreira.receitasecreta.api.dtos.request.ProdutoRecordDto;
import br.com.marcosferreira.receitasecreta.api.enums.CategoriaProduto;
import br.com.marcosferreira.receitasecreta.api.enums.UnidadeMedida;
import br.com.marcosferreira.receitasecreta.api.models.ProdutoModel;
import br.com.marcosferreira.receitasecreta.api.services.ProdutoService;
import br.com.marcosferreira.receitasecreta.api.validations.ProdutoValidator;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Nested;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Testes unitários para ProdutoController.
 * Testa os endpoints HTTP e a integração com o serviço.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ProdutoController Tests")
class ProdutoControllerTest {

    @Mock
    private ProdutoService produtoService;

    @Mock
    private ProdutoValidator produtoValidator;

    @InjectMocks
    private ProdutoController produtoController;

    private ProdutoModel produto;
    private ProdutoRecordDto produtoRecordDto;
    private UUID produtoId;
    private String userId;

    @BeforeEach
    void setUpController() {
        produtoId = UUID.randomUUID();
        userId = "user123";

        // Setup ProdutoModel
        produto = new ProdutoModel();
        produto.setProdutoId(produtoId);
        produto.setNome("Leite Integral");
        produto.setUnidademedida(UnidadeMedida.LITRO);
        produto.setCustoporunidade(new BigDecimal("5.50"));
        produto.setCategoriaproduto(CategoriaProduto.BEBIDA_LACTEA);
        produto.setFornecedor("Italac");
        produto.setDescricao("Leite Integral Italac");
        produto.setCodigobarras("11122233344");
        produto.setUserId(userId);
        produto.setCreatedBy(userId);
        produto.setCreatedAt(LocalDateTime.now());
        produto.setDataCriacao(LocalDateTime.now());
        produto.setDataAlteracao(LocalDateTime.now());

        // Setup ProdutoRecordDto
        produtoRecordDto = new ProdutoRecordDto(
            "Leite Integral",
            UnidadeMedida.LITRO,
            new BigDecimal("5.50"),
            CategoriaProduto.BEBIDA_LACTEA,
            "Italac",
            "Leite Integral Italac",
            "11122233344",
            "Após aberto utilizar em até 3 dias"
        );
    }

    @Nested
    @DisplayName("POST /produtos - Criar Produto")
    class CriarProduto {

        @Test
        @DisplayName("Deve criar produto com sucesso")
        void deveCriarProdutoComSucesso() throws Exception {
            // Arrange
            when(produtoService.save(any(ProdutoRecordDto.class))).thenReturn(produto);

            // Act
            ResponseEntity<Object> response = produtoController.save(produtoRecordDto, null);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            assertThat(response.getBody()).isNotNull();
            ProdutoModel responseBody = (ProdutoModel) response.getBody();
            assertThat(responseBody.getNome()).isEqualTo("Leite Integral");
            assertThat(responseBody.getUnidademedida()).isEqualTo(UnidadeMedida.LITRO);
            assertThat(responseBody.getCustoporunidade()).isEqualTo(new BigDecimal("5.50"));
            assertThat(responseBody.getCategoriaproduto()).isEqualTo(CategoriaProduto.BEBIDA_LACTEA);
            assertThat(responseBody.getFornecedor()).isEqualTo("Italac");

            verify(produtoService).save(any(ProdutoRecordDto.class));
        }

        @Test
        @DisplayName("Deve retornar erro 400 com dados inválidos")
        void deveRetornarErro400ComDadosInvalidos() throws Exception {
            // Arrange
            ProdutoRecordDto produtoInvalido = new ProdutoRecordDto(
                "", // Nome vazio
                null, // Unidade nula
                null, // Custo nulo
                null, // Categoria nula
                "", // Fornecedor vazio
                "", // Descrição vazia
                null,
                null
            );
            when(produtoService.save(any(ProdutoRecordDto.class))).thenThrow(new IllegalArgumentException("Dados inválidos"));

            // Act & Assert
            assertThrows(IllegalArgumentException.class, () -> {
                produtoController.save(produtoInvalido, null);
            });

            verify(produtoService).save(any(ProdutoRecordDto.class));
        }
    }

    @Nested
    @DisplayName("GET /produtos/{id} - Buscar Produto")
    class BuscarProduto {

        @Test
        @DisplayName("Deve buscar produto por ID com sucesso")
        void deveBuscarProdutoPorIdComSucesso() throws Exception {
            // Arrange
            when(produtoService.findByProdutoId(produtoId)).thenReturn(produto);

            // Act
            ResponseEntity<Object> response = produtoController.getOne(produtoId);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            ProdutoModel responseBody = (ProdutoModel) response.getBody();
            assertThat(responseBody.getNome()).isEqualTo("Leite Integral");
            assertThat(responseBody.getProdutoId()).isEqualTo(produtoId);

            verify(produtoService).findByProdutoId(produtoId);
        }

        @Test
        @DisplayName("Deve lançar exceção para produto inexistente")
        void deveLancarExcecaoParaProdutoInexistente() throws Exception {
            // Arrange
            UUID produtoIdInexistente = UUID.randomUUID();
            when(produtoService.findByProdutoId(produtoIdInexistente))
                .thenThrow(new RuntimeException("Produto não encontrado"));

            // Act & Assert
            assertThrows(RuntimeException.class, () -> {
                produtoController.getOne(produtoIdInexistente);
            });

            verify(produtoService).findByProdutoId(produtoIdInexistente);
        }
    }

    @Nested
    @DisplayName("PUT /produtos/{id} - Atualizar Produto")
    class AtualizarProduto {

        @Test
        @DisplayName("Deve atualizar produto com sucesso")
        void deveAtualizarProdutoComSucesso() throws Exception {
            // Arrange
            ProdutoModel produtoAtualizado = new ProdutoModel();
            produtoAtualizado.setProdutoId(produtoId);
            produtoAtualizado.setNome("Leite Desnatado");
            produtoAtualizado.setUnidademedida(UnidadeMedida.LITRO);
            produtoAtualizado.setCustoporunidade(new BigDecimal("4.50"));
            produtoAtualizado.setCategoriaproduto(CategoriaProduto.BEBIDA_LACTEA);
            produtoAtualizado.setFornecedor("Italac");
            produtoAtualizado.setDescricao("Leite Desnatado Italac");

            when(produtoService.update(any(ProdutoRecordDto.class), eq(produtoId)))
                .thenReturn(produtoAtualizado);

            ProdutoRecordDto produtoAtualizadoDto = new ProdutoRecordDto(
                "Leite Desnatado",
                UnidadeMedida.LITRO,
                new BigDecimal("4.50"),
                CategoriaProduto.BEBIDA_LACTEA,
                "Italac",
                "Leite Desnatado Italac",
                "11122233344",
                "Produto desnatado"
            );

            // Act
            ResponseEntity<Object> response = produtoController.update(produtoId, produtoAtualizadoDto);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            ProdutoModel responseBody = (ProdutoModel) response.getBody();
            assertThat(responseBody.getNome()).isEqualTo("Leite Desnatado");
            assertThat(responseBody.getCustoporunidade()).isEqualTo(new BigDecimal("4.50"));

            verify(produtoService).update(any(ProdutoRecordDto.class), eq(produtoId));
        }
    }

    @Nested
    @DisplayName("GET /produtos - Listar Produtos")
    class ListarProdutos {

        @Test
        @DisplayName("Deve listar produtos com paginação")
        void deveListarProdutosComPaginacao() throws Exception {
            // Arrange
            List<ProdutoModel> produtos = Arrays.asList(produto);
            Page<ProdutoModel> produtosPage = new PageImpl<>(produtos, PageRequest.of(0, 10), 1);
            
            when(produtoService.findAll(any(Pageable.class))).thenReturn(produtosPage);

            // Act
            ResponseEntity<Object> response = produtoController.getAll(PageRequest.of(0, 10));

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            @SuppressWarnings("unchecked")
            Page<ProdutoModel> responseBody = (Page<ProdutoModel>) response.getBody();
            assertThat(responseBody.getContent()).hasSize(1);
            assertThat(responseBody.getContent().get(0).getNome()).isEqualTo("Leite Integral");
            assertThat(responseBody.getTotalElements()).isEqualTo(1);
            assertThat(responseBody.getTotalPages()).isEqualTo(1);

            verify(produtoService).findAll(any(Pageable.class));
        }

        @Test
        @DisplayName("Deve retornar lista vazia quando não há produtos")
        void deveRetornarListaVaziaQuandoNaoHaProdutos() throws Exception {
            // Arrange
            Page<ProdutoModel> produtosVazios = new PageImpl<>(Arrays.asList(), PageRequest.of(0, 10), 0);
            when(produtoService.findAll(any(Pageable.class))).thenReturn(produtosVazios);

            // Act
            ResponseEntity<Object> response = produtoController.getAll(PageRequest.of(0, 10));

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            @SuppressWarnings("unchecked")
            Page<ProdutoModel> responseBody = (Page<ProdutoModel>) response.getBody();
            assertThat(responseBody.getContent()).isEmpty();
            assertThat(responseBody.getTotalElements()).isEqualTo(0);

            verify(produtoService).findAll(any(Pageable.class));
        }

        @Test
        @DisplayName("Deve retornar 401 em caso de erro de autenticação")
        void deveRetornar401EmCasoDeErroDeAutenticacao() throws Exception {
            // Arrange
            when(produtoService.findAll(any(Pageable.class)))
                .thenThrow(new RuntimeException("Erro de autenticação"));

            // Act
            ResponseEntity<Object> response = produtoController.getAll(PageRequest.of(0, 10));

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            @SuppressWarnings("unchecked")
            java.util.Map<String, String> responseBody = (java.util.Map<String, String>) response.getBody();
            assertThat(responseBody.get("message")).isEqualTo("Credenciais inválidas. Verifique seu login e senha.");

            verify(produtoService).findAll(any(Pageable.class));
        }
    }

    @Nested
    @DisplayName("Testes de Integração com ResponseEntity")
    class TestesIntegracaoResponseEntity {

        @Test
        @DisplayName("Deve retornar ResponseEntity correto ao criar produto")
        void deveRetornarResponseEntityCorretoAoCriarProduto() {
            // Arrange
            when(produtoService.save(produtoRecordDto)).thenReturn(produto);

            // Act
            ResponseEntity<Object> response = produtoController.save(produtoRecordDto, null);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody()).isInstanceOf(ProdutoModel.class);
            ProdutoModel responseBody = (ProdutoModel) response.getBody();
            assertThat(responseBody.getProdutoId()).isEqualTo(produtoId);
            assertThat(responseBody.getNome()).isEqualTo("Leite Integral");

            verify(produtoService).save(produtoRecordDto);
        }

        @Test
        @DisplayName("Deve retornar ResponseEntity correto ao buscar produto")
        void deveRetornarResponseEntityCorretoAoBuscarProduto() {
            // Arrange
            when(produtoService.findByProdutoId(produtoId)).thenReturn(produto);

            // Act
            ResponseEntity<Object> response = produtoController.getOne(produtoId);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            ProdutoModel responseBody = (ProdutoModel) response.getBody();
            assertThat(responseBody.getProdutoId()).isEqualTo(produtoId);
            assertThat(responseBody.getNome()).isEqualTo("Leite Integral");

            verify(produtoService).findByProdutoId(produtoId);
        }

        @Test
        @DisplayName("Deve retornar ResponseEntity correto ao atualizar produto")
        void deveRetornarResponseEntityCorretoAoAtualizarProduto() {
            // Arrange
            when(produtoService.update(any(ProdutoRecordDto.class), eq(produtoId))).thenReturn(produto);

            // Act
            ResponseEntity<Object> response = produtoController.update(produtoId, produtoRecordDto);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            ProdutoModel responseBody = (ProdutoModel) response.getBody();
            assertThat(responseBody.getProdutoId()).isEqualTo(produtoId);
            assertThat(responseBody.getNome()).isEqualTo("Leite Integral");

            verify(produtoService).update(any(ProdutoRecordDto.class), eq(produtoId));
        }

        @Test
        @DisplayName("Deve retornar ResponseEntity correto ao listar produtos")
        void deveRetornarResponseEntityCorretoAoListarProdutos() {
            // Arrange
            List<ProdutoModel> produtos = Arrays.asList(produto);
            Page<ProdutoModel> produtosPage = new PageImpl<>(produtos, PageRequest.of(0, 10), 1);
            when(produtoService.findAll(any(Pageable.class))).thenReturn(produtosPage);

            // Act
            ResponseEntity<Object> response = produtoController.getAll(PageRequest.of(0, 10));

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            @SuppressWarnings("unchecked")
            Page<ProdutoModel> responseBody = (Page<ProdutoModel>) response.getBody();
            assertThat(responseBody.getContent()).hasSize(1);
            assertThat(responseBody.getContent().get(0).getNome()).isEqualTo("Leite Integral");

            verify(produtoService).findAll(any(Pageable.class));
        }
    }
}