package br.com.marcosferreira.receitasecreta.api.dtos.request;

import java.util.List;
import java.util.UUID;

public record ReceitaIngredienteDto(
        UUID receitaId,
        List<ReceitaIngredienteRecordDto> ingredientes
) {
}
