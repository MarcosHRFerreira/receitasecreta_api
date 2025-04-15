package br.com.marcosferreira.receitasecreta.api.dtos;

import br.com.marcosferreira.receitasecreta.api.enums.UnidadeMedida;


import java.util.UUID;

public record ReceitaIngredienteRecordDto(
        UUID receitaId,           // ID da Receita
        UUID produtoId,       // ID do Ingrediente
        Integer quantidade,
        UnidadeMedida unidadeMedida
) {
}
