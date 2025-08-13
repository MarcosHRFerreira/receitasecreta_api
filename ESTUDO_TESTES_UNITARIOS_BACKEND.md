# 📋 Estudo de Testes Unitários para Backend - Spring Boot

## 🎯 Objetivo
Implementar uma estratégia completa de testes unitários e de integração para o backend da aplicação **Receita Secreta**, garantindo qualidade, confiabilidade e manutenibilidade do código.

## 📊 Análise da Estrutura Atual

### 🔍 Estrutura do Projeto
```
BACKEND/src/
├── main/java/br/com/marcosferreira/receitasecreta/api/
│   ├── controllers/          # Controllers REST
│   ├── services/            # Lógica de negócio
│   ├── models/              # Entidades JPA
│   ├── repositories/        # Repositórios JPA
│   ├── dtos/               # Data Transfer Objects
│   ├── configs/            # Configurações
│   ├── security/           # Segurança e JWT
│   ├── exceptions/         # Tratamento de exceções
│   └── validations/        # Validadores customizados
└── test/                   # ⚠️ VAZIO - Precisa ser implementado
```

### 🛠️ Tecnologias Identificadas
- **Spring Boot 3.4.4** com Java 21
- **Spring Data JPA** para persistência
- **Spring Security** com JWT
- **PostgreSQL** como banco de dados
- **Maven** para gerenciamento de dependências
- **JUnit 5** e **Mockito** (já incluídos no spring-boot-starter-test)

## 📋 TAREFAS DE IMPLEMENTAÇÃO

### 🏗️ **TAREFA 1: Configuração Inicial dos Testes**

#### 1.1 Atualizar dependências no pom.xml
- [ ] Adicionar TestContainers para testes de integração com PostgreSQL
- [ ] Adicionar WireMock para mock de APIs externas
- [ ] Adicionar AssertJ para assertions mais fluentes
- [ ] Configurar plugin de cobertura de código (JaCoCo)

```xml
<!-- Adicionar ao pom.xml -->
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>junit-jupiter</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>postgresql</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>com.github.tomakehurst</groupId>
    <artifactId>wiremock-jre8</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.assertj</groupId>
    <artifactId>assertj-core</artifactId>
    <scope>test</scope>
</dependency>
```

#### 1.2 Criar estrutura de pastas de teste
- [ ] Criar `src/test/java/br/com/marcosferreira/receitasecreta/api/`
- [ ] Criar subpastas: `unit/`, `integration/`, `config/`
- [ ] Criar `src/test/resources/` para arquivos de configuração de teste

#### 1.3 Configurar profiles de teste
- [ ] Criar `application-test.yaml` para configurações específicas de teste
- [ ] Configurar banco H2 em memória para testes unitários
- [ ] Configurar TestContainers para testes de integração

### 🧪 **TAREFA 2: Testes Unitários - Camada de Domínio (Models)**

#### 2.1 Testes para ReceitaModel
- [ ] Testar construtores e builders
- [ ] Testar getters e setters
- [ ] Testar validações de campos obrigatórios
- [ ] Testar enums (CategoriaReceita, Dificuldade)
- [ ] Testar serialização/deserialização JSON
- [ ] Testar campos de auditoria (createdAt, updatedAt, etc.)

```java
// Exemplo de estrutura
@ExtendWith(MockitoExtension.class)
class ReceitaModelTest {
    
    @Test
    @DisplayName("Deve criar receita com dados válidos")
    void deveCriarReceitaComDadosValidos() {
        // Given
        var receita = new ReceitaModel();
        receita.setNomeReceita("Bolo de Chocolate");
        receita.setCategoria(CategoriaReceita.SOBREMESA);
        
        // When & Then
        assertThat(receita.getNomeReceita()).isEqualTo("Bolo de Chocolate");
        assertThat(receita.getCategoria()).isEqualTo(CategoriaReceita.SOBREMESA);
    }
}
```

#### 2.2 Testes para ProdutoModel
- [ ] Testar validações de categoria de produto
- [ ] Testar campos de auditoria
- [ ] Testar relacionamentos (se houver)

