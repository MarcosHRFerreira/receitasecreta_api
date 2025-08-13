package br.com.marcosferreira.receitasecreta.api;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Classe base para testes de integração.
 * Configura TestContainers com PostgreSQL para testes de integração.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@ActiveProfiles("test")
public abstract class BaseIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("receitasecreta_test")
            .withUsername("test")
            .withPassword("test")
            .withReuse(true);

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
        
        // Configurações JPA para testes de integração
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
        registry.add("spring.jpa.show-sql", () -> "true");
        registry.add("spring.jpa.properties.hibernate.format_sql", () -> "true");
        
        // Desabilitar Redis para testes
        registry.add("spring.data.redis.host", () -> "");
        registry.add("spring.data.redis.port", () -> "");
        
        // JWT para testes
        registry.add("jwt.secret", () -> "test-secret-key-for-integration-testing");
        registry.add("jwt.expiration", () -> "3600000");
    }

    @BeforeEach
    void setUpIntegration() {
        // Configurações específicas para testes de integração
        setupIntegrationEnvironment();
    }

    /**
     * Método para configurar o ambiente de integração.
     * Pode ser sobrescrito pelas classes filhas se necessário.
     */
    protected void setupIntegrationEnvironment() {
        // Implementação padrão vazia
        // Classes filhas podem sobrescrever este método
    }

    /**
     * Método para limpeza após testes de integração.
     * Pode ser sobrescrito pelas classes filhas se necessário.
     */
    protected void tearDownIntegration() {
        // Implementação padrão vazia
        // Classes filhas podem sobrescrever este método
    }
}