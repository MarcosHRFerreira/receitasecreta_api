package br.com.marcosferreira.receitasecreta.api.dtos.request;


import br.com.marcosferreira.receitasecreta.api.enums.UserRole;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record UserRequest(
        @Schema(description = "Login do Usuário", example = "Manuel")
        @NotBlank(message = "Login do Usuário Obrigatório ")
        String login,
        @Schema(description = "Password Usuário", example = "Edrfx@#s3")
        @NotBlank(message = "Password do Usuário Obrigatório ")
        String password,
        UserRole role) {
}
