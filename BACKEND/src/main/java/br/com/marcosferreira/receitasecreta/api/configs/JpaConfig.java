package br.com.marcosferreira.receitasecreta.api.configs;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableJpaRepositories(basePackages = "br.com.marcosferreira.receitasecreta.api.repositories")
@EntityScan(basePackages = "br.com.marcosferreira.receitasecreta.api.models")
@EnableTransactionManagement
public class JpaConfig {
    // Configuração JPA simplificada - deixando o Spring Boot configurar automaticamente
}