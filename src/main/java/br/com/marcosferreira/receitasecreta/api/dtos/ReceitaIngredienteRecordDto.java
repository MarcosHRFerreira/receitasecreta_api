package br.com.marcosferreira.receitasecreta.api.dtos;

import br.com.marcosferreira.receitasecreta.api.enums.UnidadeMedida;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;


import java.util.UUID;

public record ReceitaIngredienteRecordDto(

        @Schema(description = "Id do Produto", example = "65a9c0e3-c939-4290-bbd8-931893ca1ca9")
        @NotNull(message = "Id do Produto Obrigatório")
        UUID produtoId,
        @Schema(description = "Quantide do  Produto", example = "5")
        @NotNull(message = "Quantidade do Produto Obrigatório")
        Integer quantidade,
        @Schema(description = "Unidade de Medida", example = "GRAMA")
        @NotNull(message = "Unidade de Medida Obrigatório")
        UnidadeMedida unidadeMedida
) {
}
