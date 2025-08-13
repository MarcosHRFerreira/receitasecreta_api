package br.com.marcosferreira.receitasecreta.api.integration;

import br.com.marcosferreira.receitasecreta.api.BaseIntegrationTest;
import br.com.marcosferreira.receitasecreta.api.dtos.request.ProdutoRecordDto;
import br.com.marcosferreira.receitasecreta.api.models.ProdutoModel;
import br.com.marcosferreira.receitasecreta.api.models.User;
import br.com.marcosferreira.receitasecreta.api.repositories.ProdutoRepository;
import br.com.marcosferreira.receitasecreta.api.repositories.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import br.com.marcosferreira.receitasecreta.api.enums.UnidadeMedida;
import br.com.marcosferreira.receitasecreta.api.enums.CategoriaProduto;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("ProdutoController Integration Tests")
class ProdutoControllerIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private UserRepository userRepository;

    private User testUser;
    private ProdutoModel testProduto;
    private ProdutoRecordDto produtoDto;

    @BeforeEach
    void setUp() {
        // Limpar repositórios
        produtoRepository.deleteAll();
        userRepository.deleteAll();

        // Criar usuário de teste
        testUser = new User();
        testUser.setId(UUID.randomUUID().toString());
        testUser.setLogin("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("password123");
        testUser.setCreatedAt(LocalDateTime.now());
        testUser = userRepository.save(testUser);

        // Criar produto de teste
        testProduto = new ProdutoModel();
        testProduto.setProdutoId(UUID.randomUUID());
        testProduto.setNome("Produto Teste");
        testProduto.setUnidademedida(UnidadeMedida.KILO);
        testProduto.setCustoporunidade(new BigDecimal("10.50"));
        testProduto.setCategoriaproduto(CategoriaProduto.INGREDIENTE_SECO);
        testProduto.setFornecedor("Fornecedor Teste");
        testProduto.setDescricao("Descrição do produto teste");
        testProduto.setCodigobarras("1234567890123");
        testProduto.setUserId(testUser.getId().toString());
        testProduto.setCreatedBy(testUser.getLogin());
        testProduto.setCreatedAt(LocalDateTime.now());
        testProduto.setDataCriacao(LocalDateTime.now());
        testProduto.setDataAlteracao(LocalDateTime.now());
        testProduto = produtoRepository.save(testProduto);

        // Criar DTO de teste
        produtoDto = new ProdutoRecordDto(
                "Novo Produto",
                UnidadeMedida.LITRO,
                new BigDecimal("15.75"),
                CategoriaProduto.BEBIDA_LACTEA,
                "Novo Fornecedor",
                "Nova descrição",
                "9876543210987",
                "Nova observação"
        );
    }

    @Test
    @DisplayName("Should create produto successfully")
    @WithMockUser(username = "testuser")
    void shouldCreateProdutoSuccessfully() throws Exception {
        // Given
        String jsonContent = objectMapper.writeValueAsString(produtoDto);

        // When & Then
        mockMvc.perform(post("/produtos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonContent))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.nome", is(produtoDto.nome())))
                .andExpect(jsonPath("$.unidademedida", is(produtoDto.unidademedida())))
                .andExpect(jsonPath("$.custoporunidade", is(produtoDto.custoporunidade().doubleValue())))
                .andExpect(jsonPath("$.categoriaproduto", is(produtoDto.categoriaproduto())))
                .andExpect(jsonPath("$.fornecedor", is(produtoDto.fornecedor())))
                .andExpect(jsonPath("$.descricao", is(produtoDto.descricao())))
                .andExpect(jsonPath("$.codigobarras", is(produtoDto.codigobarras())))
                .andExpect(jsonPath("$.produtoId", notNullValue()))
                .andExpect(jsonPath("$.dataCriacao", notNullValue()))
                .andExpect(jsonPath("$.dataAlteracao", notNullValue()));
    }

    @Test
    @DisplayName("Should return 400 when creating produto with invalid data")
    @WithMockUser(username = "testuser")
    void shouldReturn400WhenCreatingProdutoWithInvalidData() throws Exception {
        // Given
        ProdutoRecordDto invalidDto = new ProdutoRecordDto(
                "", // nome vazio
                UnidadeMedida.KILO,
                new BigDecimal("10.50"),
                CategoriaProduto.INGREDIENTE_SECO,
                "Fornecedor",
                "Descrição",
                "1234567890123",
                "Observação"
        );
        String jsonContent = objectMapper.writeValueAsString(invalidDto);

        // When & Then
        mockMvc.perform(post("/produtos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonContent))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should return 409 when creating produto with existing name")
    @WithMockUser(username = "testuser")
    void shouldReturn409WhenCreatingProdutoWithExistingName() throws Exception {
        // Given
        ProdutoRecordDto duplicateDto = new ProdutoRecordDto(
                testProduto.getNome(), // nome já existente
                UnidadeMedida.KILO,
                new BigDecimal("10.50"),
                CategoriaProduto.INGREDIENTE_SECO,
                "Fornecedor",
                "Descrição",
                "1234567890123",
                "Observação"
        );
        String jsonContent = objectMapper.writeValueAsString(duplicateDto);

        // When & Then
        mockMvc.perform(post("/produtos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonContent))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("Já existe um produto com esse Nome")));
    }

    @Test
    @DisplayName("Should find produto by ID successfully")
    @WithMockUser(username = "testuser")
    void shouldFindProdutoByIdSuccessfully() throws Exception {
        // When & Then
        mockMvc.perform(get("/produtos/{produtoId}", testProduto.getProdutoId()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.produtoId", is(testProduto.getProdutoId().toString())))
                .andExpect(jsonPath("$.nome", is(testProduto.getNome())))
                .andExpect(jsonPath("$.unidademedida", is(testProduto.getUnidademedida())))
                .andExpect(jsonPath("$.custoporunidade", is(testProduto.getCustoporunidade().doubleValue())))
                .andExpect(jsonPath("$.categoriaproduto", is(testProduto.getCategoriaproduto())))
                .andExpect(jsonPath("$.fornecedor", is(testProduto.getFornecedor())))
                .andExpect(jsonPath("$.descricao", is(testProduto.getDescricao())))
                .andExpect(jsonPath("$.codigobarras", is(testProduto.getCodigobarras())));
    }

    @Test
    @DisplayName("Should return 404 when produto not found by ID")
    @WithMockUser(username = "testuser")
    void shouldReturn404WhenProdutoNotFoundById() throws Exception {
        // Given
        UUID nonExistentId = UUID.randomUUID();

        // When & Then
        mockMvc.perform(get("/produtos/{produtoId}", nonExistentId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", containsString("Produto não existe")));
    }

    @Test
    @DisplayName("Should update produto successfully")
    @WithMockUser(username = "testuser")
    void shouldUpdateProdutoSuccessfully() throws Exception {
        // Given
        ProdutoRecordDto updateDto = new ProdutoRecordDto(
                "Produto Atualizado",
                UnidadeMedida.UNIDADE,
                new BigDecimal("25.99"),
                CategoriaProduto.LATICINIO,
                "Fornecedor Atualizado",
                "Descrição atualizada",
                "5555555555555",
                "Observação atualizada"
        );
        String jsonContent = objectMapper.writeValueAsString(updateDto);

        // When & Then
        mockMvc.perform(put("/produtos/{produtoId}", testProduto.getProdutoId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonContent))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.produtoId", is(testProduto.getProdutoId().toString())))
                .andExpect(jsonPath("$.nome", is(updateDto.nome())))
                .andExpect(jsonPath("$.unidademedida", is(updateDto.unidademedida())))
                .andExpect(jsonPath("$.custoporunidade", is(updateDto.custoporunidade().doubleValue())))
                .andExpect(jsonPath("$.categoriaproduto", is(updateDto.categoriaproduto())))
                .andExpect(jsonPath("$.fornecedor", is(updateDto.fornecedor())))
                .andExpect(jsonPath("$.descricao", is(updateDto.descricao())))
                .andExpect(jsonPath("$.codigobarras", is(updateDto.codigobarras())));
    }

    @Test
    @DisplayName("Should return 404 when updating non-existent produto")
    @WithMockUser(username = "testuser")
    void shouldReturn404WhenUpdatingNonExistentProduto() throws Exception {
        // Given
        UUID nonExistentId = UUID.randomUUID();
        String jsonContent = objectMapper.writeValueAsString(produtoDto);

        // When & Then
        mockMvc.perform(put("/produtos/{produtoId}", nonExistentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonContent))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", containsString("não existe")));
    }

    @Test
    @DisplayName("Should return 403 when updating produto from different user")
    @WithMockUser(username = "differentuser")
    void shouldReturn403WhenUpdatingProdutoFromDifferentUser() throws Exception {
        // Given
        String jsonContent = objectMapper.writeValueAsString(produtoDto);

        // When & Then
        mockMvc.perform(put("/produtos/{produtoId}", testProduto.getProdutoId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonContent))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", containsString("não tem permissão")));
    }

    @Test
    @DisplayName("Should list all produtos with pagination")
    @WithMockUser(username = "testuser")
    void shouldListAllProdutosWithPagination() throws Exception {
        // When & Then
        mockMvc.perform(get("/produtos")
                        .param("page", "0")
                        .param("size", "10")
                        .param("sort", "nome,asc"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.content", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.content[0].produtoId", notNullValue()))
                .andExpect(jsonPath("$.content[0].nome", notNullValue()))
                .andExpect(jsonPath("$.totalElements", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.totalPages", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.size", is(10)))
                .andExpect(jsonPath("$.number", is(0)));
    }

    @Test
    @DisplayName("Should return empty page when no produtos exist")
    @WithMockUser(username = "testuser")
    void shouldReturnEmptyPageWhenNoProdutosExist() throws Exception {
        // Given
        produtoRepository.deleteAll();

        // When & Then
        mockMvc.perform(get("/produtos")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.content", hasSize(0)))
                .andExpect(jsonPath("$.totalElements", is(0)))
                .andExpect(jsonPath("$.totalPages", is(0)))
                .andExpect(jsonPath("$.size", is(10)))
                .andExpect(jsonPath("$.number", is(0)));
    }

    @Test
    @DisplayName("Should return 401 when not authenticated")
    void shouldReturn401WhenNotAuthenticated() throws Exception {
        // When & Then
        mockMvc.perform(get("/produtos"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/produtos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(produtoDto)))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/produtos/{produtoId}", testProduto.getProdutoId()))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(put("/produtos/{produtoId}", testProduto.getProdutoId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(produtoDto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should handle malformed JSON gracefully")
    @WithMockUser(username = "testuser")
    void shouldHandleMalformedJsonGracefully() throws Exception {
        // Given
        String malformedJson = "{\"nome\": \"Produto\", \"custoporunidade\": \"invalid_number\"}";

        // When & Then
        mockMvc.perform(post("/produtos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(malformedJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should validate required fields")
    @WithMockUser(username = "testuser")
    void shouldValidateRequiredFields() throws Exception {
        // Given
        ProdutoRecordDto invalidDto = new ProdutoRecordDto(
                null, // nome obrigatório
                null, // unidademedida obrigatória
                null, // custoporunidade obrigatório
                null, // categoriaproduto obrigatória
                "Fornecedor",
                "Descrição",
                "1234567890123",
                "Observação"
        );
        String jsonContent = objectMapper.writeValueAsString(invalidDto);

        // When & Then
        mockMvc.perform(post("/produtos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonContent))
                .andExpect(status().isBadRequest());
    }
}