package br.com.marcosferreira.receitasecreta.api.dtos.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ReceitaIngredienteDeleteRecordDto(

        @Schema(description = "Id do Produto", example = "65a9c0e3-c939-4290-bbd8-931893ca1ca9")
        @NotNull(message = "Id do Produto Obrigatório")
        UUID produtoId

) {
}
