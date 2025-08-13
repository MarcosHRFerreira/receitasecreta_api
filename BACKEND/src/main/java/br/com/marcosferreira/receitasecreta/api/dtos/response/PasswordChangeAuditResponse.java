package br.com.marcosferreira.receitasecreta.api.dtos.response;

import java.time.LocalDateTime;

public record PasswordChangeAuditResponse(
        String userId,
        String login,
        LocalDateTime passwordChangedAt,
        String passwordChangedBy
) {
}