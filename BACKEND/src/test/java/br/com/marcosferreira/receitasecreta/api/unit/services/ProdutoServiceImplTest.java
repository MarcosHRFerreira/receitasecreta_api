package br.com.marcosferreira.receitasecreta.api.unit.services;

import br.com.marcosferreira.receitasecreta.api.configs.AuthenticationUtils;
import br.com.marcosferreira.receitasecreta.api.dtos.request.ProdutoRecordDto;
import br.com.marcosferreira.receitasecreta.api.exceptions.NoValidException;
import br.com.marcosferreira.receitasecreta.api.exceptions.NotFoundException;
import br.com.marcosferreira.receitasecreta.api.exceptions.UnauthorizedException;
import br.com.marcosferreira.receitasecreta.api.models.ProdutoModel;
import br.com.marcosferreira.receitasecreta.api.models.User;
import br.com.marcosferreira.receitasecreta.api.repositories.ProdutoRepository;
import br.com.marcosferreira.receitasecreta.api.services.AuditService;
import br.com.marcosferreira.receitasecreta.api.services.impl.ProdutoServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.UUID;
import br.com.marcosferreira.receitasecreta.api.enums.UnidadeMedida;
import br.com.marcosferreira.receitasecreta.api.enums.CategoriaProduto;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import org.mockito.ArgumentMatchers;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProdutoServiceImpl Unit Tests")
class ProdutoServiceImplTest {

    @Mock
    private ProdutoRepository produtoRepository;

    @Mock
    private AuthenticationUtils authUtils;

    @Mock
    private AuditService auditService;

    private ProdutoServiceImpl produtoService;

    private User mockUser;
    private ProdutoModel mockProduto;
    private ProdutoRecordDto mockProdutoDto;
    private UUID produtoId;
    private String userId;

    @BeforeEach
    void setUp() throws Exception {
        MockitoAnnotations.openMocks(this);
        
        // Criar manualmente o ProdutoServiceImpl com os mocks
        produtoService = new ProdutoServiceImpl(produtoRepository);
        
        // Usar reflection para injetar os mocks
        java.lang.reflect.Field authUtilsField = ProdutoServiceImpl.class.getDeclaredField("authUtils");
        authUtilsField.setAccessible(true);
        authUtilsField.set(produtoService, authUtils);
        
        java.lang.reflect.Field auditServiceField = ProdutoServiceImpl.class.getDeclaredField("auditService");
        auditServiceField.setAccessible(true);
         auditServiceField.set(produtoService, auditService);
         
         produtoId = UUID.randomUUID();
        userId = "test-user-id";

        mockUser = new User();
        mockUser.setId(userId);
        mockUser.setLogin("testuser");

        mockProduto = new ProdutoModel();
        mockProduto.setProdutoId(produtoId);
        mockProduto.setNome("Produto Teste");
        mockProduto.setUnidademedida(UnidadeMedida.KILO);
        mockProduto.setCustoporunidade(new BigDecimal("10.50"));
        mockProduto.setCategoriaproduto(CategoriaProduto.INGREDIENTE_SECO);
        mockProduto.setFornecedor("Fornecedor Teste");
        mockProduto.setDescricao("Descrição do produto teste");
        mockProduto.setCodigobarras("1234567890123");
        mockProduto.setUserId(userId);
        mockProduto.setCreatedBy("testuser");
        mockProduto.setCreatedAt(LocalDateTime.now());
        mockProduto.setDataCriacao(LocalDateTime.now());
        mockProduto.setDataAlteracao(LocalDateTime.now());

        mockProdutoDto = new ProdutoRecordDto(
                "Produto Teste",
                UnidadeMedida.KILO,
                new BigDecimal("10.50"),
                CategoriaProduto.INGREDIENTE_SECO,
                "Fornecedor Teste",
                "Descrição do produto teste",
                "1234567890123",
                "Observação teste"
        );
        
        System.out.println("Setup completed");
    }


    
    @Test
    @DisplayName("Should save produto successfully")
    void shouldSaveProdutoSuccessfully() {
        // Given
        when(authUtils.getCurrentUser()).thenReturn(mockUser);
        when(produtoRepository.findByNome("Produto Teste")).thenReturn(null);
        
        // Configurar o mock para retornar o objeto passado com ID definido
        when(produtoRepository.save(any(ProdutoModel.class))).thenAnswer(invocation -> {
            ProdutoModel produto = invocation.getArgument(0);
            produto.setProdutoId(produtoId);
            return produto;
        });
        doNothing().when(auditService).auditProdutoChange(anyString(), anyString(), anyString());

        // When
        ProdutoModel result = produtoService.save(mockProdutoDto);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getProdutoId()).isEqualTo(produtoId);
        assertThat(result.getNome()).isEqualTo("Produto Teste");
        assertThat(result.getUserId()).isEqualTo(userId);
        assertThat(result.getCreatedBy()).isEqualTo("testuser");
        
