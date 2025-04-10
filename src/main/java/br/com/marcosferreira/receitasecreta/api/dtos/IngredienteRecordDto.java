package br.com.marcosferreira.receitasecreta.api.dtos;

import br.com.marcosferreira.receitasecreta.api.enums.UnidadeMedida;


import java.util.UUID;

public record IngredienteRecordDto(
        UUID ingredienteId,
        String nome,
        UnidadeMedida unidadeMedida,
        Integer quantidade,
        UUID produtoId

) {
}
