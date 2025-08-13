package br.com.marcosferreira.receitasecreta.api.configs;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaAuditing
public class JpaAuditConfig {

    @Bean
    public AuditInterceptor auditInterceptor() {
        return new AuditInterceptor();
    }
}