#### 2.3 Testes para User
- [ ] Testar criação de usuário
- [ ] Testar validações de email
- [ ] Testar roles e permissões
- [ ] Testar campos de auditoria de senha

### 🔧 **TAREFA 3: Testes Unitários - Camada de Serviço**

#### 3.1 Testes para ReceitaServiceImpl
- [ ] **Cenário: Salvar receita com sucesso**
  - Mock do repository
  - Mock do AuthenticationUtils
  - Verificar se campos de auditoria são preenchidos
  - Verificar se auditService é chamado

- [ ] **Cenário: Buscar receita por ID existente**
  - Mock do repository retornando receita
  - Verificar retorno correto

- [ ] **Cenário: Buscar receita por ID inexistente**
  - Mock do repository retornando null
  - Verificar se NotFoundException é lançada

- [ ] **Cenário: Atualizar receita própria**
  - Mock do repository e AuthenticationUtils
  - Verificar se campos são atualizados
  - Verificar se auditoria é registrada

- [ ] **Cenário: Tentar atualizar receita de outro usuário**
  - Mock retornando receita de outro usuário
  - Verificar se UnauthorizedException é lançada

```java
@ExtendWith(MockitoExtension.class)
class ReceitaServiceImplTest {
    
    @Mock
    private ReceitaRepository receitaRepository;
    
    @Mock
    private AuthenticationUtils authUtils;
    
    @Mock
    private AuditService auditService;
    
    @InjectMocks
    private ReceitaServiceImpl receitaService;
    
    @Test
    @DisplayName("Deve salvar receita com sucesso")
    void deveSalvarReceitaComSucesso() {
        // Given
        var dto = new ReceitaRecordDto("Bolo", "Misturar tudo", "30min", "8 porções", CategoriaReceita.SOBREMESA, Dificuldade.FACIL, null, null, false);
        var user = new User();
        user.setId("user123");
        user.setLogin("usuario@teste.com");
        
        when(authUtils.getCurrentUser()).thenReturn(user);
        when(receitaRepository.save(any(ReceitaModel.class))).thenAnswer(invocation -> invocation.getArgument(0));
        
        // When
        var result = receitaService.save(dto);
        
        // Then
        assertThat(result.getNomeReceita()).isEqualTo("Bolo");
        assertThat(result.getUserId()).isEqualTo("user123");
        assertThat(result.getCreatedBy()).isEqualTo("usuario@teste.com");
        assertThat(result.getCreatedAt()).isNotNull();
        
        verify(receitaRepository).save(any(ReceitaModel.class));
        verify(auditService).auditReceitaChange(anyString(), eq("CREATE"), eq("user123"));
    }
}
```

#### 3.2 Testes para ProdutoServiceImpl
- [ ] Implementar testes similares aos de ReceitaService
- [ ] Focar em validações específicas de produto

#### 3.3 Testes para AuthenticationService
- [ ] **Cenário: Login com credenciais válidas**
- [ ] **Cenário: Login com credenciais inválidas**
- [ ] **Cenário: Registro de novo usuário**
- [ ] **Cenário: Registro com email já existente**
- [ ] **Cenário: Geração de token JWT**

#### 3.4 Testes para PasswordResetService
- [ ] **Cenário: Solicitar reset de senha**
- [ ] **Cenário: Validar token válido**
- [ ] **Cenário: Validar token expirado**
- [ ] **Cenário: Reset de senha com token válido**

### 🌐 **TAREFA 4: Testes Unitários - Camada de Controller**

#### 4.1 Testes para ReceitaController
- [ ] **POST /receitas - Criar receita**
  - Teste com dados válidos (201 Created)
  - Teste com dados inválidos (400 Bad Request)
  - Teste sem autenticação (401 Unauthorized)

- [ ] **GET /receitas/{id} - Buscar receita**
  - Teste com ID existente (200 OK)
  - Teste com ID inexistente (404 Not Found)

- [ ] **PUT /receitas/{id} - Atualizar receita**
  - Teste de atualização própria (200 OK)
  - Teste de tentativa de atualização de receita alheia (403 Forbidden)

