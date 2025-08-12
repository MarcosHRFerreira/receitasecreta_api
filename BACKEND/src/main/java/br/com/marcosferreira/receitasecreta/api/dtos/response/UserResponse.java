package br.com.marcosferreira.receitasecreta.api.dtos.response;

import br.com.marcosferreira.receitasecreta.api.enums.UserRole;

public record UserResponse(
        String token,
        UserData user
) {
    public record UserData(
            String id,
            String username,
            String email,
            UserRole role
    ) {}
}
