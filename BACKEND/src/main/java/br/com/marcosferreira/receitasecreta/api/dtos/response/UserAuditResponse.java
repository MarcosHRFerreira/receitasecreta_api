package br.com.marcosferreira.receitasecreta.api.dtos.response;

import java.time.LocalDateTime;

public record UserAuditResponse(
        String id,
        String login,
        String email,
        LocalDateTime createdAt,
        LocalDateTime passwordChangedAt,
        String passwordChangedBy
) {
}