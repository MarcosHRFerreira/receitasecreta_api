package br.com.marcosferreira.receitasecreta.api;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

/**
 * Classe base para testes unitários.
 * Fornece configurações comuns para todos os testes unitários.
 */
@ExtendWith(MockitoExtension.class)
@SpringJUnitConfig
@ActiveProfiles("test")
public abstract class BaseUnitTest {

    @BeforeEach
    void setUp() {
        // Configurações comuns para todos os testes unitários
        setupCommonMocks();
    }

    /**
     * Método para configurar mocks comuns.
     * Pode ser sobrescrito pelas classes filhas se necessário.
     */
    protected void setupCommonMocks() {
        // Implementação padrão vazia
        // Classes filhas podem sobrescrever este método
    }

    /**
     * Método para limpeza após cada teste.
     * Pode ser sobrescrito pelas classes filhas se necessário.
     */
    protected void tearDown() {
        // Implementação padrão vazia
        // Classes filhas podem sobrescrever este método
    }
}