- [ ] **GET /receitas - Listar receitas**
  - Teste de listagem com paginação
  - Teste de listagem vazia

```java
@WebMvcTest(ReceitaController.class)
@Import(SecurityConfigurations.class)
class ReceitaControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private ReceitaService receitaService;
    
    @MockBean
    private TokenService tokenService;
    
    @Test
    @DisplayName("POST /receitas deve criar receita com sucesso")
    @WithMockUser
    void devecriarReceitaComSucesso() throws Exception {
        // Given
        var receita = new ReceitaModel();
        receita.setReceitaId(UUID.randomUUID());
        receita.setNomeReceita("Bolo de Chocolate");
        
        when(receitaService.save(any(ReceitaRecordDto.class))).thenReturn(receita);
        
        // When & Then
        mockMvc.perform(post("/receitas")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"nomeReceita\":\"Bolo de Chocolate\",\"modoPreparo\":\"Misturar tudo\",\"tempoPreparo\":\"30min\",\"rendimento\":\"8 porções\",\"categoria\":\"SOBREMESA\",\"dificuldade\":\"FACIL\",\"favorita\":false}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nomeReceita").value("Bolo de Chocolate"));
        
        verify(receitaService).save(any(ReceitaRecordDto.class));
    }
}
```

#### 4.2 Testes para AuthenticationController
- [ ] Teste de login
- [ ] Teste de registro
- [ ] Teste de refresh token
- [ ] Teste de logout

### 🔗 **TAREFA 5: Testes de Integração**

#### 5.1 Configurar TestContainers
- [ ] Criar classe base para testes de integração
- [ ] Configurar container PostgreSQL
- [ ] Configurar limpeza de dados entre testes

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
abstract class IntegrationTestBase {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");
    
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }
}
```

#### 5.2 Testes de Integração para Receitas
- [ ] **Fluxo completo: Criar → Buscar → Atualizar → Listar**
- [ ] **Teste de autorização: Usuário só acessa suas receitas**
- [ ] **Teste de paginação e ordenação**
- [ ] **Teste de validações de negócio**

#### 5.3 Testes de Integração para Autenticação
- [ ] **Fluxo de registro e login**
- [ ] **Teste de expiração de token**
- [ ] **Teste de refresh token**

### 🛡️ **TAREFA 6: Testes de Segurança**

#### 6.1 Testes de Autorização
- [ ] **Teste de acesso sem token**
- [ ] **Teste de acesso com token inválido**
- [ ] **Teste de acesso com token expirado**
- [ ] **Teste de tentativa de acesso a recursos de outros usuários**

#### 6.2 Testes de Validação
- [ ] **Teste de SQL Injection (através de validações)**
- [ ] **Teste de XSS em campos de texto**
- [ ] **Teste de validação de tamanho de campos**

### 📊 **TAREFA 7: Configuração de Cobertura de Código**

#### 7.1 Configurar JaCoCo
- [ ] Adicionar plugin JaCoCo ao pom.xml
- [ ] Configurar relatórios de cobertura
- [ ] Definir metas mínimas de cobertura (80%)

```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.8</version>
    <executions>
        <execution>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals>
                <goal>report</goal>
            </goals>
        </execution>
        <execution>
            <id>check</id>
            <goals>
                <goal>check</goal>
            </goals>
            <configuration>
                <rules>
                    <rule>
                        <element>CLASS</element>
                        <limits>
                            <limit>
                                <counter>LINE</counter>
                                <value>COVEREDRATIO</value>
                                <minimum>0.80</minimum>
                            </limit>
                        </limits>
                    </rule>
                </rules>
            </configuration>
        </execution>
    </executions>
