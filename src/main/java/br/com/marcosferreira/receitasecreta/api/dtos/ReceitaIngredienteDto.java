package br.com.marcosferreira.receitasecreta.api.dtos;

import java.util.List;
import java.util.UUID;

public record ReceitaIngredienteDto(

        UUID receitaId,                           // ID da Receita
        List<ReceitaIngredienteRecordDto> ingredientes // Lista de Ingredientes

) {
}
