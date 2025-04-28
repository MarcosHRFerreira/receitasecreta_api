package br.com.marcosferreira.receitasecreta.api.dtos;

import java.util.List;
import java.util.UUID;

public record ReceitaIngredienteDeleteDto(
        UUID receitaId,
        List<ReceitaIngredienteDeleteRecordDto> ingredientes
) {
}
