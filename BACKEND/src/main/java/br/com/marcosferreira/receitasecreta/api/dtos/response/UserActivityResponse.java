package br.com.marcosferreira.receitasecreta.api.dtos.response;

import java.time.LocalDateTime;

public record UserActivityResponse(
        String userId,
        String login,
        LocalDateTime createdAt,
        LocalDateTime lastPasswordChange,
        Long receitasCount,
        Long produtosCount
) {
}