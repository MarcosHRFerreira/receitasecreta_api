package br.com.marcosferreira.receitasecreta.api.dtos.request;

import java.util.List;
import java.util.UUID;

public record ReceitaIngredienteDeleteDto(
        UUID receitaId,
        List<ReceitaIngredienteDeleteRecordDto> ingredientes
) {
}