        verify(produtoRepository).findByNome("Produto Teste");
        verify(produtoRepository).save(any(ProdutoModel.class));
        verify(auditService).auditProdutoChange(produtoId.toString(), "CREATE", userId);
    }

    @Test
    @DisplayName("Should throw NoValidException when produto name already exists")
    void shouldThrowNoValidExceptionWhenProdutoNameAlreadyExists() {
        // Given
        when(authUtils.getCurrentUser()).thenReturn(mockUser);
        when(produtoRepository.findByNome(anyString())).thenReturn(mockProduto);

        // When & Then
        assertThatThrownBy(() -> produtoService.save(mockProdutoDto))
                .isInstanceOf(NoValidException.class)
                .hasMessageContaining("Já existe um produto com esse Nome");

        verify(produtoRepository).findByNome(mockProdutoDto.nome());
        verify(produtoRepository, never()).save(any(ProdutoModel.class));
        verify(auditService, never()).auditProdutoChange(anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("Should find produto by ID successfully")
    void shouldFindProdutoByIdSuccessfully() {
        // Given
        when(produtoRepository.findByProdutoId(produtoId)).thenReturn(mockProduto);

        // When
        ProdutoModel result = produtoService.findByProdutoId(produtoId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getProdutoId()).isEqualTo(produtoId);
        assertThat(result.getNome()).isEqualTo("Produto Teste");

        verify(produtoRepository).findByProdutoId(produtoId);
    }

    @Test
    @DisplayName("Should throw NotFoundException when produto not found by ID")
    void shouldThrowNotFoundExceptionWhenProdutoNotFoundById() {
        // Given
        when(produtoRepository.findByProdutoId(produtoId)).thenReturn(null);

        // When & Then
        assertThatThrownBy(() -> produtoService.findByProdutoId(produtoId))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Erro: Produto não existe.");

        verify(produtoRepository).findByProdutoId(produtoId);
    }

    @Test
    @DisplayName("Should return null when produto name not found")
    void shouldReturnNullWhenProdutoNameNotFound() {
        // Given
        String nome = "Produto Inexistente";
        when(produtoRepository.findByNome(nome)).thenReturn(null);

        // When
        ProdutoModel result = produtoService.findByNome(nome);

        // Then
        assertThat(result).isNull();
        verify(produtoRepository).findByNome(nome);
    }

    @Test
    @DisplayName("Should throw NoValidException when produto name exists")
    void shouldThrowNoValidExceptionWhenProdutoNameExists() {
        // Given
        String nome = "Produto Existente";
        when(produtoRepository.findByNome(nome)).thenReturn(mockProduto);

        // When & Then
        assertThatThrownBy(() -> produtoService.findByNome(nome))
                .isInstanceOf(NoValidException.class)
                .hasMessageContaining("Já existe um produto com esse Nome");

        verify(produtoRepository).findByNome(nome);
    }

    @Test
    @DisplayName("Should update produto successfully")
    void shouldUpdateProdutoSuccessfully() {
        // Given
        ProdutoRecordDto updateDto = new ProdutoRecordDto(
                "Produto Atualizado",
                UnidadeMedida.UNIDADE,
                new BigDecimal("15.75"),
                CategoriaProduto.LATICINIO,
                "Novo Fornecedor",
                "Nova descrição",
                "9876543210987",
                "Nova observação"
        );

        when(authUtils.getCurrentUser()).thenReturn(mockUser);
        when(produtoRepository.findByProdutoId(produtoId)).thenReturn(mockProduto);
        when(produtoRepository.findByNome(updateDto.nome())).thenReturn(null);
        when(produtoRepository.save(any(ProdutoModel.class))).thenReturn(mockProduto);
        doNothing().when(auditService).auditProdutoChange(anyString(), anyString(), anyString());

        // When
        ProdutoModel result = produtoService.update(updateDto, produtoId);

        // Then
        assertThat(result).isNotNull();
        verify(produtoRepository).findByProdutoId(produtoId);
        verify(produtoRepository).findByNome(updateDto.nome());
        verify(produtoRepository).save(any(ProdutoModel.class));
        verify(auditService).auditProdutoChange(eq(produtoId.toString()), eq("UPDATE"), anyString());
    }

    @Test
    @DisplayName("Should throw NotFoundException when updating non-existent produto")
    void shouldThrowNotFoundExceptionWhenUpdatingNonExistentProduto() {
        // Given
        when(produtoRepository.findByProdutoId(produtoId)).thenReturn(null);

        // When & Then
        assertThatThrownBy(() -> produtoService.update(mockProdutoDto, produtoId))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("não existe");

        verify(produtoRepository).findByProdutoId(produtoId);
        verify(produtoRepository, never()).save(any(ProdutoModel.class));
        verify(auditService, never()).auditProdutoChange(anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("Should throw UnauthorizedException when user is not owner")
    void shouldThrowUnauthorizedExceptionWhenUserIsNotOwner() {
        // Given
        UUID differentUserId = UUID.randomUUID();
        User differentUser = new User();
        differentUser.setId(differentUserId.toString());
        differentUser.setLogin("differentuser");

        when(authUtils.getCurrentUser()).thenReturn(differentUser);
        when(produtoRepository.findByProdutoId(produtoId)).thenReturn(mockProduto);
        doNothing().when(auditService).auditUnauthorizedAccess(anyString(), anyString(), anyString());

        // When & Then
        assertThatThrownBy(() -> produtoService.update(mockProdutoDto, produtoId))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Você não tem permissão para alterar este produto");

        verify(produtoRepository).findByProdutoId(produtoId);
        verify(auditService).auditUnauthorizedAccess("PRODUTO_" + produtoId, differentUserId.toString(), "UPDATE");
        verify(produtoRepository, never()).save(any(ProdutoModel.class));
    }

    @Test
    @DisplayName("Should throw NoValidException when updating with existing name")
    void shouldThrowNoValidExceptionWhenUpdatingWithExistingName() {
        // Given
        UUID anotherProdutoId = UUID.randomUUID();
        ProdutoModel anotherProduto = new ProdutoModel();
        anotherProduto.setProdutoId(anotherProdutoId);
        anotherProduto.setNome("Produto Existente");

        ProdutoRecordDto updateDto = new ProdutoRecordDto(
                "Produto Existente",
                UnidadeMedida.UNIDADE,
                new BigDecimal("15.75"),
                CategoriaProduto.BEBIDA_LACTEA,
                "Fornecedor",
                "Descrição",
                "1234567890123",
                "Observação"
        );

        when(authUtils.getCurrentUser()).thenReturn(mockUser);
        when(produtoRepository.findByProdutoId(produtoId)).thenReturn(mockProduto);
        when(produtoRepository.findByNome(updateDto.nome())).thenReturn(anotherProduto);

        // When & Then
        assertThatThrownBy(() -> produtoService.update(updateDto, produtoId))
                .isInstanceOf(NoValidException.class)
                .hasMessage("Nome do produto, já existe cadastrado para outro produto");

        verify(produtoRepository).findByProdutoId(produtoId);
        verify(produtoRepository).findByNome(updateDto.nome());
        verify(produtoRepository, never()).save(any(ProdutoModel.class));
    }

    @Test
    @DisplayName("Should find all produtos with pagination")
    void shouldFindAllProdutosWithPagination() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<ProdutoModel> expectedPage = new PageImpl<>(Arrays.asList(mockProduto), pageable, 1);
        when(produtoRepository.findAll(pageable)).thenReturn(expectedPage);

        // When
        Page<ProdutoModel> result = produtoService.findAll(pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0)).isEqualTo(mockProduto);
        assertThat(result.getTotalElements()).isEqualTo(1);

        verify(produtoRepository).findAll(pageable);
    }

    @Test
    @DisplayName("Should find all produtos with empty result")
    void shouldFindAllProdutosWithEmptyResult() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<ProdutoModel> emptyPage = new PageImpl<>(Arrays.asList(), pageable, 0);
        when(produtoRepository.findAll(pageable)).thenReturn(emptyPage);

        // When
        Page<ProdutoModel> result = produtoService.findAll(pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).isEmpty();
        assertThat(result.getTotalElements()).isEqualTo(0);

        verify(produtoRepository).findAll(pageable);
    }
}