</plugin>
```

### 🚀 **TAREFA 8: Automação e CI/CD**

#### 8.1 Scripts de Teste
- [ ] Criar script para executar todos os testes
- [ ] Criar script para executar apenas testes unitários
- [ ] Criar script para executar apenas testes de integração
- [ ] Configurar perfis Maven para diferentes tipos de teste

#### 8.2 Configuração para CI/CD
- [ ] Criar arquivo de configuração para GitHub Actions
- [ ] Configurar execução de testes em diferentes ambientes
- [ ] Configurar publicação de relatórios de cobertura

### 🧹 **TAREFA 9: Testes de Performance**

#### 9.1 Testes de Carga
- [ ] Criar testes de performance para endpoints críticos
- [ ] Testar comportamento com grande volume de dados
- [ ] Testar concorrência em operações de escrita

### 📝 **TAREFA 10: Documentação e Boas Práticas**

#### 10.1 Documentação
- [ ] Criar guia de como executar os testes
- [ ] Documentar padrões de nomenclatura de testes
- [ ] Criar exemplos de testes para novos desenvolvedores

#### 10.2 Boas Práticas
- [ ] Implementar padrão AAA (Arrange, Act, Assert)
- [ ] Usar nomes descritivos para testes
- [ ] Manter testes independentes
- [ ] Usar builders para criação de objetos de teste

## 🎯 Metas de Qualidade

### 📊 Cobertura de Código
- **Meta Mínima**: 80% de cobertura de linha
- **Meta Ideal**: 90% de cobertura de linha
- **Cobertura de Branch**: Mínimo 70%

### ⚡ Performance dos Testes
- **Testes Unitários**: < 5 segundos para toda a suíte
- **Testes de Integração**: < 30 segundos para toda a suíte
- **Testes Completos**: < 2 minutos

### 🔍 Qualidade dos Testes
- **Nomenclatura**: Nomes descritivos e em português
- **Organização**: Agrupamento lógico por funcionalidade
- **Manutenibilidade**: Testes fáceis de entender e modificar
- **Confiabilidade**: Testes determinísticos e estáveis

## 📅 Cronograma de Implementação

### **Semana 1: Fundação**
- Tarefas 1 e 2 (Configuração + Testes de Domínio)
- Configurar ambiente e estrutura básica

### **Semana 2: Serviços**
- Tarefa 3 (Testes de Serviço)
- Implementar testes para lógica de negócio

### **Semana 3: Controllers e Integração**
- Tarefas 4 e 5 (Controllers + Integração)
- Testes de API e fluxos completos

### **Semana 4: Segurança e Qualidade**
- Tarefas 6, 7 e 8 (Segurança + Cobertura + CI/CD)
- Finalização e automação

### **Semana 5: Performance e Documentação**
- Tarefas 9 e 10 (Performance + Documentação)
- Otimização e documentação final

## 🛠️ Ferramentas e Tecnologias

### 🧪 Testes
- **JUnit 5**: Framework de testes principal
- **Mockito**: Mocking e stubbing
- **AssertJ**: Assertions fluentes
- **TestContainers**: Testes de integração com banco real
- **WireMock**: Mock de APIs externas
- **Spring Boot Test**: Testes de contexto Spring

### 📊 Qualidade
- **JaCoCo**: Cobertura de código
- **SonarQube**: Análise estática de código
- **SpotBugs**: Detecção de bugs

### 🚀 Automação
- **Maven Surefire**: Execução de testes unitários
- **Maven Failsafe**: Execução de testes de integração
- **GitHub Actions**: CI/CD

## 💡 Benefícios Esperados

### 🔒 Qualidade
- **Redução de bugs**: Detecção precoce de problemas
- **Refatoração segura**: Confiança para modificar código
- **Documentação viva**: Testes como especificação

### 🚀 Produtividade
- **Desenvolvimento mais rápido**: Feedback imediato
- **Debugging facilitado**: Isolamento de problemas
- **Onboarding**: Novos desenvolvedores entendem o código

### 🛡️ Confiabilidade
- **Estabilidade**: Sistema mais robusto
- **Regressões**: Prevenção de quebras
- **Manutenibilidade**: Código mais limpo e organizados

---

## 📋 Checklist de Conclusão

- [ ] Todas as 10 tarefas principais implementadas
- [ ] Cobertura de código acima de 80%
- [ ] Testes executando em menos de 2 minutos
- [ ] CI/CD configurado e funcionando
- [ ] Documentação completa criada
- [ ] Equipe treinada nas práticas de teste

**🎉 Projeto de Testes Unitários Concluído com Sucesso!**